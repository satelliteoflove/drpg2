import { SpellData } from '../../types/SpellTypes';

export const SPELLS: Record<string, SpellData> = {
  // ============= MAGE SPELLS =============
  // Level 1 Mage Spells
  flame_dart: {
    id: 'flame_dart',
    name: 'Flame Dart',
    originalName: 'HALITO',
    school: 'mage',
    level: 1,
    mpCost: 2,
    targetType: 'enemy',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Hurls a small dart of magical flame at a single enemy',
    effects: [{
      type: 'damage',
      element: 'fire',
      power: '1d8'
    }],
    tags: ['offensive', 'elemental']
  },

  armor_boost: {
    id: 'armor_boost',
    name: 'Armor Boost',
    originalName: 'MOGREF',
    school: 'mage',
    level: 1,
    mpCost: 1,
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates a magical shield that improves party armor class',
    effects: [{
      type: 'buff',
      buffType: 'ac_bonus',
      power: 2,
      duration: 'combat'
    }],
    tags: ['defensive', 'party']
  },

  sleep: {
    id: 'sleep',
    name: 'Sleep',
    originalName: 'KATINO',
    school: 'mage',
    level: 1,
    mpCost: 2,
    targetType: 'group',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Causes 1-3 enemies in a group to fall asleep',
    effects: [{
      type: 'status',
      statusEffect: 'sleep',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['control', 'mental']
  },

  locate: {
    id: 'locate',
    name: 'Locate',
    originalName: 'DUMAPIC',
    school: 'mage',
    level: 1,
    mpCost: 1,
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Reveals party coordinates and facing direction in the dungeon',
    effects: [{
      type: 'utility',
      subtype: 'locate',
      special: 'show_coordinates'
    }],
    tags: ['utility', 'exploration']
  },

  // Level 2 Mage Spells
  darkness: {
    id: 'darkness',
    name: 'Darkness',
    originalName: 'DILTO',
    school: 'mage',
    level: 2,
    mpCost: 3,
    targetType: 'group',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Blinds a group of enemies with magical darkness',
    effects: [{
      type: 'status',
      statusEffect: 'blinded',
      duration: '2d4',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['control', 'debuff']
  },

  dispel_magic: {
    id: 'dispel_magic',
    name: 'Dispel Magic',
    originalName: 'MORLIS',
    school: 'mage',
    level: 2,
    mpCost: 3,
    targetType: 'any',
    range: { max: 4 },
    inCombat: true,
    outOfCombat: true,
    description: 'Removes magical effects from target',
    effects: [{
      type: 'dispel',
      subtype: 'magic',
      power: 50
    }],
    tags: ['utility', 'dispel']
  },

  // Level 3 Mage Spells
  ice_storm: {
    id: 'ice_storm',
    name: 'Ice Storm',
    originalName: 'DALTO',
    school: 'mage',
    level: 3,
    mpCost: 4,
    targetType: 'group',
    range: { max: 5 },
    inCombat: true,
    outOfCombat: false,
    description: 'Pelts a group of enemies with shards of ice',
    effects: [{
      type: 'damage',
      element: 'ice',
      power: '6d6'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  flame_storm: {
    id: 'flame_storm',
    name: 'Flame Storm',
    originalName: 'LAHALITO',
    school: 'mage',
    level: 3,
    mpCost: 4,
    targetType: 'group',
    range: { max: 5 },
    inCombat: true,
    outOfCombat: false,
    description: 'Engulfs a group of enemies in magical flames',
    effects: [{
      type: 'damage',
      element: 'fire',
      power: '6d6'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  // Level 4 Mage Spells
  greater_flame: {
    id: 'greater_flame',
    name: 'Greater Flame',
    originalName: 'MAHALITO',
    school: 'mage',
    level: 4,
    mpCost: 5,
    targetType: 'group',
    range: { max: 6 },
    inCombat: true,
    outOfCombat: false,
    description: 'A more powerful flame attack against a group',
    effects: [{
      type: 'damage',
      element: 'fire',
      power: '8d8'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  // Level 5 Mage Spells
  mass_sleep: {
    id: 'mass_sleep',
    name: 'Mass Sleep',
    originalName: 'MAKATINO',
    school: 'mage',
    level: 5,
    mpCost: 6,
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Attempts to put all enemies to sleep',
    effects: [{
      type: 'status',
      statusEffect: 'sleep',
      saveType: 'mental',
      saveModifier: -5
    }],
    tags: ['control', 'mental', 'mass']
  },

  // Level 6 Mage Spells
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    originalName: 'LAKANITO',
    school: 'mage',
    level: 6,
    mpCost: 7,
    targetType: 'group',
    range: { max: 8 },
    inCombat: true,
    outOfCombat: false,
    description: 'Strikes enemies with powerful lightning',
    effects: [{
      type: 'damage',
      element: 'lightning',
      power: '10d8'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  disintegrate: {
    id: 'disintegrate',
    name: 'Disintegrate',
    originalName: 'ZILWAN',
    school: 'mage',
    level: 6,
    mpCost: 8,
    targetType: 'enemy',
    range: { max: 5 },
    inCombat: true,
    outOfCombat: false,
    description: 'Attempts to instantly destroy target',
    effects: [{
      type: 'instant_death',
      saveType: 'death',
      saveModifier: -10
    }],
    tags: ['offensive', 'death']
  },

  // Level 7 Mage Spells
  nuclear_blast: {
    id: 'nuclear_blast',
    name: 'Nuclear Blast',
    originalName: 'TILTOWAIT',
    school: 'mage',
    level: 7,
    mpCost: 10,
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'The ultimate damage spell - devastates all enemies',
    effects: [{
      type: 'damage',
      element: 'fire',
      power: '10d10'
    }],
    tags: ['offensive', 'elemental', 'ultimate', 'mass']
  },

  teleport: {
    id: 'teleport',
    name: 'Teleport',
    originalName: 'MALOR',
    school: 'mage',
    level: 7,
    mpCost: 8,
    targetType: 'location',
    inCombat: true,
    outOfCombat: true,
    description: 'Instantly transport party to another location',
    effects: [{
      type: 'teleport',
      subtype: 'relative',
      special: 'requires_coordinates'
    }],
    tags: ['utility', 'teleport', 'dangerous']
  },

  wish: {
    id: 'wish',
    name: 'Wish',
    originalName: 'MAHAMAN',
    school: 'mage',
    level: 7,
    mpCost: 10,
    targetType: 'any',
    inCombat: true,
    outOfCombat: true,
    description: 'Alter reality itself - unpredictable effects',
    effects: [{
      type: 'special',
      special: 'reality_alteration'
    }],
    tags: ['special', 'dangerous', 'ultimate']
  },

  // ============= PRIEST SPELLS =============
  // Level 1 Priest Spells
  heal: {
    id: 'heal',
    name: 'Heal',
    originalName: 'DIOS',
    school: 'priest',
    level: 1,
    mpCost: 2,
    targetType: 'ally',
    range: { special: 'touch' },
    inCombat: true,
    outOfCombat: true,
    description: 'Restores health to a single ally',
    effects: [{
      type: 'heal',
      power: '1d8'
    }],
    tags: ['healing', 'restoration']
  },

  harm: {
    id: 'harm',
    name: 'Harm',
    originalName: 'BADIOS',
    school: 'priest',
    level: 1,
    mpCost: 2,
    targetType: 'enemy',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts divine damage on a single enemy',
    effects: [{
      type: 'damage',
      element: 'holy',
      power: '1d8'
    }],
    tags: ['offensive', 'divine']
  },

  bless: {
    id: 'bless',
    name: 'Bless',
    originalName: 'KALKI',
    school: 'priest',
    level: 1,
    mpCost: 1,
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Blesses party with divine protection',
    effects: [{
      type: 'buff',
      buffType: 'ac_bonus',
      power: 1,
      duration: 'combat'
    }],
    tags: ['defensive', 'blessing', 'party']
  },

  light: {
    id: 'light',
    name: 'Light',
    originalName: 'MILWA',
    school: 'priest',
    level: 1,
    mpCost: 1,
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Creates magical light for dungeon exploration',
    effects: [{
      type: 'utility',
      subtype: 'light',
      duration: '30+1d11'
    }],
    tags: ['utility', 'exploration']
  },

  // Level 2 Priest Spells
  paralysis_cure: {
    id: 'paralysis_cure',
    name: 'Paralysis Cure',
    originalName: 'DIALKO',
    school: 'priest',
    level: 2,
    mpCost: 3,
    targetType: 'ally',
    range: { special: 'touch' },
    inCombat: true,
    outOfCombat: true,
    description: 'Removes paralysis from target',
    effects: [{
      type: 'cure',
      statusEffect: 'paralyzed'
    }],
    tags: ['healing', 'cure']
  },

  protection: {
    id: 'protection',
    name: 'Protection',
    originalName: 'MAPORFIC',
    school: 'priest',
    level: 2,
    mpCost: 3,
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Shields party from physical attacks',
    effects: [{
      type: 'buff',
      buffType: 'defense_bonus',
      power: 2,
      duration: 'combat'
    }],
    tags: ['defensive', 'protection', 'party']
  },

  // Level 3 Priest Spells
  greater_heal: {
    id: 'greater_heal',
    name: 'Greater Heal',
    originalName: 'DIAL',
    school: 'priest',
    level: 3,
    mpCost: 4,
    targetType: 'ally',
    range: { special: 'touch' },
    inCombat: true,
    outOfCombat: true,
    description: 'More powerful healing spell',
    effects: [{
      type: 'heal',
      power: '2d8'
    }],
    tags: ['healing', 'restoration']
  },

  greater_harm: {
    id: 'greater_harm',
    name: 'Greater Harm',
    originalName: 'BADIAL',
    school: 'priest',
    level: 3,
    mpCost: 4,
    targetType: 'enemy',
    range: { max: 4 },
    inCombat: true,
    outOfCombat: false,
    description: 'More powerful divine damage',
    effects: [{
      type: 'damage',
      element: 'holy',
      power: '2d8'
    }],
    tags: ['offensive', 'divine']
  },

  // Level 4 Priest Spells
  dispel_undead: {
    id: 'dispel_undead',
    name: 'Dispel Undead',
    originalName: 'LATUMAPIC',
    school: 'priest',
    level: 4,
    mpCost: 5,
    targetType: 'group',
    range: { max: 5 },
    inCombat: true,
    outOfCombat: false,
    description: 'Destroys undead creatures',
    effects: [{
      type: 'dispel',
      subtype: 'undead',
      power: 75
    }],
    tags: ['offensive', 'holy', 'anti-undead']
  },

  mass_heal: {
    id: 'mass_heal',
    name: 'Mass Heal',
    originalName: 'DIALMA',
    school: 'priest',
    level: 4,
    mpCost: 5,
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Heals entire party',
    effects: [{
      type: 'heal',
      power: '2d8'
    }],
    tags: ['healing', 'mass', 'party']
  },

  // Level 5 Priest Spells
  life_drain: {
    id: 'life_drain',
    name: 'Life Drain',
    originalName: 'BADI',
    school: 'priest',
    level: 5,
    mpCost: 6,
    targetType: 'enemy',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Drains life force from enemy',
    effects: [{
      type: 'damage',
      element: 'dark',
      power: '4d8',
      special: 'level_drain'
    }],
    tags: ['offensive', 'dark', 'drain']
  },

  resurrection: {
    id: 'resurrection',
    name: 'Resurrection',
    originalName: 'DI',
    school: 'priest',
    level: 5,
    mpCost: 8,
    targetType: 'dead',
    range: { special: 'touch' },
    inCombat: false,
    outOfCombat: true,
    description: 'Attempts to resurrect dead character',
    effects: [{
      type: 'resurrection',
      subtype: 'dead',
      special: 'chance_based'
    }],
    tags: ['resurrection', 'restoration']
  },

  // Level 6 Priest Spells
  full_heal: {
    id: 'full_heal',
    name: 'Full Heal',
    originalName: 'MADI',
    school: 'priest',
    level: 6,
    mpCost: 8,
    targetType: 'ally',
    range: { special: 'touch' },
    inCombat: true,
    outOfCombat: true,
    description: 'Completely restores target health',
    effects: [{
      type: 'heal',
      special: 'full_heal'
    }],
    tags: ['healing', 'restoration', 'ultimate']
  },

  greater_dispel: {
    id: 'greater_dispel',
    name: 'Greater Dispel',
    originalName: 'LABADI',
    school: 'priest',
    level: 6,
    mpCost: 7,
    targetType: 'any',
    range: { max: 6 },
    inCombat: true,
    outOfCombat: true,
    description: 'Removes all magical effects',
    effects: [{
      type: 'dispel',
      subtype: 'all',
      power: 100
    }],
    tags: ['dispel', 'utility']
  },

  // Level 7 Priest Spells
  greater_resurrection: {
    id: 'greater_resurrection',
    name: 'Greater Resurrection',
    originalName: 'KADORTO',
    school: 'priest',
    level: 7,
    mpCost: 10,
    targetType: 'dead',
    range: { special: 'touch' },
    inCombat: false,
    outOfCombat: true,
    description: 'More reliable resurrection spell',
    effects: [{
      type: 'resurrection',
      subtype: 'ashes',
      special: 'improved_chance'
    }],
    tags: ['resurrection', 'restoration', 'ultimate']
  },

  miracle: {
    id: 'miracle',
    name: 'Miracle',
    originalName: 'MABARIKO',
    school: 'priest',
    level: 7,
    mpCost: 10,
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Divine intervention restores and protects party',
    effects: [{
      type: 'heal',
      special: 'full_heal'
    }, {
      type: 'cure',
      statusEffect: 'all'
    }, {
      type: 'buff',
      buffType: 'protection',
      power: 5,
      duration: 'combat'
    }],
    tags: ['healing', 'protection', 'ultimate', 'divine']
  },

  // ============= ALCHEMIST SPELLS =============
  // Level 1 Alchemist Spells
  shield: {
    id: 'shield',
    name: 'Shield',
    originalName: 'OSLO',
    school: 'alchemist',
    level: 1,
    mpCost: 1,
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates magical shield around party',
    effects: [{
      type: 'buff',
      buffType: 'ac_bonus',
      power: 2,
      duration: 'combat'
    }],
    tags: ['defensive', 'shield', 'party']
  },

  poison_dart: {
    id: 'poison_dart',
    name: 'Poison Dart',
    originalName: 'VENAT',
    school: 'alchemist',
    level: 1,
    mpCost: 2,
    targetType: 'enemy',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Poisoned projectile damages and poisons enemy',
    effects: [{
      type: 'damage',
      element: 'acid',
      power: '1d6'
    }, {
      type: 'status',
      statusEffect: 'poisoned',
      saveType: 'physical',
      saveModifier: 0
    }],
    tags: ['offensive', 'poison']
  },

  antidote: {
    id: 'antidote',
    name: 'Antidote',
    originalName: 'ANTLE',
    school: 'alchemist',
    level: 1,
    mpCost: 2,
    targetType: 'ally',
    range: { special: 'touch' },
    inCombat: true,
    outOfCombat: true,
    description: 'Cures poison',
    effects: [{
      type: 'cure',
      statusEffect: 'poisoned'
    }],
    tags: ['healing', 'cure']
  },

  identify: {
    id: 'identify',
    name: 'Identify',
    originalName: 'MELIM',
    school: 'alchemist',
    level: 1,
    mpCost: 1,
    targetType: 'any',
    inCombat: false,
    outOfCombat: true,
    description: 'Reveals true nature of items',
    effects: [{
      type: 'utility',
      subtype: 'identify'
    }],
    tags: ['utility', 'knowledge']
  },

  // Level 2 Alchemist Spells
  levitation: {
    id: 'levitation',
    name: 'Levitation',
    originalName: 'MEROLK',
    school: 'alchemist',
    level: 2,
    mpCost: 3,
    targetType: 'allAllies',
    inCombat: false,
    outOfCombat: true,
    description: 'Party floats above ground, avoiding traps',
    effects: [{
      type: 'buff',
      buffType: 'levitation',
      duration: '20+1d10'
    }],
    tags: ['utility', 'exploration', 'protection']
  },

  // Level 3 Alchemist Spells
  acid_splash: {
    id: 'acid_splash',
    name: 'Acid Splash',
    originalName: 'DALQUAR',
    school: 'alchemist',
    level: 3,
    mpCost: 4,
    targetType: 'group',
    range: { max: 4 },
    inCombat: true,
    outOfCombat: false,
    description: 'Splashes corrosive acid on enemy group',
    effects: [{
      type: 'damage',
      element: 'acid',
      power: '4d6'
    }],
    tags: ['offensive', 'acid', 'area']
  },

  group_antidote: {
    id: 'group_antidote',
    name: 'Group Antidote',
    originalName: 'PALNTE',
    school: 'alchemist',
    level: 3,
    mpCost: 4,
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Cures poison for entire party',
    effects: [{
      type: 'cure',
      statusEffect: 'poisoned'
    }],
    tags: ['healing', 'cure', 'party']
  },

  // Level 4 Alchemist Spells
  stone_to_flesh: {
    id: 'stone_to_flesh',
    name: 'Stone to Flesh',
    originalName: 'DESTO',
    school: 'alchemist',
    level: 4,
    mpCost: 5,
    targetType: 'ally',
    range: { special: 'touch' },
    inCombat: false,
    outOfCombat: true,
    description: 'Reverses petrification',
    effects: [{
      type: 'cure',
      statusEffect: 'stoned'
    }],
    tags: ['healing', 'cure', 'restoration']
  },

  // Level 5 Alchemist Spells
  poison_cloud: {
    id: 'poison_cloud',
    name: 'Poison Cloud',
    originalName: 'MAVENAT',
    school: 'alchemist',
    level: 5,
    mpCost: 6,
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates toxic cloud affecting all enemies',
    effects: [{
      type: 'damage',
      element: 'acid',
      power: '3d6'
    }, {
      type: 'status',
      statusEffect: 'poisoned',
      saveType: 'physical',
      saveModifier: -5
    }],
    tags: ['offensive', 'poison', 'mass']
  },

  // Level 6 Alchemist Spells
  transmutation: {
    id: 'transmutation',
    name: 'Transmutation',
    originalName: 'MALNYM',
    school: 'alchemist',
    level: 6,
    mpCost: 8,
    targetType: 'enemy',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Transforms enemy matter',
    effects: [{
      type: 'status',
      statusEffect: 'stoned',
      saveType: 'magical',
      saveModifier: -10
    }],
    tags: ['offensive', 'transmutation']
  },

  dispel_undead_alchemist: {
    id: 'dispel_undead_alchemist',
    name: 'Banish Undead',
    originalName: 'ZILWAN',
    school: 'alchemist',
    level: 6,
    mpCost: 7,
    targetType: 'group',
    range: { max: 6 },
    inCombat: true,
    outOfCombat: false,
    description: 'Destroys undead with alchemical energy',
    effects: [{
      type: 'instant_death',
      subtype: 'undead_only',
      saveType: 'death',
      saveModifier: -5
    }],
    tags: ['offensive', 'anti-undead']
  },

  // Level 7 Alchemist Spells
  disintegration: {
    id: 'disintegration',
    name: 'Disintegration',
    originalName: 'ABRIDAL',
    school: 'alchemist',
    level: 7,
    mpCost: 10,
    targetType: 'group',
    range: { max: 5 },
    inCombat: true,
    outOfCombat: false,
    description: 'Attempts to disintegrate enemy group',
    effects: [{
      type: 'instant_death',
      saveType: 'death',
      saveModifier: -15
    }],
    tags: ['offensive', 'death', 'ultimate']
  },

  // ============= PSIONIC SPELLS =============
  // Level 1 Psionic Spells
  mind_shield: {
    id: 'mind_shield',
    name: 'Mind Shield',
    originalName: 'POBA',
    school: 'psionic',
    level: 1,
    mpCost: 2,
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Protects party from mental attacks',
    effects: [{
      type: 'buff',
      buffType: 'resistance',
      subtype: 'mental',
      power: 3,
      duration: 'combat'
    }],
    tags: ['defensive', 'mental', 'party']
  },

  confusion: {
    id: 'confusion',
    name: 'Confusion',
    originalName: 'MENTAL',
    school: 'psionic',
    level: 1,
    mpCost: 2,
    targetType: 'enemy',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Confuses single enemy',
    effects: [{
      type: 'status',
      statusEffect: 'confused',
      duration: '1d4',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['control', 'mental']
  },

  detect: {
    id: 'detect',
    name: 'Detect',
    originalName: 'DETECT',
    school: 'psionic',
    level: 1,
    mpCost: 1,
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Reveals hidden doors and traps',
    effects: [{
      type: 'utility',
      subtype: 'detect',
      duration: '10'
    }],
    tags: ['utility', 'exploration']
  },

  telekinesis: {
    id: 'telekinesis',
    name: 'Telekinesis',
    originalName: 'TILT',
    school: 'psionic',
    level: 1,
    mpCost: 2,
    targetType: 'enemy',
    range: { max: 4 },
    inCombat: true,
    outOfCombat: false,
    description: 'Damages enemy with psychic force',
    effects: [{
      type: 'damage',
      element: 'psychic',
      power: '1d6'
    }],
    tags: ['offensive', 'psychic']
  },

  // Level 2 Psionic Spells
  fear: {
    id: 'fear',
    name: 'Fear',
    originalName: 'MORLIS',
    school: 'psionic',
    level: 2,
    mpCost: 3,
    targetType: 'group',
    range: { max: 4 },
    inCombat: true,
    outOfCombat: false,
    description: 'Terrifies enemy group',
    effects: [{
      type: 'status',
      statusEffect: 'afraid',
      duration: '2d4',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['control', 'mental', 'area']
  },

  // Level 3 Psionic Spells
  mind_blast: {
    id: 'mind_blast',
    name: 'Mind Blast',
    originalName: 'BOLATU',
    school: 'psionic',
    level: 3,
    mpCost: 4,
    targetType: 'group',
    range: { max: 5 },
    inCombat: true,
    outOfCombat: false,
    description: 'Psychic attack on enemy group',
    effects: [{
      type: 'damage',
      element: 'psychic',
      power: '3d8'
    }],
    tags: ['offensive', 'psychic', 'area']
  },

  // Level 4 Psionic Spells
  charm: {
    id: 'charm',
    name: 'Charm',
    originalName: 'VASKYRE',
    school: 'psionic',
    level: 4,
    mpCost: 5,
    targetType: 'enemy',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Takes control of enemy mind',
    effects: [{
      type: 'status',
      statusEffect: 'charmed',
      duration: '3d4',
      saveType: 'mental',
      saveModifier: -5
    }],
    tags: ['control', 'mental']
  },

  // Level 5 Psionic Spells
  psychic_scream: {
    id: 'psychic_scream',
    name: 'Psychic Scream',
    originalName: 'BAMORDI',
    school: 'psionic',
    level: 5,
    mpCost: 6,
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Mental assault on all enemies',
    effects: [{
      type: 'damage',
      element: 'psychic',
      power: '4d8'
    }, {
      type: 'status',
      statusEffect: 'confused',
      duration: '1d4',
      saveType: 'mental',
      saveModifier: -3
    }],
    tags: ['offensive', 'psychic', 'mass']
  },

  // Level 6 Psionic Spells
  mass_hypnosis: {
    id: 'mass_hypnosis',
    name: 'Mass Hypnosis',
    originalName: 'PACCSI',
    school: 'psionic',
    level: 6,
    mpCost: 7,
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Attempts to hypnotize all enemies',
    effects: [{
      type: 'status',
      statusEffect: 'sleep',
      saveType: 'mental',
      saveModifier: -10
    }],
    tags: ['control', 'mental', 'mass']
  },

  // Level 7 Psionic Spells
  mind_kill: {
    id: 'mind_kill',
    name: 'Mind Kill',
    originalName: 'MINDKILL',
    school: 'psionic',
    level: 7,
    mpCost: 9,
    targetType: 'enemy',
    range: { max: 3 },
    inCombat: true,
    outOfCombat: false,
    description: 'Destroys enemy mind instantly',
    effects: [{
      type: 'instant_death',
      saveType: 'mental',
      saveModifier: -15
    }],
    tags: ['offensive', 'death', 'mental']
  },

  astral_projection: {
    id: 'astral_projection',
    name: 'Astral Projection',
    originalName: 'ASTRAL',
    school: 'psionic',
    level: 7,
    mpCost: 8,
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Project consciousness to scout ahead',
    effects: [{
      type: 'utility',
      subtype: 'astral',
      duration: '10',
      special: 'safe_scouting'
    }],
    tags: ['utility', 'exploration', 'ultimate']
  }
};

export function getSpellById(spellId: string): SpellData | undefined {
  return SPELLS[spellId];
}

export function getSpellsBySchool(school: string): SpellData[] {
  return Object.values(SPELLS).filter(spell => spell.school === school);
}

export function getSpellsByLevel(level: number): SpellData[] {
  return Object.values(SPELLS).filter(spell => spell.level === level);
}

export function getSpellsBySchoolAndLevel(school: string, level: number): SpellData[] {
  return Object.values(SPELLS).filter(
    spell => spell.school === school && spell.level === level
  );
}

export function getAllSpells(): SpellData[] {
  return Object.values(SPELLS);
}