import { Character } from '../../entities/Character';
import { Item, ItemRarity, Monster } from '../../types/GameTypes';
import { generateRandomItem } from '../../config/ItemProperties';
import { GAME_CONFIG } from '../../config/GameConstants';
import { DataLoader } from '../../utils/DataLoader';
import { DebugLogger } from '../../utils/DebugLogger';

interface LootDebugData {
  dungeonLevel: number;
  dungeonMultiplier: number;
  luckMultiplier: number;
  totalMultiplier: number;
  lastRarityRolls: string[];
}

export class LootGenerator {
  private static instance: LootGenerator | null = null;

  public static getInstance(): LootGenerator {
    if (!LootGenerator.instance) {
      LootGenerator.instance = new LootGenerator();
    }
    return LootGenerator.instance;
  }

  private debugData: LootDebugData = {
    dungeonLevel: 1,
    dungeonMultiplier: 1.0,
    luckMultiplier: 1.0,
    totalMultiplier: 1.0,
    lastRarityRolls: [],
  };

  public generateRandomLoot(level: number): Item[] {
    const loot: Item[] = [];
    const numItems = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numItems; i++) {
      const item = generateRandomItem(level);
      loot.push(item);
    }

    return loot;
  }

  public generateMonsterLoot(
    monsters: Monster[],
    partyLevel: number,
    dungeonLevel: number,
    partyCharacters: Character[]
  ): Item[] {
    const loot: Item[] = [];

    const dungeonMultiplier = this.getDungeonLevelMultiplier(dungeonLevel);
    const luckMultiplier = this.calculatePartyLuckMultiplier(partyCharacters);
    const totalDropRateMultiplier = dungeonMultiplier * luckMultiplier;

    this.debugData = {
      dungeonLevel,
      dungeonMultiplier,
      luckMultiplier,
      totalMultiplier: totalDropRateMultiplier,
      lastRarityRolls: [],
    };

    for (const monster of monsters) {
      if (monster.lootDrops && monster.lootDrops.length > 0) {
        for (const drop of monster.lootDrops) {
          if (drop.minLevel && partyLevel < drop.minLevel) continue;
          if (drop.maxLevel && partyLevel > drop.maxLevel) continue;

          const modifiedChance = Math.min(1.0, drop.chance * totalDropRateMultiplier);

          if (Math.random() < modifiedChance) {
            const item = this.createDroppedItem(drop.itemId, partyCharacters);
            if (item) {
              loot.push(item);
            }
          }
        }
      } else if (monster.itemDrops && monster.itemDrops.length > 0) {
        for (const drop of monster.itemDrops) {
          const modifiedChance = Math.min(1.0, drop.chance * totalDropRateMultiplier);

          if (Math.random() < modifiedChance) {
            const item = this.createDroppedItem(drop.itemId, partyCharacters);
            if (item) {
              loot.push(item);
            }
          }
        }
      }
    }

    return loot;
  }

  public getLootDebugData(): LootDebugData {
    return { ...this.debugData };
  }

  public getRarityColor(rarity?: ItemRarity): string {
    switch (rarity) {
      case 'uncommon':
        return '#00ff00';
      case 'rare':
        return '#0080ff';
      case 'legendary':
        return '#ff8000';
      default:
        return '#ffffff';
    }
  }

  private createDroppedItem(itemId: string, partyCharacters?: Character[]): Item | null {
    const baseItem = DataLoader.createItemInstance(itemId);
    if (!baseItem) return null;

    const rarity = this.rollItemRarity(partyCharacters);
    baseItem.rarity = rarity;

    this.applyRarityEffects(baseItem, rarity);

    return baseItem;
  }

  private rollItemRarity(partyCharacters?: Character[]): ItemRarity {
    const rand = Math.random();
    const baseChances = GAME_CONFIG.LOOT_SYSTEM.RARITY_CHANCES;

    const chances: {
      common: number;
      uncommon: number;
      rare: number;
      legendary: number;
    } = {
      common: baseChances.common,
      uncommon: baseChances.uncommon,
      rare: baseChances.rare,
      legendary: baseChances.legendary,
    };

    if (partyCharacters) {
      const totalLuck = partyCharacters.reduce((sum, char) => sum + (char.stats?.luck || 10), 0);
      const luckConfig = GAME_CONFIG.LOOT_SYSTEM.LUCK_SYSTEM;
      const luckBonus = (totalLuck - luckConfig.BASE_PARTY_LUCK) * luckConfig.RARITY_LUCK_FACTOR;
      const clampedLuckBonus = Math.max(
        -luckConfig.MAX_RARITY_SHIFT,
        Math.min(luckConfig.MAX_RARITY_SHIFT, luckBonus)
      );

      if (clampedLuckBonus > 0) {
        chances.common = Math.max(0.1, chances.common - clampedLuckBonus);
        chances.uncommon = Math.min(0.8, chances.uncommon + clampedLuckBonus * 0.3);
        chances.rare = Math.min(0.3, chances.rare + clampedLuckBonus * 0.4);
        chances.legendary = Math.min(0.2, chances.legendary + clampedLuckBonus * 0.3);
      }
    }

    let result: ItemRarity;
    if (rand < chances.common) {
      result = 'common';
    } else if (rand < chances.common + chances.uncommon) {
      result = 'uncommon';
    } else if (rand < chances.common + chances.uncommon + chances.rare) {
      result = 'rare';
    } else {
      result = 'legendary';
    }

    const totalLuck =
      partyCharacters?.reduce((sum, char) => sum + (char.stats?.luck || 10), 0) || 60;
    const rollInfo = `Roll: ${(rand * 100).toFixed(1)}% → ${result} (luck: ${totalLuck})`;
    this.debugData.lastRarityRolls.unshift(rollInfo);
    if (this.debugData.lastRarityRolls.length > 10) {
      this.debugData.lastRarityRolls.pop();
    }

    return result;
  }

  private applyRarityEffects(item: Item, rarity: ItemRarity): void {
    const config = GAME_CONFIG.LOOT_SYSTEM;

    const enchantRange = config.RARITY_ENCHANTMENT_LEVELS[rarity];
    item.enchantment =
      enchantRange.min + Math.floor(Math.random() * (enchantRange.max - enchantRange.min + 1));

    item.value = Math.floor(item.value * config.RARITY_VALUE_MULTIPLIERS[rarity]);

    if (item.enchantment > 0) {
      item.name = `${item.name} +${item.enchantment}`;
    }

    if (item.effects && item.enchantment > 0) {
      item.effects = item.effects.map((effect) => {
        if ('value' in effect && effect.value !== undefined) {
          return {
            ...effect,
            value: effect.value + item.enchantment,
          };
        }
        return effect;
      });
    }
  }

  private getDungeonLevelMultiplier(dungeonLevel: number): number {
    try {
      const levelData = DataLoader.loadEncounters(dungeonLevel);
      return levelData.dropRateMultiplier || 1.0;
    } catch (error) {
      DebugLogger.warn(
        'LootGenerator',
        `Could not load drop multiplier for dungeon level ${dungeonLevel}, using default 1.0`,
        error
      );
      return 1.0;
    }
  }

  private calculatePartyLuckMultiplier(partyCharacters: Character[]): number {
    const totalLuck = partyCharacters.reduce((sum, char) => sum + (char.stats?.luck || 10), 0);
    const luckConfig = GAME_CONFIG.LOOT_SYSTEM.LUCK_SYSTEM;

    const luckDifference = totalLuck - luckConfig.BASE_PARTY_LUCK;
    const luckMultiplier = 1.0 + luckDifference * luckConfig.DROP_RATE_PER_LUCK;

    return Math.min(luckConfig.MAX_LUCK_BONUS, Math.max(0.1, luckMultiplier));
  }
}
