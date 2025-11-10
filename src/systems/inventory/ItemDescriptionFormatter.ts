import { Item } from '../../types/GameTypes';

export class ItemDescriptionFormatter {
  private static instance: ItemDescriptionFormatter | null = null;

  public static getInstance(): ItemDescriptionFormatter {
    if (!ItemDescriptionFormatter.instance) {
      ItemDescriptionFormatter.instance = new ItemDescriptionFormatter();
    }
    return ItemDescriptionFormatter.instance;
  }

  public getItemDescription(item: Item): string {
    if (!item.identified) {
      return item.unidentifiedName || '?Unknown';
    }

    let description = item.name;

    if (item.identified && item.rarity && item.rarity !== 'common') {
      description = `[${item.rarity.toUpperCase()}] ${description}`;
    }

    if (item.enchantment !== 0) {
      const sign = item.enchantment > 0 ? '+' : '';
      description = description.replace(item.name, `${item.name} ${sign}${item.enchantment}`);
    }

    const statuses = [];
    if (item.cursed) statuses.push('Cursed');
    if (item.blessed) statuses.push('Blessed');

    if (statuses.length > 0) {
      description += ` (${statuses.join(', ')})`;
    }

    if (item.charges !== undefined && item.maxCharges !== undefined) {
      description += ` [${item.charges}/${item.maxCharges}]`;
    }

    if (item.effects && item.effects.length > 0) {
      description += ' - ';
      const effectDescriptions = item.effects.map((effect) => {
        switch (effect.type) {
          case 'damage':
            return `+${effect.value} damage`;
          case 'ac':
            return `+${effect.value} AC`;
          case 'stat':
            return `+${effect.value} ${effect.target}`;
          case 'heal':
            return `Heals ${effect.value} HP`;
          default:
            return 'Special effect';
        }
      });
      description += effectDescriptions.join(', ');
    }

    return description;
  }
}
