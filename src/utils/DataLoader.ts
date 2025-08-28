import { Monster, Item } from '../types/GameTypes';

// Cache for loaded data to avoid repeated JSON parsing
const dataCache = {
  monsters: null as Record<string, any> | null,
  items: null as Record<string, any> | null,
  encounters: {} as Record<number, any>
};

export class DataLoader {
  // Load monster templates
  public static async loadMonsters(): Promise<Record<string, any>> {
    if (dataCache.monsters) {
      return dataCache.monsters;
    }

    try {
      const response = await fetch('/src/data/monsters/monsters.json');
      if (!response.ok) {
        throw new Error(`Failed to load monsters: ${response.statusText}`);
      }
      
      dataCache.monsters = await response.json();
      return dataCache.monsters!;
    } catch (error) {
      console.error('Error loading monsters:', error);
      // Return fallback data for development
      return this.getFallbackMonsters();
    }
  }

  // Load item templates  
  public static async loadItems(): Promise<Record<string, any>> {
    if (dataCache.items) {
      return dataCache.items;
    }

    try {
      const response = await fetch('/src/data/items/items.json');
      if (!response.ok) {
        throw new Error(`Failed to load items: ${response.statusText}`);
      }
      
      dataCache.items = await response.json();
      return dataCache.items!;
    } catch (error) {
      console.error('Error loading items:', error);
      // Return fallback data for development
      return this.getFallbackItems();
    }
  }

  // Load encounter table for specific level
  public static async loadEncounters(level: number): Promise<any> {
    if (dataCache.encounters[level]) {
      return dataCache.encounters[level];
    }

    try {
      const response = await fetch(`/src/data/encounters/level${level}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load encounters for level ${level}: ${response.statusText}`);
      }
      
      const encounters = await response.json();
      dataCache.encounters[level] = encounters;
      return encounters;
    } catch (error) {
      console.error(`Error loading encounters for level ${level}:`, error);
      // Return fallback data for development
      return this.getFallbackEncounters(level);
    }
  }

  // Create a scaled monster instance from template
  public static createMonsterInstance(template: any, levelRange: [number, number], instanceNumber: number = 1): Monster {
    const [minLevel, maxLevel] = levelRange;
    const level = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
    const levelMultiplier = 1 + (level - 1) * 0.3; // 30% increase per level

    return {
      id: template.id,
      name: instanceNumber > 1 ? `${template.name} ${instanceNumber}` : template.name,
      hp: Math.floor(template.baseHp * levelMultiplier),
      maxHp: Math.floor(template.baseHp * levelMultiplier),
      ac: Math.max(1, template.baseAc - Math.floor(level / 2)), // AC improves with level
      attacks: template.attacks.map((attack: any) => ({ ...attack })),
      experience: Math.floor(template.baseExperience * levelMultiplier),
      gold: Math.floor(template.baseGold * levelMultiplier),
      itemDrops: template.itemDrops || [],
      lootDrops: template.lootDrops || [],
      resistances: [...template.resistances],
      weaknesses: [...template.weaknesses],
      sprite: template.sprite
    };
  }

  // Create item instance from template
  public static async createItemInstance(itemId: string): Promise<Item | null> {
    const itemTemplates = await this.loadItems();
    const template = itemTemplates[itemId];
    
    if (!template) {
      console.warn(`Item template not found: ${itemId}`);
      return null;
    }

    return {
      id: template.id + '_' + Date.now(),
      name: template.name,
      unidentifiedName: template.unidentifiedName,
      description: template.description,
      type: template.type,
      value: template.value,
      weight: template.weight,
      identified: template.identified !== undefined ? template.identified : false,
      cursed: template.cursed || false,
      blessed: template.blessed || false,
      enchantment: template.enchantment || 0,
      equipped: false,
      quantity: 1,
      effects: template.effects || [],
      classRestrictions: template.classRestrictions,
      alignmentRestrictions: template.alignmentRestrictions,
      invokable: template.invokable,
      spellId: template.spellId,
      charges: template.charges,
      maxCharges: template.maxCharges,
      rarity: template.rarity
    };
  }

  // Generate monsters for a dungeon level
  public static async generateMonstersForLevel(dungeonLevel: number, _partyLevel: number): Promise<Monster[]> {
    const [monsterTemplates, encounters] = await Promise.all([
      this.loadMonsters(),
      this.loadEncounters(dungeonLevel)
    ]);

    // Create weighted list of possible monsters
    const weightedMonsters: Array<{ template: any, levelRange: [number, number] }> = [];
    
    encounters.encounters.forEach((encounter: any) => {
      const template = monsterTemplates[encounter.monsterId];
      if (template) {
        // Add monster multiple times based on weight
        for (let i = 0; i < encounter.weight; i++) {
          weightedMonsters.push({
            template,
            levelRange: encounter.levelRange
          });
        }
      }
    });

    if (weightedMonsters.length === 0) {
      console.warn(`No monsters found for dungeon level ${dungeonLevel}, using fallback`);
      return this.getFallbackMonstersForCombat();
    }

    // Generate 1-3 monsters for this encounter
    const numMonsters = 1 + Math.floor(Math.random() * 3);
    const monsters: Monster[] = [];

    for (let i = 0; i < numMonsters; i++) {
      const randomIndex = Math.floor(Math.random() * weightedMonsters.length);
      const { template, levelRange } = weightedMonsters[randomIndex];
      const monster = this.createMonsterInstance(template, levelRange, i + 1);
      monsters.push(monster);
    }

    return monsters;
  }

  // Fallback data for development/testing
  private static getFallbackMonsters(): Record<string, any> {
    return {
      slime: {
        id: "slime",
        name: "Slime",
        baseHp: 15,
        baseAc: 8,
        attacks: [{ name: "Slime Attack", damage: "1d4+1", effect: "", chance: 0.8 }],
        baseExperience: 10,
        baseGold: 5,
        itemDrops: [{ itemId: "potion", chance: 0.08 }],
        lootDrops: [{ itemId: "potion", chance: 0.08 }],
        resistances: [],
        weaknesses: ["fire"]
      }
    };
  }

  private static getFallbackItems(): Record<string, any> {
    return {
      potion: {
        id: "potion",
        name: "Potion",
        unidentifiedName: "?Potion",
        type: "consumable",
        value: 50,
        weight: 0.5,
        effects: [{ type: "heal", value: 5 }],
        classRestrictions: [],
        identified: false,
        charges: 1,
        maxCharges: 1,
        description: "A basic healing potion"
      }
    };
  }

  private static getFallbackEncounters(level: number): any {
    return {
      level,
      encounters: [
        { monsterId: "slime", levelRange: [1, 2], weight: 100 }
      ]
    };
  }

  private static getFallbackMonstersForCombat(): Monster[] {
    return [
      {
        id: 'slime',
        name: 'Slime',
        hp: 15,
        maxHp: 15,
        ac: 8,
        attacks: [{ name: 'Slime Attack', damage: '1d4+1', effect: '', chance: 0.8 }],
        experience: 10,
        gold: 5,
        itemDrops: [{ itemId: 'potion', chance: 0.08 }],
        lootDrops: [{ itemId: 'potion', chance: 0.08 }],
        resistances: [],
        weaknesses: ['fire'],
      }
    ];
  }
}