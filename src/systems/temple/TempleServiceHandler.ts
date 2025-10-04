import { Character } from '../../entities/Character';
import { TempleService, ResurrectionResult, ResurrectionOutcome, ServiceExecutionResult } from '../../types/TempleTypes';
import { DiceRoller } from '../../utils/DiceRoller';
import { DebugLogger } from '../../utils/DebugLogger';
import { GAME_CONFIG } from '../../config/GameConstants';

export class TempleServiceHandler {
  constructor() {
  }

  private deductGoldWithPooling(payer: Character, cost: number, allCharacters: Character[]): void {
    let remaining = cost;
    const goldUsed: { name: string; amount: number }[] = [];

    if (payer.gold >= remaining) {
      payer.gold -= remaining;
      goldUsed.push({ name: payer.name, amount: remaining });
      DebugLogger.info('TempleService', `Gold payment complete from payer only`, {
        payer: payer.name,
        cost,
        goldUsed
      });
      return;
    }

    goldUsed.push({ name: payer.name, amount: payer.gold });
    remaining -= payer.gold;
    payer.gold = 0;

    for (const char of allCharacters) {
      if (char === payer) continue;
      if (remaining <= 0) break;

      if (char.gold >= remaining) {
        char.gold -= remaining;
        goldUsed.push({ name: char.name, amount: remaining });
        remaining = 0;
        break;
      } else {
        if (char.gold > 0) {
          goldUsed.push({ name: char.name, amount: char.gold });
        }
        remaining -= char.gold;
        char.gold = 0;
      }
    }

    DebugLogger.info('TempleService', `Gold pooled from multiple characters`, {
      cost,
      goldUsed,
      remainingUnpaid: remaining > 0 ? remaining : 0
    });
  }

  public executeService(
    service: TempleService,
    character: Character,
    payer: Character,
    cost: number,
    allCharacters: Character[]
  ): ServiceExecutionResult {
    const totalGold = allCharacters.reduce((sum, char) => sum + char.gold, 0);

    DebugLogger.info('TempleService', `Executing service: ${service}`, {
      service,
      character: character.name,
      characterLevel: character.level,
      payer: payer.name,
      cost,
      totalPartyGold: totalGold
    });

    if (totalGold < cost) {
      DebugLogger.warn('TempleService', 'Insufficient party gold for service', {
        needed: cost,
        available: totalGold
      });
      return {
        success: false,
        message: `Party does not have enough gold. Need ${cost}g, have ${totalGold}g.`,
        goldSpent: 0
      };
    }

    this.deductGoldWithPooling(payer, cost, allCharacters);

    let result: ServiceExecutionResult;
    switch (service) {
      case 'cure_paralyzed':
        result = this.cureParalyzed(character, cost);
        break;
      case 'cure_stoned':
        result = this.cureStoned(character, cost);
        break;
      case 'resurrect_dead':
        result = this.resurrectFromDead(character, cost);
        break;
      case 'resurrect_ashes':
        result = this.resurrectFromAshes(character, cost);
        break;
      case 'dispel_curse':
        result = this.dispelCurse(character, cost);
        break;
      default:
        result = {
          success: false,
          message: 'Unknown service requested.',
          goldSpent: 0
        };
    }

    DebugLogger.info('TempleService', `Service complete: ${service}`, {
      success: result.success,
      message: result.message,
      goldSpent: result.goldSpent,
      resurrectionResult: result.resurrectionResult
    });

    return result;
  }

  private cureParalyzed(character: Character, cost: number): ServiceExecutionResult {
    if (character.status !== 'Paralyzed') {
      return {
        success: false,
        message: `${character.name} is not paralyzed.`,
        goldSpent: cost
      };
    }

    character.status = 'OK';

    return {
      success: true,
      message: `${character.name} has been cured of paralysis!`,
      goldSpent: cost
    };
  }

  private cureStoned(character: Character, cost: number): ServiceExecutionResult {
    if (character.status !== 'Stoned') {
      return {
        success: false,
        message: `${character.name} is not petrified.`,
        goldSpent: cost
      };
    }

    character.status = 'OK';

    return {
      success: true,
      message: `${character.name} has been restored from stone!`,
      goldSpent: cost
    };
  }

