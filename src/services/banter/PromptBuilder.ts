import {
  MinimalContext,
  StandardContext,
  RichContext,
  GameEvent,
  BuiltPrompt,
  PersonalityTraits
} from '../../types/BanterTypes';
import { GAME_CONFIG } from '../../config/GameConstants';
import { DIALOGUE_PROMPTS } from '../../config/DialoguePrompts';
import { RandomSelector } from '../../utils/RandomSelector';
import { DebugLogger } from '../../utils/DebugLogger';

export class PromptBuilder {
  static buildPrompt(context: MinimalContext | StandardContext | RichContext): BuiltPrompt {
    const exchangeType = this.selectExchangeType(context);
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(context, exchangeType);

    const totalLength = systemPrompt.length + userPrompt.length;
    const estimatedTokens = Math.floor(totalLength / 4);

    DebugLogger.info('PromptBuilder', 'Built prompt', {
      triggerType: context.trigger.type,
      exchangeType,
      speaker: context.speaker.name,
      estimatedTokens
    });

    return {
      systemPrompt,
      userPrompt,
      metadata: {
        triggerType: context.trigger.type,
        exchangeType,
        speaker: context.speaker.name,
        estimatedTokens
      }
    };
  }

  private static selectExchangeType(
    context: MinimalContext | StandardContext | RichContext
  ): 'solo' | 'two_person' | 'group' {
    const distribution = GAME_CONFIG.BANTER.EXCHANGE_DISTRIBUTION;

    const options = [
      { item: 'solo' as const, weight: distribution.SOLO_WEIGHT },
      { item: 'two_person' as const, weight: distribution.TWO_PERSON_WEIGHT },
      { item: 'group' as const, weight: distribution.GROUP_WEIGHT }
    ];

    const partySize = 'party' in context ? context.party.members.length : 1;

    if (partySize === 1) {
      return 'solo';
    }

    if (partySize === 2) {
      return RandomSelector.selectWeighted([
        { item: 'solo' as const, weight: distribution.SOLO_WEIGHT },
        { item: 'two_person' as const, weight: distribution.TWO_PERSON_WEIGHT }
      ]);
    }

    return RandomSelector.selectWeighted(options);
  }

  private static buildSystemPrompt(): string {
    const config = DIALOGUE_PROMPTS.BANTER.SYSTEM;

    let prompt = config.INTRO + '\n\n';
    prompt += config.TRAIT_CONTEXT + '\n\n';
    prompt += config.EXAMPLES + '\n\n';
    prompt += 'OUTPUT RULES:\n';

    for (const rule of config.OUTPUT_RULES) {
      prompt += `- ${rule}\n`;
    }

    return prompt.trim();
  }

  private static buildUserPrompt(
    context: MinimalContext | StandardContext | RichContext,
    exchangeType: 'solo' | 'two_person' | 'group'
  ): string {
    const speaker = context.speaker;
    const location = context.location;
    const trigger = context.trigger;

    let prompt = '';

    prompt += `Character: ${speaker.name}, ${speaker.race} ${speaker.class}, level ${speaker.level}\n`;
    prompt += this.formatPersonalityInline(speaker.personality);

    if (speaker.status && speaker.status.length > 0) {
      prompt += `Status: ${speaker.status.join(', ')}\n`;
    }

    prompt += `\nLocation: Floor ${location.floor}`;
    if (location.isDark) {
      prompt += `, dark zone`;
    }
    prompt += `\n`;

    if (trigger.type !== 'ambient_time' && trigger.type !== 'ambient_distance') {
      prompt += `Trigger: ${this.formatTriggerDetails(trigger)}\n`;
    }

    if (location.timeInDungeonMinutes < 20) {
      prompt += `(Context: Party recently entered - only ${location.timeInDungeonMinutes} minutes in dungeon)\n`;
    }

    if ('party' in context) {
      const party = context.party;
      prompt += `\nParty members:\n`;
      for (const member of party.members) {
        if (member.name === speaker.name) continue;
        prompt += `- ${member.name}, ${member.race} ${member.class}, level ${member.level}\n`;
        prompt += this.formatPersonalityInline(member.personality, '  ');
        if (member.status && member.status.length > 0) {
          prompt += `  Status: ${member.status.join(', ')}\n`;
        }
        prompt += `\n`;
      }

      if (party.avgHpPercent < 50) {
        prompt += `Party HP: Low (${Math.floor(party.avgHpPercent)}%)\n`;
      }

      if (party.hasActiveStatusEffects) {
        prompt += `Party has active status effects\n`;
      }
    }

    if ('recentEvents' in context && context.recentEvents.length > 0) {
      prompt += `\nRecent events:\n`;
      for (const event of context.recentEvents) {
        prompt += `- ${this.formatEventDetails(event)}\n`;
      }
    }

    prompt += `\n`;
    prompt += this.getExchangeTypePrompt(exchangeType, speaker.name);

    return prompt;
  }

  private static formatPersonalityInline(personality: PersonalityTraits, indent: string = ''): string {
    const traits = DIALOGUE_PROMPTS.BANTER.TRAIT_DESCRIPTIONS;
    let result = '';

    result += `${indent}- Temperament: ${personality.temperament} (${traits.TEMPERAMENT[personality.temperament]})\n`;
    result += `${indent}- Social: ${personality.social} (${traits.SOCIAL[personality.social]})\n`;
    result += `${indent}- Outlook: ${personality.outlook} (${traits.OUTLOOK[personality.outlook]})\n`;
    result += `${indent}- Speech: ${personality.speech} (${traits.SPEECH[personality.speech]})\n`;

    return result;
  }

  private static formatTriggerDetails(trigger: any): string {
    switch (trigger.type) {
      case 'character_death':
        return trigger.details;
      case 'low_hp_warning':
        return 'Party HP is critically low';
      case 'dark_zone_entry':
        return 'Party entered a dark zone';
      case 'ambient_time':
        return 'Moment of quiet in dungeon';
      case 'ambient_distance':
        return 'Exploring deeper into dungeon';
      default:
        return trigger.details || trigger.type;
    }
  }

  private static formatEventDetails(event: GameEvent): string {
    switch (event.type) {
      case 'character_death':
        return `${event.characterName} died`;
      case 'dark_zone_entry':
        return 'Entered dark zone';
      case 'combat_victory':
        return event.details;
      case 'treasure_found':
        return event.details;
      default:
        return event.details;
    }
  }

  private static getExchangeTypePrompt(exchangeType: 'solo' | 'two_person' | 'group', speakerName: string): string {
    switch (exchangeType) {
      case 'solo':
        return `Generate a brief solo musing from ${speakerName}.`;
      case 'two_person':
        return `Generate a brief two-person exchange between ${speakerName} and one other party member.`;
      case 'group':
        return `Generate a brief group conversation starting with ${speakerName}.`;
    }
  }
}
