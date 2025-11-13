import { Character } from '../../entities/Character';
import { PersonalityTraits, Temperament, Social, Outlook, SpeechStyle } from '../../types/BanterTypes';
import { RandomSelector } from '../../utils/RandomSelector';
import { ColorPalette } from '../../utils/ColorPalette';
import { DebugLogger } from '../../utils/DebugLogger';

export class CharacterPersonalityService {
  assignRandomPersonality(character: Character): void {
    const personality: PersonalityTraits = {
      temperament: RandomSelector.selectRandomFromEnum(Temperament),
      social: RandomSelector.selectRandomFromEnum(Social),
      outlook: RandomSelector.selectRandomFromEnum(Outlook),
      speech: RandomSelector.selectRandomFromEnum(SpeechStyle),
    };

    (character as any).personality = personality;

    DebugLogger.info('CharacterPersonalityService', `Assigned personality to ${character.name}`, {
      characterName: character.name,
      personality,
    });
  }

  assignRandomDialogueColor(character: Character): void {
    const color = ColorPalette.getRandomColor();
    (character as any).dialogueColor = color;

    DebugLogger.info('CharacterPersonalityService', `Assigned dialogue color to ${character.name}`, {
      characterName: character.name,
      color,
    });
  }

  initializeCharacterPersonality(character: Character): void {
    this.assignRandomPersonality(character);
    this.assignRandomDialogueColor(character);

    DebugLogger.info('CharacterPersonalityService', `Initialized personality for ${character.name}`, {
      characterName: character.name,
    });
  }
}
