import { CharacterRace, CharacterClass, CharacterAlignment } from '../types/GameTypes';

export interface StarterCharacterTemplate {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  gender: 'male' | 'female';
  alignment: CharacterAlignment;
  bonusPointAllocation: {
    strength: number;
    intelligence: number;
    piety: number;
    vitality: number;
    agility: number;
    luck: number;
  };
  equipmentIds: {
    weapon?: string;
    armor?: string;
  };
  inventoryItemIds?: string[];
}

export const STARTER_CHARACTER_TEMPLATES: StarterCharacterTemplate[] = [
  {
    name: 'Throk',
    race: 'Lizman',
    class: 'Fighter',
    gender: 'male',
    alignment: 'Good',
    bonusPointAllocation: {
      strength: 8,
      intelligence: 0,
      piety: 0,
      vitality: 2,
      agility: 0,
      luck: 0
    },
    equipmentIds: {
      weapon: 'poison_dagger',
      armor: 'leather_armor'
    },
    inventoryItemIds: ['cursed_blade']
  },
  {
    name: 'Gilda',
    race: 'Dwarf',
    class: 'Fighter',
    gender: 'female',
    alignment: 'Good',
    bonusPointAllocation: {
      strength: 8,
      intelligence: 0,
      piety: 0,
      vitality: 2,
      agility: 0,
      luck: 0
    },
    equipmentIds: {
      weapon: 'paralyzing_mace',
      armor: 'leather_armor'
    }
  },
  {
    name: 'Whisper',
    race: 'Faerie',
    class: 'Mage',
    gender: 'female',
    alignment: 'Good',
    bonusPointAllocation: {
      strength: 0,
      intelligence: 10,
      piety: 0,
      vitality: 0,
      agility: 0,
      luck: 0
    },
    equipmentIds: {
      weapon: 'staff',
      armor: 'robe'
    }
  },
  {
    name: 'Bramble',
    race: 'Gnome',
    class: 'Priest',
    gender: 'male',
    alignment: 'Good',
    bonusPointAllocation: {
      strength: 0,
      intelligence: 0,
      piety: 10,
      vitality: 0,
      agility: 0,
      luck: 0
    },
    equipmentIds: {
      weapon: 'mace',
      armor: 'robe'
    }
  },
  {
    name: 'Pippin',
    race: 'Hobbit',
    class: 'Thief',
    gender: 'male',
    alignment: 'Neutral',
    bonusPointAllocation: {
      strength: 0,
      intelligence: 0,
      piety: 0,
      vitality: 0,
      agility: 7,
      luck: 3
    },
    equipmentIds: {
      weapon: 'dagger',
      armor: 'leather_armor'
    }
  },
  {
    name: 'Minerva',
    race: 'Gnome',
    class: 'Bishop',
    gender: 'female',
    alignment: 'Good',
    bonusPointAllocation: {
      strength: 0,
      intelligence: 5,
      piety: 5,
      vitality: 0,
      agility: 0,
      luck: 0
    },
    equipmentIds: {
      weapon: 'mace',
      armor: 'robe'
    }
  }
];




