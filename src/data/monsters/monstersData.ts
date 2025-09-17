export const monstersData = {
  slime: {
    id: 'slime',
    name: 'Slime',
    baseHp: 15,
    baseAc: 8,
    attacks: [
      {
        name: 'Slime Attack',
        damage: '1d4+1',
        effect: '',
        chance: 0.8,
      },
    ],
    baseExperience: 10,
    baseGold: 5,
    itemDrops: [
      { itemId: 'potion', chance: 0.08 },
      { itemId: 'short_sword', chance: 0.01 },
    ],
    lootDrops: [
      { itemId: 'potion', chance: 0.08 },
      { itemId: 'short_sword', chance: 0.01, minLevel: 1, maxLevel: 3 },
    ],
    resistances: [],
    weaknesses: ['fire'],
  },
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    baseHp: 20,
    baseAc: 6,
    attacks: [
      {
        name: 'Club',
        damage: '1d6+1',
        effect: '',
        chance: 0.9,
      },
    ],
    baseExperience: 15,
    baseGold: 8,
    itemDrops: [
      { itemId: 'leather_armor', chance: 0.03 },
      { itemId: 'potion', chance: 0.1 },
      { itemId: 'scroll_of_sleep', chance: 0.02 },
    ],
    lootDrops: [
      { itemId: 'leather_armor', chance: 0.05, minLevel: 1, maxLevel: 5 },
      { itemId: 'potion', chance: 0.12 },
      { itemId: 'scroll_of_sleep', chance: 0.03, minLevel: 2 },
    ],
    resistances: [],
    weaknesses: [],
  },
  orc: {
    id: 'orc',
    name: 'Orc',
    baseHp: 35,
    baseAc: 4,
    attacks: [
      {
        name: 'Sword',
        damage: '1d8+2',
        effect: '',
        chance: 0.8,
      },
      {
        name: 'Bash',
        damage: '1d6+3',
        effect: '',
        chance: 0.6,
      },
    ],
    baseExperience: 25,
    baseGold: 15,
    itemDrops: [
      { itemId: 'muramasa', chance: 0.001 },
      { itemId: 'shadow_cape', chance: 0.05 },
      { itemId: 'ring_of_healing', chance: 0.02 },
      { itemId: 'dios_stone', chance: 0.03 },
    ],
    lootDrops: [
      { itemId: 'muramasa', chance: 0.002, minLevel: 3 },
      { itemId: 'shadow_cape', chance: 0.08, minLevel: 2 },
      { itemId: 'ring_of_healing', chance: 0.04, minLevel: 1, maxLevel: 8 },
      { itemId: 'dios_stone', chance: 0.06 },
      { itemId: 'staff_of_mogref', chance: 0.01, minLevel: 4 },
    ],
    resistances: [],
    weaknesses: [],
  },
};
