import {
  BanterValidator as IBanterValidator,
  BanterResponse,
  MinimalContext,
  StandardContext,
  RichContext,
  ValidationResult
} from '../../types/BanterTypes';
import { DebugLogger } from '../../utils/DebugLogger';

export class BanterValidator implements IBanterValidator {
  private consecutiveFailures: number = 0;

  validate(
    response: BanterResponse,
    context: MinimalContext | StandardContext | RichContext
  ): ValidationResult {
    const errors: string[] = [];

    this.checkCharacterNames(response, context, errors);
    this.checkNoItemReferences(response, errors);
    this.checkNoModernSlang(response, errors);
    this.checkFormat(response, errors);
    this.checkNoEmptyLines(response, errors);
    this.checkLength(response, errors);

    const valid = errors.length === 0;

    if (!valid) {
      this.consecutiveFailures++;
      DebugLogger.warn('BanterValidator', 'Validation failed', {
        errors,
        consecutiveFailures: this.consecutiveFailures,
        exchangeType: response.exchangeType,
        lineCount: response.lines.length
      });

      if (this.consecutiveFailures >= 3) {
        DebugLogger.error('BanterValidator', 'Alert: 3+ consecutive validation failures', {
          consecutiveFailures: this.consecutiveFailures
        });
      }
    } else {
      this.consecutiveFailures = 0;
      DebugLogger.info('BanterValidator', 'Validation passed', {
        exchangeType: response.exchangeType,
        lineCount: response.lines.length,
        participants: response.participants
      });
    }

    return { valid, errors };
  }

  private checkCharacterNames(
    response: BanterResponse,
    context: MinimalContext | StandardContext | RichContext,
    errors: string[]
  ): void {
    const validNames = new Set<string>();
    validNames.add(context.speaker.name);

    if ('party' in context) {
      for (const member of context.party.members) {
        validNames.add(member.name);
      }
    }

    for (const line of response.lines) {
      if (!validNames.has(line.characterName)) {
        errors.push(`Invalid character name: "${line.characterName}" is not in the party`);
      }
    }
  }

  private checkNoItemReferences(response: BanterResponse, errors: string[]): void {
    const itemKeywords = [
      'sword', 'axe', 'mace', 'staff', 'bow', 'dagger', 'spear', 'shield',
      'armor', 'helmet', 'boots', 'gloves', 'ring', 'amulet', 'cloak',
      'potion', 'scroll', 'wand', 'rod', 'flask', 'elixir',
      'longsword', 'shortsword', 'battleaxe', 'warhammer', 'longbow', 'crossbow',
      'leather armor', 'chainmail', 'plate armor', 'scale armor',
      'healing potion', 'mana potion', 'antidote'
    ];

    for (const line of response.lines) {
      const lowerText = line.text.toLowerCase();
      for (const keyword of itemKeywords) {
        if (lowerText.includes(keyword)) {
          errors.push(`Item reference found in dialogue: "${keyword}" in "${line.text}"`);
        }
      }
    }
  }

  private checkNoModernSlang(response: BanterResponse, errors: string[]): void {
    const modernSlang = [
      'cool', 'okay', 'yeah', 'nope', 'yup', 'nah', 'dude', 'bro', 'guys',
      'awesome', 'crazy', 'insane', 'literally', 'basically', 'actually',
      'whatever', 'totally', 'super', 'pretty much', 'kind of', 'sort of',
      'like', 'you know', 'I mean', 'right', 'for real'
    ];

    for (const line of response.lines) {
      const lowerText = line.text.toLowerCase();
      for (const slang of modernSlang) {
        const pattern = new RegExp(`\\b${slang}\\b`, 'i');
        if (pattern.test(lowerText)) {
          errors.push(`Modern slang found in dialogue: "${slang}" in "${line.text}"`);
        }
      }
    }
  }

  private checkFormat(response: BanterResponse, errors: string[]): void {
    for (const line of response.lines) {
      if (!line.characterName || line.characterName.trim().length === 0) {
        errors.push(`Line missing character name: "${line.text}"`);
      }
      if (!line.text || line.text.trim().length === 0) {
        errors.push(`Line has empty dialogue text for character: "${line.characterName}"`);
      }
    }
  }

  private checkNoEmptyLines(response: BanterResponse, errors: string[]): void {
    if (response.lines.length === 0) {
      errors.push('Response contains no dialogue lines');
    }
  }

  private checkLength(response: BanterResponse, errors: string[]): void {
    const lineCount = response.lines.length;
    const exchangeType = response.exchangeType;

    switch (exchangeType) {
      case 'solo':
        if (lineCount < 1 || lineCount > 2) {
          errors.push(`Solo exchange should have 1-2 lines, got ${lineCount}`);
        }
        break;
      case 'two_person':
        if (lineCount < 2 || lineCount > 4) {
          errors.push(`Two-person exchange should have 2-4 lines, got ${lineCount}`);
        }
        break;
      case 'group':
        if (lineCount < 4 || lineCount > 6) {
          errors.push(`Group exchange should have 4-6 lines, got ${lineCount}`);
        }
        break;
    }
  }
}
