import { ICharacter, Item, CharacterStatus } from '../types/GameTypes';
import { DebugLogger } from '../utils/DebugLogger';

export class EquipmentModifierManager {
  private static instance: EquipmentModifierManager;

  private constructor() {}

  public static getInstance(): EquipmentModifierManager {
    if (!EquipmentModifierManager.instance) {
      EquipmentModifierManager.instance = new EquipmentModifierManager();
    }
    return EquipmentModifierManager.instance;
  }

  public applyEquipmentModifiers(character: ICharacter, item: Item, isEquipping: boolean): void {
    if (!item.effects || item.effects.length === 0) {
      return;
    }

    const multiplier = isEquipping ? 1 : -1;

    for (const effect of item.effects) {
      switch (effect.type) {
        case 'stat':
          if (effect.target && effect.target in character.stats) {
            const statKey = effect.target;
            character.stats[statKey] += effect.value * multiplier;
            DebugLogger.info('EquipmentModifierManager', `${isEquipping ? 'Applied' : 'Removed'} ${effect.value} ${effect.target} ${isEquipping ? 'from' : 'to'} ${item.name}`, {
              character: character.name,
              item: item.name
            });
          }
          break;

        case 'evasion':
          character.evasion += effect.value * multiplier;
          DebugLogger.info('EquipmentModifierManager', `${isEquipping ? 'Applied' : 'Removed'} ${effect.value} evasion ${isEquipping ? 'from' : 'to'} ${item.name}`, {
            character: character.name,
            item: item.name
          });
          break;

        case 'damageReduction':
          character.damageReduction += effect.value * multiplier;
          DebugLogger.info('EquipmentModifierManager', `${isEquipping ? 'Applied' : 'Removed'} ${effect.value} damage reduction ${isEquipping ? 'from' : 'to'} ${item.name}`, {
            character: character.name,
            item: item.name
          });
          break;
      }
    }
  }

  public getEquipmentResistances(character: ICharacter): CharacterStatus[] {
    const resistances: CharacterStatus[] = [];

    Object.values(character.equipment).forEach((item) => {
      if (item && item.resistances) {
        resistances.push(...item.resistances);
      }
    });

    return resistances;
  }

  public getEquipmentResistanceChance(character: ICharacter, effectType: CharacterStatus): number {
    let totalResistance = 0;

    Object.values(character.equipment).forEach((item) => {
      if (item && item.resistances && item.resistances.includes(effectType)) {
        const resistanceBonus = item.resistanceBonus !== undefined ? item.resistanceBonus : 30;
        totalResistance += resistanceBonus;
      }
    });

    return Math.min(totalResistance, 95);
  }
}
