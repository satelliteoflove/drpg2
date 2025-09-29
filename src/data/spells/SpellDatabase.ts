import { SpellData, SpellId } from '../../types/SpellTypes';

export const SPELLS: Record<SpellId, SpellData> = {
  // ============= MAGE SPELLS =============
  // Level 1 Mage Spells
  m1_flame_dart: {
    id: 'm1_flame_dart' as SpellId,
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
      baseDamage: '1d8'
    }],
    tags: ['offensive', 'elemental']
  },

  m1_armor_boost: {
    id: 'm1_armor_boost' as SpellId,
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

  m1_sleep: {
    id: 'm1_sleep' as SpellId,
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

  m1_locate: {
    id: 'm1_locate' as SpellId,
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
  m2_darkness: {
    id: 'm2_darkness' as SpellId,
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

  m2_dispel_magic: {
    id: 'm2_dispel_magic' as SpellId,
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
  m3_ice_storm: {
    id: 'm3_ice_storm' as SpellId,
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
      baseDamage: '6d6'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  m3_flame_storm: {
    id: 'm3_flame_storm' as SpellId,
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
      baseDamage: '6d6'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  // Level 4 Mage Spells
  m4_greater_flame: {
    id: 'm4_greater_flame' as SpellId,
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
      baseDamage: '8d8'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  // Level 5 Mage Spells
  m5_mass_sleep: {
    id: 'm5_mass_sleep' as SpellId,
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
  m6_lightning_bolt: {
    id: 'm6_lightning_bolt' as SpellId,
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
      baseDamage: '10d8'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  m6_disintegrate: {
    id: 'm6_disintegrate' as SpellId,
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
  m7_nuclear_blast: {
    id: 'm7_nuclear_blast' as SpellId,
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
      baseDamage: '10d10'
    }],
    tags: ['offensive', 'elemental', 'ultimate', 'mass']
  },

  m7_teleport: {
    id: 'm7_teleport' as SpellId,
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

  m7_wish: {
    id: 'm7_wish' as SpellId,
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
  p1_heal: {
    id: 'p1_heal' as SpellId,
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
      baseHealing: '1d8'
    }],
    tags: ['healing', 'restoration']
  },

  p1_harm: {
    id: 'p1_harm' as SpellId,
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
      baseDamage: '1d8'
    }],
    tags: ['offensive', 'divine']
  },

  p1_bless: {
    id: 'p1_bless' as SpellId,
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

  p1_light: {
    id: 'p1_light' as SpellId,
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
  p2_paralysis_cure: {
    id: 'p2_paralysis_cure' as SpellId,
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

  p2_protection: {
    id: 'p2_protection' as SpellId,
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
  p3_greater_heal: {
    id: 'p3_greater_heal' as SpellId,
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
      baseHealing: '2d8'
    }],
    tags: ['healing', 'restoration']
  },

  p3_greater_harm: {
    id: 'p3_greater_harm' as SpellId,
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
      baseDamage: '2d8'
    }],
    tags: ['offensive', 'divine']
  },

  // Level 4 Priest Spells
  p4_dispel_undead: {
    id: 'p4_dispel_undead' as SpellId,
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

  p4_mass_heal: {
    id: 'p4_mass_heal' as SpellId,
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
      baseHealing: '2d8'
    }],
    tags: ['healing', 'mass', 'party']
  },

  // Level 5 Priest Spells
  p5_life_drain: {
    id: 'p5_life_drain' as SpellId,
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
      baseDamage: '4d8',
      special: 'level_drain'
    }],
    tags: ['offensive', 'dark', 'drain']
  },

  p5_resurrection: {
    id: 'p5_resurrection' as SpellId,
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
  p6_full_heal: {
    id: 'p6_full_heal' as SpellId,
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

  p6_greater_dispel: {
    id: 'p6_greater_dispel' as SpellId,
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
  p7_greater_resurrection: {
    id: 'p7_greater_resurrection' as SpellId,
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

  p7_miracle: {
    id: 'p7_miracle' as SpellId,
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
  a1_shield: {
    id: 'a1_shield' as SpellId,
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

  a1_poison_dart: {
    id: 'a1_poison_dart' as SpellId,
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
      baseDamage: '1d6'
    }, {
      type: 'status',
      statusEffect: 'poisoned',
      saveType: 'physical',
      saveModifier: 0
    }],
    tags: ['offensive', 'poison']
  },

  a1_antidote: {
    id: 'a1_antidote' as SpellId,
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

  a1_identify: {
    id: 'a1_identify' as SpellId,
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
  a2_levitation: {
    id: 'a2_levitation' as SpellId,
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
  a3_acid_splash: {
    id: 'a3_acid_splash' as SpellId,
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
      baseDamage: '4d6'
    }],
    tags: ['offensive', 'acid', 'area']
  },

  a3_group_antidote: {
    id: 'a3_group_antidote' as SpellId,
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
  a4_stone_to_flesh: {
    id: 'a4_stone_to_flesh' as SpellId,
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
  a5_poison_cloud: {
    id: 'a5_poison_cloud' as SpellId,
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
      baseDamage: '3d6'
    }, {
      type: 'status',
      statusEffect: 'poisoned',
      saveType: 'physical',
      saveModifier: -5
    }],
    tags: ['offensive', 'poison', 'mass']
  },

  // Level 6 Alchemist Spells
  a6_transmutation: {
    id: 'a6_transmutation' as SpellId,
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

  a6_dispel_undead: {
    id: 'a6_dispel_undead' as SpellId,
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
  a7_disintegration: {
    id: 'a7_disintegration' as SpellId,
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
  s1_mind_shield: {
    id: 's1_mind_shield' as SpellId,
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

  s1_confusion: {
    id: 's1_confusion' as SpellId,
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

  s1_detect: {
    id: 's1_detect' as SpellId,
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

  s1_telekinesis: {
    id: 's1_telekinesis' as SpellId,
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
      baseDamage: '1d6'
    }],
    tags: ['offensive', 'psychic']
  },

  // Level 2 Psionic Spells
  s2_fear: {
    id: 's2_fear' as SpellId,
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
  s3_mind_blast: {
    id: 's3_mind_blast' as SpellId,
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
      baseDamage: '3d8'
    }],
    tags: ['offensive', 'psychic', 'area']
  },

  // Level 4 Psionic Spells
  s4_charm: {
    id: 's4_charm' as SpellId,
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
  s5_psychic_scream: {
    id: 's5_psychic_scream' as SpellId,
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
      baseDamage: '4d8'
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
  s6_mass_hypnosis: {
    id: 's6_mass_hypnosis' as SpellId,
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
  s7_mind_kill: {
    id: 's7_mind_kill' as SpellId,
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

  s7_astral_projection: {
    id: 's7_astral_projection' as SpellId,
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

export function getSpellById(spellId: SpellId): SpellData | undefined {
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

// Helper function to extract school from spell ID
export function getSchoolFromSpellId(spellId: SpellId): string {
  const prefix = spellId.charAt(0);
  switch(prefix) {
    case 'm': return 'mage';
    case 'p': return 'priest';
    case 'a': return 'alchemist';
    case 's': return 'psionic';
    default: throw new Error(`Invalid spell ID: ${spellId}`);
  }
}

// Helper function to extract level from spell ID
export function getLevelFromSpellId(spellId: SpellId): number {
  const level = parseInt(spellId.charAt(1));
  if (isNaN(level) || level < 1 || level > 7) {
    throw new Error(`Invalid spell level in ID: ${spellId}`);
  }
  return level;
}

export function getAllSpells(): SpellData[] {
  return Object.values(SPELLS);
}