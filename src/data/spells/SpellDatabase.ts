import { SpellData, SpellId } from '../../types/SpellTypes';
import { getMPCostForLevel } from '../../config/SpellConstants';

export const SPELLS: Record<SpellId, SpellData> = {
  // ============= MAGE SPELLS =============
  // Level 1 Mage Spells
  m1_sleep: {
    id: 'm1_sleep' as SpellId,
    name: 'Sleep',
    originalName: 'KATINO',
    school: 'mage',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Puts enemy group to sleep; sleeping enemies take double melee damage',
    effects: [{
      type: 'status',
      statusType: 'sleep',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['control', 'mental']
  },

  m1_flame_dart: {
    id: 'm1_flame_dart' as SpellId,
    name: 'Flame Dart',
    originalName: 'HALITO',
    school: 'mage',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'enemy',
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

  m1_locate: {
    id: 'm1_locate' as SpellId,
    name: 'Locate',
    originalName: 'DUMAPIC',
    school: 'mage',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Displays automap showing party coordinates and facing direction',
    effects: [{
      type: 'utility',
      subtype: 'locate',
      special: 'show_automap'
    }],
    tags: ['utility', 'exploration']
  },

  m1_caster_shield: {
    id: 'm1_caster_shield' as SpellId,
    name: 'Caster Shield',
    originalName: 'MOGREF',
    school: 'mage',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'self',
    inCombat: true,
    outOfCombat: false,
    description: 'Increases caster evasion by 2 for the duration of combat',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: 2,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['defensive', 'buff']
  },

  // Level 2 Mage Spells
  m2_group_flame: {
    id: 'm2_group_flame' as SpellId,
    name: 'Group Flame',
    originalName: 'MELITO',
    school: 'mage',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Engulfs enemy group in flames',
    effects: [{
      type: 'damage',
      element: 'fire',
      baseDamage: '1d8'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  m2_ally_shield: {
    id: 'm2_ally_shield' as SpellId,
    name: 'Ally Shield',
    originalName: 'SOGREF',
    school: 'mage',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: false,
    description: 'Increases one ally evasion by 2 for the duration of combat',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: 2,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['defensive', 'buff']
  },

  m2_weaken_armor: {
    id: 'm2_weaken_armor' as SpellId,
    name: 'Weaken Armor',
    originalName: 'DILTO',
    school: 'mage',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Reduces enemy group evasion by 2 for the duration of combat',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: -2,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true
    }],
    tags: ['offensive', 'debuff']
  },

  m2_petrify: {
    id: 'm2_petrify' as SpellId,
    name: 'Petrify',
    originalName: 'BOLATU',
    school: 'mage',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Turns enemy to stone, stopping all actions',
    effects: [{
      type: 'status',
      statusType: 'stoned',
      duration: -1,
      saveType: 'physical',
      saveModifier: 0
    }],
    tags: ['control', 'petrification']
  },

  // Level 3 Mage Spells
  m3_fear_and_weaken: {
    id: 'm3_fear_and_weaken' as SpellId,
    name: 'Fear and Weaken',
    originalName: 'MORLIS',
    school: 'mage',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Reduces enemy group evasion by 4 and inflicts fear',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: -4,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true
    }, {
      type: 'status',
      statusType: 'afraid',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['offensive', 'debuff', 'control']
  },

  m3_anti_magic: {
    id: 'm3_anti_magic' as SpellId,
    name: 'Anti-Magic',
    originalName: 'CORTU',
    school: 'mage',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates barrier that resists enemy spells and breath attacks',
    effects: [{
      type: 'modifier',
      stat: 'resistance',
      value: 50,
      duration: 'combat',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['defensive', 'buff', 'party']
  },

  m3_confuse: {
    id: 'm3_confuse' as SpellId,
    name: 'Confuse',
    originalName: 'KANTIOS',
    school: 'mage',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Confuses enemy group, suppressing spell/breath/summon actions',
    effects: [{
      type: 'status',
      statusType: 'confused',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['control', 'mental']
  },

  m3_greater_flame: {
    id: 'm3_greater_flame' as SpellId,
    name: 'Greater Flame',
    originalName: 'MAHALITO',
    school: 'mage',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'More powerful flame attack against enemy group',
    effects: [{
      type: 'damage',
      element: 'fire',
      baseDamage: '4d6'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  // Level 4 Mage Spells
  m4_energy_blast: {
    id: 'm4_energy_blast' as SpellId,
    name: 'Energy Blast',
    originalName: 'TZALIK',
    school: 'mage',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Blasts single enemy with raw magical energy',
    effects: [{
      type: 'damage',
      element: 'neutral',
      baseDamage: '24+1d25'
    }],
    tags: ['offensive', 'neutral']
  },

  m4_flame_storm: {
    id: 'm4_flame_storm' as SpellId,
    name: 'Flame Storm',
    originalName: 'LAHALITO',
    school: 'mage',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Devastating firestorm engulfs enemy group',
    effects: [{
      type: 'damage',
      element: 'fire',
      baseDamage: '6d6'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  m4_levitate: {
    id: 'm4_levitate' as SpellId,
    name: 'Levitate',
    originalName: 'LITOFEIT',
    school: 'mage',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'allAllies',
    inCombat: false,
    outOfCombat: true,
    description: 'Party floats above ground, avoiding traps and making surprise less likely',
    effects: [{
      type: 'modifier',
      stat: 'levitation',
      value: 1,
      duration: '20+1d11',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: false
    }],
    tags: ['utility', 'exploration', 'protection']
  },

  m4_group_petrify: {
    id: 'm4_group_petrify' as SpellId,
    name: 'Group Petrify',
    originalName: 'ROKDO',
    school: 'mage',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Turns enemy group to stone',
    effects: [{
      type: 'status',
      statusType: 'stoned',
      duration: -1,
      saveType: 'physical',
      saveModifier: 0
    }],
    tags: ['control', 'petrification', 'area']
  },

  // Level 5 Mage Spells
  m5_summon: {
    id: 'm5_summon' as SpellId,
    name: 'Summon',
    originalName: 'SOCORDI',
    school: 'mage',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'self',
    inCombat: true,
    outOfCombat: false,
    description: 'Summons a random monster to fight for the party',
    effects: [{
      type: 'special',
      special: 'summon_monster'
    }],
    tags: ['summon', 'utility']
  },

  m5_ice_storm: {
    id: 'm5_ice_storm' as SpellId,
    name: 'Ice Storm',
    originalName: 'MADALTO',
    school: 'mage',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Freezing ice storm assaults enemy group',
    effects: [{
      type: 'damage',
      element: 'ice',
      baseDamage: '8d8'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  m5_dispel: {
    id: 'm5_dispel' as SpellId,
    name: 'Dispel',
    originalName: 'PALIOS',
    school: 'mage',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'any',
    inCombat: true,
    outOfCombat: true,
    description: 'Removes all magical effects from target or party',
    effects: [{
      type: 'dispel',
      subtype: 'all',
      power: 75
    }],
    tags: ['utility', 'dispel']
  },

  m5_anti_magic_field: {
    id: 'm5_anti_magic_field' as SpellId,
    name: 'Anti-Magic Field',
    originalName: 'BACORTU',
    school: 'mage',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates spell-sealing barrier around enemy group',
    effects: [{
      type: 'status',
      statusType: 'silenced',
      duration: 'combat',
      saveType: 'magical',
      saveModifier: 0
    }],
    tags: ['offensive', 'debuff', 'control']
  },

  // Level 6 Mage Spells
  m6_destroy_undead: {
    id: 'm6_destroy_undead' as SpellId,
    name: 'Destroy Undead',
    originalName: 'ZILWAN',
    school: 'mage',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Massive damage to undead creatures',
    effects: [{
      type: 'damage',
      element: 'holy',
      baseDamage: '1000+9d1001',
      special: 'undead_only'
    }],
    tags: ['offensive', 'anti-undead', 'holy']
  },

  m6_greater_ice_storm: {
    id: 'm6_greater_ice_storm' as SpellId,
    name: 'Greater Ice Storm',
    originalName: 'LADALTO',
    school: 'mage',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Devastating blizzard freezes enemy group',
    effects: [{
      type: 'damage',
      element: 'ice',
      baseDamage: '10d10'
    }],
    tags: ['offensive', 'elemental', 'area']
  },

  m6_death: {
    id: 'm6_death' as SpellId,
    name: 'Death',
    originalName: 'LOKARA',
    school: 'mage',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Attempts to instantly kill all enemies',
    effects: [{
      type: 'instant_death',
      saveType: 'death',
      saveModifier: 0
    }],
    tags: ['offensive', 'death', 'mass']
  },

  m6_power_blast: {
    id: 'm6_power_blast' as SpellId,
    name: 'Power Blast',
    originalName: 'LAZALIK',
    school: 'mage',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Overwhelming magical force strikes single enemy',
    effects: [{
      type: 'damage',
      element: 'neutral',
      baseDamage: '40+1d41'
    }],
    tags: ['offensive', 'neutral']
  },

  // Level 7 Mage Spells
  m7_teleport: {
    id: 'm7_teleport' as SpellId,
    name: 'Teleport',
    originalName: 'MALOR',
    school: 'mage',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'self',
    inCombat: true,
    outOfCombat: true,
    description: 'Instantly transports party to specified coordinates (camp) or random location (combat)',
    effects: [{
      type: 'teleport',
      subtype: 'coordinates',
      special: 'requires_input'
    }],
    tags: ['utility', 'teleport', 'dangerous']
  },

  m7_wish: {
    id: 'm7_wish' as SpellId,
    name: 'Wish',
    originalName: 'MAHAMAN',
    school: 'mage',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'any',
    inCombat: true,
    outOfCombat: false,
    description: 'Alter reality itself (requires level 13+, costs 1 level) - PLACEHOLDER',
    effects: [{
      type: 'special',
      special: 'wish_placeholder'
    }],
    tags: ['special', 'dangerous', 'ultimate', 'placeholder']
  },

  m7_nuclear_blast: {
    id: 'm7_nuclear_blast' as SpellId,
    name: 'Nuclear Blast',
    originalName: 'TILTOWAIT',
    school: 'mage',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Ultimate destructive force devastates all enemies',
    effects: [{
      type: 'damage',
      element: 'fire',
      baseDamage: '10d15'
    }],
    tags: ['offensive', 'elemental', 'ultimate', 'mass']
  },

  m7_astral: {
    id: 'm7_astral' as SpellId,
    name: 'Astral',
    originalName: 'MAWXIWTZ',
    school: 'mage',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Astral energies strike all enemies with damage plus random status effect',
    effects: [{
      type: 'damage',
      element: 'neutral',
      baseDamage: '30'
    }, {
      type: 'special',
      special: 'random_status_effect'
    }],
    tags: ['offensive', 'neutral', 'ultimate', 'mass', 'status']
  },

  // ============= PRIEST SPELLS =============
  // Level 1 Priest Spells
  p1_heal: {
    id: 'p1_heal' as SpellId,
    name: 'Heal',
    originalName: 'DIOS',
    school: 'priest',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Restores 1-8 HP to single ally',
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
    mpCost: getMPCostForLevel(1),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 1-8 divine damage on single enemy',
    effects: [{
      type: 'damage',
      element: 'holy',
      baseDamage: '1d8'
    }],
    tags: ['offensive', 'divine']
  },

  p1_light: {
    id: 'p1_light' as SpellId,
    name: 'Light',
    originalName: 'MILWA',
    school: 'priest',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'self',
    inCombat: true,
    outOfCombat: true,
    description: 'Illuminates 3 blocks ahead for approximately 40 steps',
    effects: [{
      type: 'utility',
      subtype: 'light',
      duration: '40',
      special: 'range_3_blocks'
    }],
    tags: ['utility', 'exploration']
  },

  p1_caster_protection: {
    id: 'p1_caster_protection' as SpellId,
    name: 'Caster Protection',
    originalName: 'PORFIC',
    school: 'priest',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'self',
    inCombat: true,
    outOfCombat: false,
    description: 'Increases caster evasion by 4 for duration of combat',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: 4,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['defensive', 'buff']
  },

  // Level 2 Priest Spells
  p2_party_shield: {
    id: 'p2_party_shield' as SpellId,
    name: 'Party Shield',
    originalName: 'MATU',
    school: 'priest',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Increases party evasion by 2 for duration of combat',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: 2,
      duration: 'combat',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['defensive', 'buff', 'party']
  },

  p2_trap_detection: {
    id: 'p2_trap_detection' as SpellId,
    name: 'Trap Detection',
    originalName: 'CALFO',
    school: 'priest',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Detects trap type on chest with 95% accuracy',
    effects: [{
      type: 'utility',
      subtype: 'detect',
      special: 'trap_identification_95'
    }],
    tags: ['utility', 'detection']
  },

  p2_silence: {
    id: 'p2_silence' as SpellId,
    name: 'Silence',
    originalName: 'MONTINO',
    school: 'priest',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Silences enemy group, preventing spell casting',
    effects: [{
      type: 'status',
      statusType: 'silenced',
      duration: 'combat',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['control', 'debuff']
  },

  p2_locate_person: {
    id: 'p2_locate_person' as SpellId,
    name: 'Locate Person',
    originalName: 'KANDI',
    school: 'priest',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Roughly indicates location of lost party member in dungeon',
    effects: [{
      type: 'utility',
      subtype: 'locate',
      special: 'find_lost_member'
    }],
    tags: ['utility', 'exploration']
  },

  // Level 3 Priest Spells
  p3_identify_foe: {
    id: 'p3_identify_foe' as SpellId,
    name: 'Identify Foe',
    originalName: 'LATUMAPIC',
    school: 'priest',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'self',
    inCombat: true,
    outOfCombat: true,
    description: 'Reveals true identity of enemies during adventure',
    effects: [{
      type: 'utility',
      subtype: 'identify',
      special: 'reveal_enemy_identity',
      duration: 'adventure'
    }],
    tags: ['utility', 'knowledge']
  },

  p3_cure_paralysis: {
    id: 'p3_cure_paralysis' as SpellId,
    name: 'Cure Paralysis',
    originalName: 'DIALKO',
    school: 'priest',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Removes paralysis from one ally',
    effects: [{
      type: 'heal',
      cureStatuses: ['paralyzed']
    }],
    tags: ['healing', 'cure']
  },

  p3_greater_party_shield: {
    id: 'p3_greater_party_shield' as SpellId,
    name: 'Greater Party Shield',
    originalName: 'BAMATU',
    school: 'priest',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Increases party evasion by 3 for duration of combat',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: 3,
      duration: 'combat',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['defensive', 'buff', 'party']
  },

  p3_continuous_light: {
    id: 'p3_continuous_light' as SpellId,
    name: 'Continuous Light',
    originalName: 'LOMILWA',
    school: 'priest',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'self',
    inCombat: true,
    outOfCombat: true,
    description: 'Illuminates 3 blocks ahead continuously during adventure',
    effects: [{
      type: 'utility',
      subtype: 'light',
      duration: 'adventure',
      special: 'range_3_blocks'
    }],
    tags: ['utility', 'exploration']
  },

  // Level 4 Priest Spells
  p4_greater_heal: {
    id: 'p4_greater_heal' as SpellId,
    name: 'Greater Heal',
    originalName: 'DIAL',
    school: 'priest',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Restores 2-16 HP to single ally',
    effects: [{
      type: 'heal',
      baseHealing: '2d8'
    }],
    tags: ['healing', 'restoration']
  },

  p4_cure_poison: {
    id: 'p4_cure_poison' as SpellId,
    name: 'Cure Poison',
    originalName: 'LATUMOFIS',
    school: 'priest',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Removes poison from one ally',
    effects: [{
      type: 'heal',
      cureStatuses: ['poisoned']
    }],
    tags: ['healing', 'cure']
  },

  p4_protection_from_evil: {
    id: 'p4_protection_from_evil' as SpellId,
    name: 'Protection from Evil',
    originalName: 'MAPORFIC',
    school: 'priest',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Increases party evasion by 2 continuously during adventure',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: 2,
      duration: 'adventure',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: false
    }],
    tags: ['defensive', 'buff', 'party']
  },

  p4_holy_strike: {
    id: 'p4_holy_strike' as SpellId,
    name: 'Holy Strike',
    originalName: 'BARIKO',
    school: 'priest',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 6-15 divine damage on enemy group',
    effects: [{
      type: 'damage',
      element: 'holy',
      baseDamage: '6+1d10'
    }],
    tags: ['offensive', 'divine', 'area']
  },

  // Level 5 Priest Spells
  p5_superior_heal: {
    id: 'p5_superior_heal' as SpellId,
    name: 'Superior Heal',
    originalName: 'DIALMA',
    school: 'priest',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Restores 3-24 HP to single ally',
    effects: [{
      type: 'heal',
      baseHealing: '3d8'
    }],
    tags: ['healing', 'restoration']
  },

  p5_death: {
    id: 'p5_death' as SpellId,
    name: 'Death',
    originalName: 'BADI',
    school: 'priest',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Instantly kills single enemy (ineffective against undead and certain foes)',
    effects: [{
      type: 'instant_death',
      saveType: 'death',
      saveModifier: 0,
      special: 'not_undead'
    }],
    tags: ['offensive', 'death']
  },

  p5_resurrection: {
    id: 'p5_resurrection' as SpellId,
    name: 'Resurrection',
    originalName: 'DI',
    school: 'priest',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'dead',
    inCombat: false,
    outOfCombat: true,
    description: 'Resurrects dead ally with 1 HP',
    effects: [{
      type: 'special',
      special: 'resurrect_with_1hp'
    }],
    tags: ['resurrection', 'restoration']
  },

  p5_summon_undead: {
    id: 'p5_summon_undead' as SpellId,
    name: 'Summon Undead',
    originalName: 'BAMORDI',
    school: 'priest',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'self',
    inCombat: true,
    outOfCombat: false,
    description: 'Summons a random undead monster to fight for the party',
    effects: [{
      type: 'special',
      special: 'summon_undead_monster'
    }],
    tags: ['summon', 'utility']
  },

  // Level 6 Priest Spells
  p6_full_heal: {
    id: 'p6_full_heal' as SpellId,
    name: 'Full Heal',
    originalName: 'MADI',
    school: 'priest',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Fully restores HP and cures all conditions except death, ashed, and lost',
    effects: [{
      type: 'heal',
      special: 'full_heal',
      cureStatuses: ['poisoned', 'paralyzed', 'stoned', 'sleep', 'confused', 'afraid', 'charmed', 'berserk', 'blinded', 'silenced', 'cursed']
    }],
    tags: ['healing', 'restoration', 'ultimate', 'cure']
  },

  p6_life_steal: {
    id: 'p6_life_steal' as SpellId,
    name: 'Life Steal',
    originalName: 'LABADI',
    school: 'priest',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Drains enemy HP leaving 1-8 remaining, transfers HP to caster',
    effects: [{
      type: 'special',
      special: 'drain_hp_leave_1d8'
    }],
    tags: ['offensive', 'drain', 'healing']
  },

  p6_return_to_castle: {
    id: 'p6_return_to_castle' as SpellId,
    name: 'Return to Castle',
    originalName: 'LOKTOFEIT',
    school: 'priest',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'self',
    inCombat: true,
    outOfCombat: true,
    description: 'Instantly returns party to castle; spell is forgotten after use',
    effects: [{
      type: 'teleport',
      subtype: 'castle',
      special: 'forget_spell_after_use'
    }],
    tags: ['utility', 'teleport', 'escape']
  },

  p6_destroy_demon: {
    id: 'p6_destroy_demon' as SpellId,
    name: 'Destroy Demon',
    originalName: 'MOGATO',
    school: 'priest',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Instantly kills single demon-type enemy',
    effects: [{
      type: 'instant_death',
      saveType: 'death',
      saveModifier: 0,
      special: 'demon_only'
    }],
    tags: ['offensive', 'death', 'anti-demon']
  },

  // Level 7 Priest Spells
  p7_holy_blast: {
    id: 'p7_holy_blast' as SpellId,
    name: 'Holy Blast',
    originalName: 'MABARIKO',
    school: 'priest',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 18-60 divine damage on all enemies',
    effects: [{
      type: 'damage',
      element: 'holy',
      baseDamage: '18+1d43'
    }],
    tags: ['offensive', 'divine', 'ultimate', 'mass']
  },

  p7_true_resurrection: {
    id: 'p7_true_resurrection' as SpellId,
    name: 'True Resurrection',
    originalName: 'KADOLTO',
    school: 'priest',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'dead',
    inCombat: false,
    outOfCombat: true,
    description: 'Resurrects dead or ashed ally with full HP',
    effects: [{
      type: 'special',
      special: 'resurrect_full_hp'
    }],
    tags: ['resurrection', 'restoration', 'ultimate']
  },

  p7_mass_death: {
    id: 'p7_mass_death' as SpellId,
    name: 'Mass Death',
    originalName: 'BAKADI',
    school: 'priest',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Instantly kills enemy group (ineffective against undead and certain foes)',
    effects: [{
      type: 'instant_death',
      saveType: 'death',
      saveModifier: 0,
      special: 'not_undead'
    }],
    tags: ['offensive', 'death', 'area']
  },

  p7_mass_heal: {
    id: 'p7_mass_heal' as SpellId,
    name: 'Mass Heal',
    originalName: 'MADIAL',
    school: 'priest',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Restores 10-50 HP to all party members',
    effects: [{
      type: 'heal',
      baseHealing: '10+1d41'
    }],
    tags: ['healing', 'restoration', 'party', 'mass']
  },

  // ============= ALCHEMIST SPELLS =============
  // Level 1 Alchemist Spells
  a1_attack_boost: {
    id: 'a1_attack_boost' as SpellId,
    name: 'Attack Boost',
    originalName: 'OSLO',
    school: 'alchemist',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Boosts party attack power for several turns',
    effects: [{
      type: 'modifier',
      stat: 'attack',
      value: 2,
      duration: '3+1d3',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['buff', 'party', 'offensive']
  },

  a1_flee_boost: {
    id: 'a1_flee_boost' as SpellId,
    name: 'Flee Boost',
    originalName: 'NOLIS',
    school: 'alchemist',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Makes enemy group easier to flee from',
    effects: [{
      type: 'special',
      special: 'increase_flee_chance'
    }],
    tags: ['utility', 'escape']
  },

  a1_breath_effect: {
    id: 'a1_breath_effect' as SpellId,
    name: 'Breath Effect',
    originalName: 'NAGRA',
    school: 'alchemist',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Breath-like effect on single enemy',
    effects: [{
      type: 'damage',
      element: 'fire',
      baseDamage: '1d6',
      resistanceCheck: true
    }],
    tags: ['offensive', 'breath']
  },

  a1_haste: {
    id: 'a1_haste' as SpellId,
    name: 'Haste',
    originalName: 'PONTI',
    school: 'alchemist',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: false,
    description: 'Increases attack count but reduces evasion by 1 for one ally',
    effects: [{
      type: 'modifier',
      stat: 'attack',
      value: 1,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: false,
      countsOnlyInCombat: true,
      special: 'extra_attack'
    }, {
      type: 'modifier',
      stat: 'evasion',
      value: -1,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['buff', 'offensive', 'defensive']
  },

  // Level 2 Alchemist Spells
  a2_cloud_damage_fire: {
    id: 'a2_cloud_damage_fire' as SpellId,
    name: 'Cloud Damage Fire',
    originalName: 'LIQUREA',
    school: 'alchemist',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates fire cloud that damages enemy group 1-4 per turn for several turns',
    effects: [{
      type: 'special',
      special: 'cloud_damage_over_time',
      element: 'fire',
      baseDamage: '1d4',
      duration: '3+1d3',
      resistanceCheck: true
    }],
    tags: ['offensive', 'cloud', 'fire', 'area']
  },

  a2_weaken_resistance: {
    id: 'a2_weaken_resistance' as SpellId,
    name: 'Weaken Resistance',
    originalName: 'NOFIS',
    school: 'alchemist',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Lowers all enemies spell resistance',
    effects: [{
      type: 'modifier',
      stat: 'resistance',
      value: -25,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true
    }],
    tags: ['debuff', 'offensive', 'mass']
  },

  a2_dispel_cloud: {
    id: 'a2_dispel_cloud' as SpellId,
    name: 'Dispel Cloud',
    originalName: 'FISQUREA',
    school: 'alchemist',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Removes cloud-type spells affecting allies',
    effects: [{
      type: 'dispel',
      subtype: 'cloud',
      power: 100
    }],
    tags: ['utility', 'dispel', 'party']
  },

  a2_paralyze: {
    id: 'a2_paralyze' as SpellId,
    name: 'Paralyze',
    originalName: 'NAGUS',
    school: 'alchemist',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Stops enemy actions (paralysis)',
    effects: [{
      type: 'status',
      statusType: 'paralyzed',
      duration: 'combat',
      saveType: 'physical',
      saveModifier: 0,
      resistanceCheck: true
    }],
    tags: ['control', 'status']
  },

  // Level 3 Alchemist Spells
  a3_cloud_damage_ice: {
    id: 'a3_cloud_damage_ice' as SpellId,
    name: 'Cloud Damage Ice',
    originalName: 'DALQUREA',
    school: 'alchemist',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates ice cloud that damages enemy group 2-8 per turn for several turns',
    effects: [{
      type: 'special',
      special: 'cloud_damage_over_time',
      element: 'ice',
      baseDamage: '2d4',
      duration: '3+1d3',
      resistanceCheck: true
    }],
    tags: ['offensive', 'cloud', 'ice', 'area']
  },

  a3_mass_sleep: {
    id: 'a3_mass_sleep' as SpellId,
    name: 'Mass Sleep',
    originalName: 'KATIQUREA',
    school: 'alchemist',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Puts all enemies to sleep; sleeping enemies take double melee damage',
    effects: [{
      type: 'status',
      statusType: 'sleep',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0,
      resistanceCheck: true,
      special: 'double_melee_damage'
    }],
    tags: ['control', 'mass', 'status']
  },

  a3_attack_boost_long: {
    id: 'a3_attack_boost_long' as SpellId,
    name: 'Attack Boost Long',
    originalName: 'MAOSLO',
    school: 'alchemist',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Boosts party attack power for long duration',
    effects: [{
      type: 'modifier',
      stat: 'attack',
      value: 2,
      duration: '10+1d11',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['buff', 'party', 'offensive']
  },

  a3_cure_sleep: {
    id: 'a3_cure_sleep' as SpellId,
    name: 'Cure Sleep',
    originalName: 'ZIOFIC',
    school: 'alchemist',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Cures unconscious and sleep for party',
    effects: [{
      type: 'heal',
      cureStatuses: ['sleep']
    }],
    tags: ['healing', 'cure', 'party']
  },

  // Level 4 Alchemist Spells
  a4_cloud_damage: {
    id: 'a4_cloud_damage' as SpellId,
    name: 'Cloud Damage',
    originalName: 'KANIQUA',
    school: 'alchemist',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates cloud that damages enemy group 3-12 per turn for several turns',
    effects: [{
      type: 'special',
      special: 'cloud_damage_over_time',
      element: 'neutral',
      baseDamage: '3d4',
      duration: '3+1d3',
      resistanceCheck: true
    }],
    tags: ['offensive', 'cloud', 'area']
  },

  a4_resistance_boost: {
    id: 'a4_resistance_boost' as SpellId,
    name: 'Resistance Boost',
    originalName: 'FOFISC',
    school: 'alchemist',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Boosts party spell resistance for long duration',
    effects: [{
      type: 'modifier',
      stat: 'resistance',
      value: 50,
      duration: '10+1d11',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['buff', 'party', 'defensive']
  },

  a4_weaken_combat: {
    id: 'a4_weaken_combat' as SpellId,
    name: 'Weaken Combat',
    originalName: 'DARLIS',
    school: 'alchemist',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Lowers all enemies combat ability',
    effects: [{
      type: 'modifier',
      stat: 'attack',
      value: -3,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true
    }, {
      type: 'modifier',
      stat: 'damage',
      value: -2,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true
    }],
    tags: ['debuff', 'offensive', 'mass']
  },

  a4_spell_reflect: {
    id: 'a4_spell_reflect' as SpellId,
    name: 'Spell Reflect',
    originalName: 'BANOKA',
    school: 'alchemist',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Reflects enemy spells with some probability for 3 turns',
    effects: [{
      type: 'special',
      special: 'spell_reflect',
      duration: '3',
      power: 50,
      resistanceCheck: true
    }],
    tags: ['defensive', 'buff', 'party']
  },

  // Level 5 Alchemist Spells
  a5_cloud_damage_fire_strong: {
    id: 'a5_cloud_damage_fire_strong' as SpellId,
    name: 'Cloud Damage Fire Strong',
    originalName: 'MALIQUA',
    school: 'alchemist',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates strong fire cloud that damages enemy group 4-20 per turn for several turns',
    effects: [{
      type: 'special',
      special: 'cloud_damage_over_time',
      element: 'fire',
      baseDamage: '4d5',
      duration: '3+1d3',
      resistanceCheck: true
    }],
    tags: ['offensive', 'cloud', 'fire', 'area']
  },

  a5_summon: {
    id: 'a5_summon' as SpellId,
    name: 'Summon',
    originalName: 'GALDI',
    school: 'alchemist',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'self',
    inCombat: true,
    outOfCombat: false,
    description: 'Summons random monster (Vorpal Bunny, Garm, Staff, Golem, Stone Golem, Dragon, Dragon Zombie)',
    effects: [{
      type: 'special',
      special: 'summon_random_alchemist',
      resistanceCheck: true
    }],
    tags: ['summon', 'utility']
  },

  a5_cure_all: {
    id: 'a5_cure_all' as SpellId,
    name: 'Cure All',
    originalName: 'MORFIS',
    school: 'alchemist',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Cures fear, sleep, confusion, paralysis, and poison for party',
    effects: [{
      type: 'heal',
      cureStatuses: ['afraid', 'sleep', 'confused', 'paralyzed', 'poisoned'],
      resistanceCheck: true
    }],
    tags: ['healing', 'cure', 'party']
  },

  a5_cloud_poison: {
    id: 'a5_cloud_poison' as SpellId,
    name: 'Cloud Poison',
    originalName: 'LANIQUA',
    school: 'alchemist',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates poison cloud that damages enemy group 5-15 per turn and inflicts poison',
    effects: [{
      type: 'special',
      special: 'cloud_damage_over_time',
      element: 'acid',
      baseDamage: '5+1d11',
      duration: '3+1d3',
      resistanceCheck: true
    }, {
      type: 'status',
      statusType: 'poisoned',
      duration: -1,
      saveType: 'physical',
      saveModifier: 0,
      resistanceCheck: true
    }],
    tags: ['offensive', 'cloud', 'poison', 'area']
  },

  // Level 6 Alchemist Spells
  a6_cloud_damage_strong: {
    id: 'a6_cloud_damage_strong' as SpellId,
    name: 'Cloud Damage Strong',
    originalName: 'BAMOQUA',
    school: 'alchemist',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates strong cloud that damages enemy group 5-40 per turn for several turns',
    effects: [{
      type: 'special',
      special: 'cloud_damage_over_time',
      element: 'neutral',
      baseDamage: '5+1d36',
      duration: '3+1d3',
      resistanceCheck: true
    }],
    tags: ['offensive', 'cloud', 'area']
  },

  a6_full_heal: {
    id: 'a6_full_heal' as SpellId,
    name: 'Full Heal',
    originalName: 'KADIOS',
    school: 'alchemist',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Fully restores HP of one ally',
    effects: [{
      type: 'heal',
      special: 'full_heal'
    }],
    tags: ['healing', 'restoration', 'ultimate']
  },

  a6_mass_death: {
    id: 'a6_mass_death' as SpellId,
    name: 'Mass Death',
    originalName: 'MATOKANI',
    school: 'alchemist',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Instantly kills all enemies level 8 or below (ineffective against undead)',
    effects: [{
      type: 'instant_death',
      saveType: 'death',
      saveModifier: 0,
      special: 'level_8_or_below_not_undead',
      resistanceCheck: true
    }],
    tags: ['offensive', 'death', 'mass']
  },

  a6_remove_curse: {
    id: 'a6_remove_curse' as SpellId,
    name: 'Remove Curse',
    originalName: 'ZILFE',
    school: 'alchemist',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'any',
    inCombat: false,
    outOfCombat: true,
    description: 'Removes curse from item and destroys it (WARNING: Has critical bug in original game)',
    effects: [{
      type: 'special',
      special: 'remove_curse_destroy_item'
    }],
    tags: ['utility', 'curse', 'buggy']
  },

  // Level 7 Alchemist Spells
  a7_mega_damage: {
    id: 'a7_mega_damage' as SpellId,
    name: 'Mega Damage',
    originalName: 'ALIKUS',
    school: 'alchemist',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 65-130 damage on single enemy',
    effects: [{
      type: 'damage',
      element: 'neutral',
      baseDamage: '65+1d66'
    }],
    tags: ['offensive', 'ultimate']
  },

  a7_unlock: {
    id: 'a7_unlock' as SpellId,
    name: 'Unlock',
    originalName: 'CALNOVA',
    school: 'alchemist',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'any',
    inCombat: false,
    outOfCombat: true,
    description: 'Safely opens chest or unlocks door/gate',
    effects: [{
      type: 'special',
      special: 'safe_unlock'
    }],
    tags: ['utility', 'exploration']
  },

  a7_cloud_poison_strong: {
    id: 'a7_cloud_poison_strong' as SpellId,
    name: 'Cloud Poison Strong',
    originalName: 'GURENIQUA',
    school: 'alchemist',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates strong poison cloud that damages enemy group 10-40 per turn and inflicts poison',
    effects: [{
      type: 'special',
      special: 'cloud_damage_over_time',
      element: 'acid',
      baseDamage: '10+1d31',
      duration: '3+1d3',
      resistanceCheck: true
    }, {
      type: 'status',
      statusType: 'poisoned',
      duration: -1,
      saveType: 'physical',
      saveModifier: 0,
      resistanceCheck: true
    }],
    tags: ['offensive', 'cloud', 'poison', 'area', 'ultimate']
  },

  a7_cloud_damage_ice_strong: {
    id: 'a7_cloud_damage_ice_strong' as SpellId,
    name: 'Cloud Damage Ice Strong',
    originalName: 'MADALQUA',
    school: 'alchemist',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Creates strong ice cloud that damages enemy group 4-60 per turn for several turns',
    effects: [{
      type: 'special',
      special: 'cloud_damage_over_time',
      element: 'ice',
      baseDamage: '4+1d57',
      duration: '3+1d3',
      resistanceCheck: true
    }],
    tags: ['offensive', 'cloud', 'ice', 'area', 'ultimate']
  },

  // ============= PSIONIC SPELLS =============
  // Level 1 Psionic Spells
  s1_psi_damage_confuse: {
    id: 's1_psi_damage_confuse' as SpellId,
    name: 'Psi Damage Confuse',
    originalName: 'SIOS',
    school: 'psionic',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 1-10 psychic damage and confuses single enemy',
    effects: [{
      type: 'damage',
      element: 'psychic',
      baseDamage: '1+1d10',
      resistanceCheck: true
    }, {
      type: 'status',
      statusType: 'confused',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0,
      resistanceCheck: true
    }],
    tags: ['offensive', 'psychic', 'control']
  },

  s1_psi_heal: {
    id: 's1_psi_heal' as SpellId,
    name: 'Psi Heal',
    originalName: 'DIOMAS',
    school: 'psionic',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Restores 2-6 HP to single ally',
    effects: [{
      type: 'heal',
      baseHealing: '2+1d5',
      resistanceCheck: true
    }],
    tags: ['healing', 'restoration']
  },

  s1_ac_swap: {
    id: 's1_ac_swap' as SpellId,
    name: 'AC Swap',
    originalName: 'POBA',
    school: 'psionic',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Reduces all enemies evasion by 1, increases party evasion by 1',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: -1,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true,
      resistanceCheck: true
    }, {
      type: 'modifier',
      stat: 'evasion',
      value: 1,
      duration: 'combat',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['buff', 'debuff', 'party']
  },

  s1_charm_paralyze: {
    id: 's1_charm_paralyze' as SpellId,
    name: 'Charm Paralyze',
    originalName: 'GENES',
    school: 'psionic',
    level: 1,
    mpCost: getMPCostForLevel(1),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: true,
    description: 'Charms NPC or paralyzes enemy in combat',
    effects: [{
      type: 'status',
      statusType: 'paralyzed',
      duration: 'combat',
      saveType: 'mental',
      saveModifier: 0,
      special: 'charm_npc_outofcombat'
    }],
    tags: ['control', 'charm', 'utility']
  },

  // Level 2 Psionic Spells
  s2_group_psi_damage_confuse: {
    id: 's2_group_psi_damage_confuse' as SpellId,
    name: 'Group Psi Damage Confuse',
    originalName: 'RIOS',
    school: 'psionic',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 2-10 psychic damage and confuses enemy group',
    effects: [{
      type: 'damage',
      element: 'psychic',
      baseDamage: '2+1d9',
      resistanceCheck: true
    }, {
      type: 'status',
      statusType: 'confused',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0,
      resistanceCheck: true
    }],
    tags: ['offensive', 'psychic', 'control', 'area']
  },

  s2_detect_doors: {
    id: 's2_detect_doors' as SpellId,
    name: 'Detect Doors',
    originalName: 'DIAFIC',
    school: 'psionic',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Detects hidden doors for long duration',
    effects: [{
      type: 'utility',
      subtype: 'detect',
      special: 'detect_hidden_doors',
      duration: '40'
    }],
    tags: ['utility', 'exploration']
  },

  s2_see_through_walls: {
    id: 's2_see_through_walls' as SpellId,
    name: 'See Through Walls',
    originalName: 'CALKO',
    school: 'psionic',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'See through walls or check if block is rock',
    effects: [{
      type: 'utility',
      subtype: 'detect',
      special: 'see_through_walls_check_rock'
    }],
    tags: ['utility', 'exploration']
  },

  s2_cure_mental: {
    id: 's2_cure_mental' as SpellId,
    name: 'Cure Mental',
    originalName: 'KALRAS',
    school: 'psionic',
    level: 2,
    mpCost: getMPCostForLevel(2),
    targetType: 'ally',
    inCombat: true,
    outOfCombat: true,
    description: 'Cures fear, sleep, and confusion for one ally',
    effects: [{
      type: 'heal',
      cureStatuses: ['afraid', 'sleep', 'confused']
    }],
    tags: ['healing', 'cure']
  },

  // Level 3 Psionic Spells
  s3_group_paralyze: {
    id: 's3_group_paralyze' as SpellId,
    name: 'Group Paralyze',
    originalName: 'LORKS',
    school: 'psionic',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Paralyzes enemy group',
    effects: [{
      type: 'status',
      statusType: 'paralyzed',
      duration: 'combat',
      saveType: 'mental',
      saveModifier: 0,
      resistanceCheck: true
    }],
    tags: ['control', 'area']
  },

  s3_read_mind: {
    id: 's3_read_mind' as SpellId,
    name: 'Read Mind',
    originalName: 'NOBAIS',
    school: 'psionic',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'any',
    inCombat: false,
    outOfCombat: true,
    description: 'Reads NPC mind',
    effects: [{
      type: 'special',
      special: 'read_npc_mind'
    }],
    tags: ['utility', 'psychic']
  },

  s3_greater_ac_swap: {
    id: 's3_greater_ac_swap' as SpellId,
    name: 'Greater AC Swap',
    originalName: 'MAPOBA',
    school: 'psionic',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Reduces all enemies evasion by 2, increases party evasion by 2',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: -2,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true,
      resistanceCheck: true
    }, {
      type: 'modifier',
      stat: 'evasion',
      value: 2,
      duration: 'combat',
      affectsAllies: true,
      affectsEnemies: false,
      countsOnlyInCombat: true
    }],
    tags: ['buff', 'debuff', 'party']
  },

  s3_hide: {
    id: 's3_hide' as SpellId,
    name: 'Hide',
    originalName: 'REIMAR',
    school: 'psionic',
    level: 3,
    mpCost: getMPCostForLevel(3),
    targetType: 'self',
    inCombat: true,
    outOfCombat: false,
    description: 'Hides caster from enemies',
    effects: [{
      type: 'special',
      special: 'hide_caster',
      duration: 'combat',
      resistanceCheck: true
    }],
    tags: ['utility', 'stealth']
  },

  // Level 4 Psionic Spells
  s4_greater_group_psi_damage_confuse: {
    id: 's4_greater_group_psi_damage_confuse' as SpellId,
    name: 'Greater Group Psi Damage Confuse',
    originalName: 'MASIOS',
    school: 'psionic',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 2-16 psychic damage and confuses enemy group',
    effects: [{
      type: 'damage',
      element: 'psychic',
      baseDamage: '2d8',
      resistanceCheck: true
    }, {
      type: 'status',
      statusType: 'confused',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0,
      resistanceCheck: true
    }],
    tags: ['offensive', 'psychic', 'control', 'area']
  },

  s4_suppress_magic: {
    id: 's4_suppress_magic' as SpellId,
    name: 'Suppress Magic',
    originalName: 'BUREDEIM',
    school: 'psionic',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Confuses enemy group, suppressing spell/breath/summon actions',
    effects: [{
      type: 'status',
      statusType: 'confused',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0,
      resistanceCheck: true,
      special: 'suppress_spell_breath_summon'
    }],
    tags: ['control', 'debuff', 'area']
  },

  s4_spell_power_boost: {
    id: 's4_spell_power_boost' as SpellId,
    name: 'Spell Power Boost',
    originalName: 'KUREMAR',
    school: 'psionic',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: false,
    description: 'Boosts party offensive spell power',
    effects: [{
      type: 'special',
      special: 'boost_spell_power',
      value: 25,
      duration: 'combat',
      resistanceCheck: true
    }],
    tags: ['buff', 'party', 'offensive']
  },

  s4_weaken_attack: {
    id: 's4_weaken_attack' as SpellId,
    name: 'Weaken Attack',
    originalName: 'BADUMAS',
    school: 'psionic',
    level: 4,
    mpCost: getMPCostForLevel(4),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Lowers enemy group attack power',
    effects: [{
      type: 'modifier',
      stat: 'attack',
      value: -3,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true
    }],
    tags: ['debuff', 'offensive']
  },

  // Level 5 Psionic Spells
  s5_summon: {
    id: 's5_summon' as SpellId,
    name: 'Summon',
    originalName: 'ZAKALDI',
    school: 'psionic',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'self',
    inCombat: true,
    outOfCombat: false,
    description: 'Summons random psionic monster (Ninja, Roofmaster, Musashi, High Priestess, Reaper Lord, Samantha, Master Killer)',
    effects: [{
      type: 'special',
      special: 'summon_random_psionic',
      resistanceCheck: true
    }],
    tags: ['summon', 'utility']
  },

  s5_extended_map: {
    id: 's5_extended_map' as SpellId,
    name: 'Extended Map',
    originalName: 'MAKALMA',
    school: 'psionic',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Displays 5x5 map including unexplored areas',
    effects: [{
      type: 'utility',
      subtype: 'locate',
      special: 'show_5x5_map_including_unexplored'
    }],
    tags: ['utility', 'exploration']
  },

  s5_drain_mp: {
    id: 's5_drain_mp' as SpellId,
    name: 'Drain MP',
    originalName: 'HAKANIDO',
    school: 'psionic',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Lowers enemy group MP',
    effects: [{
      type: 'special',
      special: 'drain_mp',
      power: 10,
      resistanceCheck: true
    }],
    tags: ['offensive', 'drain']
  },

  s5_ice_blast: {
    id: 's5_ice_blast' as SpellId,
    name: 'Ice Blast',
    originalName: 'DALOSTO',
    school: 'psionic',
    level: 5,
    mpCost: getMPCostForLevel(5),
    targetType: 'enemy',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 12-60 ice damage on single enemy',
    effects: [{
      type: 'damage',
      element: 'ice',
      baseDamage: '12+1d49',
      resistanceCheck: true
    }],
    tags: ['offensive', 'ice']
  },

  // Level 6 Psionic Spells
  s6_identify: {
    id: 's6_identify' as SpellId,
    name: 'Identify',
    originalName: 'CALDU',
    school: 'psionic',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'any',
    inCombat: false,
    outOfCombat: true,
    description: 'Identifies item properties',
    effects: [{
      type: 'utility',
      subtype: 'identify',
      special: 'identify_item'
    }],
    tags: ['utility', 'knowledge']
  },

  s6_fear_and_weaken: {
    id: 's6_fear_and_weaken' as SpellId,
    name: 'Fear and Weaken',
    originalName: 'MAMORLIS',
    school: 'psionic',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Reduces all enemies evasion by 4 and inflicts fear',
    effects: [{
      type: 'modifier',
      stat: 'evasion',
      value: -4,
      duration: 'combat',
      affectsAllies: false,
      affectsEnemies: true,
      countsOnlyInCombat: true
    }, {
      type: 'status',
      statusType: 'afraid',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0
    }],
    tags: ['debuff', 'control', 'mass']
  },

  s6_party_heal: {
    id: 's6_party_heal' as SpellId,
    name: 'Party Heal',
    originalName: 'MADIOS',
    school: 'psionic',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'allAllies',
    inCombat: true,
    outOfCombat: true,
    description: 'Restores 6-18 HP to all party members',
    effects: [{
      type: 'heal',
      baseHealing: '6+1d13',
      resistanceCheck: true
    }],
    tags: ['healing', 'restoration', 'party']
  },

  s6_psi_blast: {
    id: 's6_psi_blast' as SpellId,
    name: 'Psi Blast',
    originalName: 'BURENES',
    school: 'psionic',
    level: 6,
    mpCost: getMPCostForLevel(6),
    targetType: 'group',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 8-64 psychic damage on enemy group',
    effects: [{
      type: 'damage',
      element: 'psychic',
      baseDamage: '8d8',
      resistanceCheck: true
    }],
    tags: ['offensive', 'psychic', 'area']
  },

  // Level 7 Psionic Spells
  s7_ultimate_psi_damage: {
    id: 's7_ultimate_psi_damage' as SpellId,
    name: 'Ultimate Psi Damage',
    originalName: 'GULTOMAS',
    school: 'psionic',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 12-48 psychic damage on all enemies plus sleep/paralysis/confusion/stone',
    effects: [{
      type: 'damage',
      element: 'psychic',
      baseDamage: '12+1d37',
      resistanceCheck: true
    }, {
      type: 'special',
      special: 'random_multi_status',
      statusType: 'all',
      resistanceCheck: true
    }],
    tags: ['offensive', 'psychic', 'mass', 'ultimate', 'status']
  },

  s7_npc_list: {
    id: 's7_npc_list' as SpellId,
    name: 'NPC List',
    originalName: 'NOSBADI',
    school: 'psionic',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'self',
    inCombat: false,
    outOfCombat: true,
    description: 'Displays list of previously met NPCs',
    effects: [{
      type: 'special',
      special: 'show_npc_list'
    }],
    tags: ['utility', 'knowledge']
  },

  s7_mass_psi_damage_confuse: {
    id: 's7_mass_psi_damage_confuse' as SpellId,
    name: 'Mass Psi Damage Confuse',
    originalName: 'LASIOS',
    school: 'psionic',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'allEnemies',
    inCombat: true,
    outOfCombat: false,
    description: 'Inflicts 9-72 psychic damage and confuses all enemies',
    effects: [{
      type: 'damage',
      element: 'psychic',
      baseDamage: '9d8',
      resistanceCheck: true
    }, {
      type: 'status',
      statusType: 'confused',
      duration: '3+1d3',
      saveType: 'mental',
      saveModifier: 0,
      resistanceCheck: true
    }],
    tags: ['offensive', 'psychic', 'mass', 'ultimate', 'control']
  },

  s7_stat_boost: {
    id: 's7_stat_boost' as SpellId,
    name: 'Stat Boost',
    originalName: 'IHALON',
    school: 'psionic',
    level: 7,
    mpCost: getMPCostForLevel(7),
    targetType: 'ally',
    inCombat: false,
    outOfCombat: true,
    description: 'Choose one: rejuvenate age, or boost ST/IQ/PI/VT/AG/LK, or change personality (if age ≤19 and stat maxed); spell is forgotten after use',
    effects: [{
      type: 'special',
      special: 'boost_stat_or_personality',
      subtype: 'forget_after_use'
    }],
    tags: ['utility', 'ultimate', 'stat']
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