  private resurrectFromDead(character: Character, cost: number): ServiceExecutionResult {
    if (character.status !== 'Dead') {
      DebugLogger.warn('TempleService', 'Invalid resurrection attempt - character not dead', {
        character: character.name,
        status: character.status
      });
      return {
        success: false,
        message: `${character.name} is not dead.`,
        goldSpent: cost
      };
    }

    const vitalityBonus = Math.floor(
      character.stats.vitality / GAME_CONFIG.DEATH_SYSTEM.VITALITY_BONUS_DIVISOR
    );
    const levelBonus = character.level * GAME_CONFIG.DEATH_SYSTEM.LEVEL_BONUS_MULTIPLIER;
    const baseChance = GAME_CONFIG.DEATH_SYSTEM.BASE_SURVIVAL_CHANCE;
    const successChance = Math.min(
      GAME_CONFIG.TEMPLE.RESURRECTION.MAX_SUCCESS_CHANCE,
      baseChance + vitalityBonus * GAME_CONFIG.TEMPLE.RESURRECTION.VITALITY_BONUS_MULTIPLIER_DEAD + levelBonus
    );

    const roll = DiceRoller.rollPercentile();
    const success = roll <= successChance * 100;

    DebugLogger.info('TempleService', 'Resurrection from dead attempt', {
      character: character.name,
      vitality: character.stats.vitality,
      vitalityBonus,
      levelBonus,
      baseChance,
      successChance,
      roll,
      success
    });

    let resurrectionResult: ResurrectionResult;
    let outcome: ResurrectionOutcome;

    if (success) {
      character.status = 'OK';
      character.isDead = false;
      character.hp = GAME_CONFIG.TEMPLE.RESURRECTION.HP_RESTORED_ON_SUCCESS;

      const vitalityLoss = GAME_CONFIG.DEATH_SYSTEM.VITALITY_LOSS_ON_DEATH;
      character.stats.vitality = Math.max(
        GAME_CONFIG.CHARACTER.STAT_MIN,
        character.stats.vitality - vitalityLoss
      );
      character.age += GAME_CONFIG.DEATH_SYSTEM.AGE_INCREASE_ON_DEATH;

      outcome = 'success';
      resurrectionResult = {
        outcome,
        vitalityLost: vitalityLoss,
        hpRestored: GAME_CONFIG.TEMPLE.RESURRECTION.HP_RESTORED_ON_SUCCESS,
        message: `${character.name} has been resurrected! (VT -${vitalityLoss})`
      };

      return {
        success: true,
        message: resurrectionResult.message,
        goldSpent: cost,
        resurrectionResult
      };
    } else {
      character.status = 'Ashed';
      const vitalityLoss = GAME_CONFIG.DEATH_SYSTEM.VITALITY_LOSS_ON_ASH;
      character.stats.vitality = Math.max(
        GAME_CONFIG.CHARACTER.STAT_MIN,
        character.stats.vitality - vitalityLoss
      );
      character.age += GAME_CONFIG.DEATH_SYSTEM.AGE_INCREASE_ON_ASH;

      outcome = 'turned_to_ashes';
      resurrectionResult = {
        outcome,
        vitalityLost: vitalityLoss,
        hpRestored: 0,
        message: `The resurrection failed! ${character.name} has turned to ashes! (VT -${vitalityLoss})`
      };

      return {
        success: false,
        message: resurrectionResult.message,
        goldSpent: cost,
        resurrectionResult
      };
    }
  }

  private resurrectFromAshes(character: Character, cost: number): ServiceExecutionResult {
    if (character.status !== 'Ashed') {
      DebugLogger.warn('TempleService', 'Invalid resurrection attempt - character not ashed', {
        character: character.name,
        status: character.status
      });
      return {
        success: false,
        message: `${character.name} is not in ashes.`,
        goldSpent: cost
      };
    }

    const vitalityBonus = Math.floor(
      character.stats.vitality / GAME_CONFIG.DEATH_SYSTEM.VITALITY_BONUS_DIVISOR
    );
    const baseChance = GAME_CONFIG.DEATH_SYSTEM.BASE_SURVIVAL_CHANCE * GAME_CONFIG.TEMPLE.RESURRECTION.ASHES_BASE_CHANCE_MULTIPLIER;
    const successChance = Math.max(
      GAME_CONFIG.DEATH_SYSTEM.MIN_SURVIVAL_CHANCE,
      baseChance + vitalityBonus * GAME_CONFIG.TEMPLE.RESURRECTION.VITALITY_BONUS_MULTIPLIER_ASHES
    );

    const roll = DiceRoller.rollPercentile();
    const success = roll <= successChance * 100;

    DebugLogger.info('TempleService', 'Resurrection from ashes attempt', {
      character: character.name,
      vitality: character.stats.vitality,
      vitalityBonus,
      baseChance,
      successChance,
      roll,
      success
    });

    let resurrectionResult: ResurrectionResult;
    let outcome: ResurrectionOutcome;

    if (success) {
      character.status = 'OK';
      character.isDead = false;
      character.hp = GAME_CONFIG.TEMPLE.RESURRECTION.HP_RESTORED_ON_SUCCESS;

      const vitalityLoss = GAME_CONFIG.DEATH_SYSTEM.VITALITY_LOSS_ON_ASH;
      character.stats.vitality = Math.max(
        GAME_CONFIG.CHARACTER.STAT_MIN,
        character.stats.vitality - vitalityLoss
      );
      character.age += GAME_CONFIG.DEATH_SYSTEM.AGE_INCREASE_ON_ASH;

      outcome = 'success';
      resurrectionResult = {
        outcome,
        vitalityLost: vitalityLoss,
        hpRestored: GAME_CONFIG.TEMPLE.RESURRECTION.HP_RESTORED_ON_SUCCESS,
        message: `${character.name} has been restored from ashes! (VT -${vitalityLoss})`
      };

      return {
        success: true,
        message: resurrectionResult.message,
        goldSpent: cost,
        resurrectionResult
      };
    } else {
      character.status = 'Lost';
      character.isDead = true;

      outcome = 'lost';
      resurrectionResult = {
        outcome,
        vitalityLost: 0,
        hpRestored: 0,
        message: `The resurrection failed! ${character.name} has been lost forever!`
      };

      return {
        success: false,
        message: resurrectionResult.message,
        goldSpent: cost,
        resurrectionResult
      };
    }
  }

  private dispelCurse(character: Character, cost: number): ServiceExecutionResult {
    if (!character.equipment) {
      return {
        success: false,
        message: `${character.name} has no equipment.`,
        goldSpent: cost
      };
    }

    let cursedItemsFound = 0;
    let cursedItemsRemoved = 0;

    for (const slot in character.equipment) {
      const item = character.equipment[slot as keyof typeof character.equipment];
      if (item && item.cursed) {
        cursedItemsFound++;
        item.cursed = false;
        cursedItemsRemoved++;
      }
    }

    if (cursedItemsFound === 0) {
      return {
        success: false,
        message: `${character.name} has no cursed items equipped.`,
        goldSpent: cost
      };
    }

    return {
      success: true,
      message: `Removed curses from ${cursedItemsRemoved} item${cursedItemsRemoved !== 1 ? 's' : ''} on ${character.name}!`,
      goldSpent: cost
    };
  }
}