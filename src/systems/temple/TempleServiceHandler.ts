import { Character } from '../../entities/Character';
import { GameState } from '../../types/GameTypes';
import { TempleService, ResurrectionResult, ResurrectionOutcome } from '../../types/TempleTypes';
import { DiceRoller } from '../../utils/DiceRoller';
import { GAME_CONFIG } from '../../config/GameConstants';

export interface ServiceExecutionResult {
  success: boolean;
  message: string;
  goldSpent: number;
  resurrectionResult?: ResurrectionResult;
}

export class TempleServiceHandler {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public executeService(
    service: TempleService,
    character: Character,
    cost: number
  ): ServiceExecutionResult {
    if (this.gameState.party.gold < cost) {
      return {
        success: false,
        message: 'Insufficient gold for this service.',
        goldSpent: 0
      };
    }

    this.gameState.party.gold -= cost;

    switch (service) {
      case 'cure_paralyzed':
        return this.cureParalyzed(character, cost);
      case 'cure_stoned':
        return this.cureStoned(character, cost);
      case 'resurrect_dead':
        return this.resurrectFromDead(character, cost);
      case 'resurrect_ashes':
        return this.resurrectFromAshes(character, cost);
      case 'dispel_curse':
        return this.dispelCurse(character, cost);
      default:
        return {
          success: false,
          message: 'Unknown service requested.',
          goldSpent: 0
        };
    }
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
      0.95,
      baseChance + vitalityBonus * 0.01 + levelBonus
    );

    const roll = DiceRoller.rollPercentile();
    const success = roll <= successChance * 100;

    let resurrectionResult: ResurrectionResult;
    let outcome: ResurrectionOutcome;

    if (success) {
      character.status = 'OK';
      character.isDead = false;
      character.hp = 1;

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
        hpRestored: 1,
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
      return {
        success: false,
        message: `${character.name} is not in ashes.`,
        goldSpent: cost
      };
    }

    const vitalityBonus = Math.floor(
      character.stats.vitality / GAME_CONFIG.DEATH_SYSTEM.VITALITY_BONUS_DIVISOR
    );
    const baseChance = GAME_CONFIG.DEATH_SYSTEM.BASE_SURVIVAL_CHANCE * 0.5;
    const successChance = Math.max(
      GAME_CONFIG.DEATH_SYSTEM.MIN_SURVIVAL_CHANCE,
      baseChance + vitalityBonus * 0.005
    );

    const roll = DiceRoller.rollPercentile();
    const success = roll <= successChance * 100;

    let resurrectionResult: ResurrectionResult;
    let outcome: ResurrectionOutcome;

    if (success) {
      character.status = 'OK';
      character.isDead = false;
      character.hp = 1;

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
        hpRestored: 1,
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