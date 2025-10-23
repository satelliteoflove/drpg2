import { Item, ItemEffect, Monster } from '../types/GameTypes';
import { monstersData } from '../data/monsters/monstersData';
import { itemsData } from '../data/items/itemsData';
import { encountersData } from '../data/encounters/encountersData';
import { DebugLogger } from './DebugLogger';

export class DataLoader {
  // Static data is loaded at module load time
  private static monsters = monstersData;
  private static items = itemsData;
  private static encounters = encountersData;

  public static loadMonsters(): Record<string, any> {
    return this.monsters;
  }

  public static loadItems(): Record<string, any> {
    return this.items;
  }

  public static loadEncounters(level: number): any {
    const levelKey = `level${level}` as keyof typeof encountersData;

    if (!(levelKey in this.encounters)) {
      DebugLogger.warn('DataLoader', `No encounter data for level ${level}, using level 1`);
      return this.encounters.level1;
    }

    return this.encounters[levelKey];
  }

  public static createItemInstance(itemId: string): Item | null {
    const itemTemplate = this.items[itemId as keyof typeof itemsData];

    if (!itemTemplate) {
      DebugLogger.error('DataLoader', `Item not found: ${itemId}`);
      return null;
    }

    // Create a deep copy of the item
    const item: Item = {
      id: itemTemplate.id,
      name: itemTemplate.name,
      unidentifiedName: itemTemplate.unidentifiedName || '?Item',
      type: itemTemplate.type as Item['type'],
      value: itemTemplate.value,
      weight: itemTemplate.weight,
      identified: itemTemplate.identified || false,
      cursed: (itemTemplate as any).cursed || false,
      blessed: (itemTemplate as any).blessed || false,
      enchantment: (itemTemplate as any).enchantment || 0,
      equipped: false,
      quantity: 1,
      effects: (itemTemplate.effects as ItemEffect[]) || [],
      classRestrictions: itemTemplate.classRestrictions || [],
      alignmentRestrictions: (itemTemplate as any).alignmentRestrictions || [],
      rarity: 'common' as const,
      charges: (itemTemplate as any).charges,
      maxCharges: (itemTemplate as any).maxCharges,
      invokable: (itemTemplate as any).invokable,
      spellId: (itemTemplate as any).spellId,
      description: (itemTemplate as any).description,
    };

    return item;
  }

  public static generateMonstersForLevel(dungeonLevel: number, _partyLevel: number): Monster[] {
    const monsterTemplates = this.monsters;
    const encounters = this.loadEncounters(dungeonLevel);

    if (!encounters || !encounters.encounters) {
      DebugLogger.error('DataLoader', `No encounters defined for level ${dungeonLevel}`);
      return [];
    }

    // Calculate number of monsters
    const numMonsters = 1 + Math.floor(Math.random() * 4);
    const monsters: Monster[] = [];

    for (let i = 0; i < numMonsters; i++) {
      // Select a monster type based on weights
      const totalWeight = encounters.encounters.reduce(
        (sum: number, enc: any) => sum + enc.weight,
        0
      );
      let roll = Math.random() * totalWeight;
      let selectedEncounter = encounters.encounters[0];

      for (const encounter of encounters.encounters) {
        roll -= encounter.weight;
        if (roll <= 0) {
          selectedEncounter = encounter;
          break;
        }
      }

      const monsterTemplate =
        monsterTemplates[selectedEncounter.monsterId as keyof typeof monstersData];
      if (!monsterTemplate) {
        DebugLogger.error(
          'DataLoader',
          `Monster template not found: ${selectedEncounter.monsterId}`
        );
        continue;
      }

      // Calculate monster level within the encounter's range
      const [minLevel, maxLevel] = selectedEncounter.levelRange;
      const monsterLevel = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));

      // Scale HP based on level
      const hpMultiplier = 1 + (monsterLevel - 1) * 0.2;
      const scaledHp = Math.floor(monsterTemplate.baseHp * hpMultiplier);

      const monster: Monster = {
        id: `${monsterTemplate.id}_${i}`,
        name: monsterTemplate.name,
        hp: scaledHp,
        maxHp: scaledHp,
        ac: monsterTemplate.baseAc - Math.floor(monsterLevel / 2),
        attacks: [],
        experience: 0,
        gold: 0,
        itemDrops: [],
        lootDrops: [],
        resistances: [],
        weaknesses: [],
        statuses: [],
        modifiers: [],
      };

      // Add attacks
      for (const attack of monsterTemplate.attacks) {
        const scaledDamage = attack.damage.replace(/d(\d+)/, (_match: string, p1: string) => {
          const baseDie = parseInt(p1);
          const scaledDie = baseDie + Math.floor(monsterLevel / 3);
          return `d${scaledDie}`;
        });

        monster.attacks.push({
          name: attack.name,
          damage: scaledDamage,
          effect: attack.effect,
          chance: attack.chance,
        });
      }

      monster.experience = Math.floor(
        monsterTemplate.baseExperience * (1 + (monsterLevel - 1) * 0.3)
      );
      monster.gold = Math.floor(monsterTemplate.baseGold * (1 + (monsterLevel - 1) * 0.25));
      monster.itemDrops = monsterTemplate.itemDrops || [];
      monster.lootDrops = monsterTemplate.lootDrops || [];
      monster.resistances = monsterTemplate.resistances || [];
      monster.weaknesses = monsterTemplate.weaknesses || [];

      monsters.push(monster);
    }

    return monsters;
  }
}
