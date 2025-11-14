import {
  MinimalContext,
  StandardContext,
  RichContext,
  GameEvent,
  BuiltPrompt
} from '../../types/BanterTypes';
import { GAME_CONFIG } from '../../config/GameConstants';
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
    return `You generate character banter for a medieval fantasy dungeon crawler RPG.

PERSONALITY TRAITS:

Temperament (how they react):
- Brave: Fearless, confident, rushes into danger
- Cautious: Careful, risk-averse, thinks before acting
- Reckless: Impulsive, thrill-seeking, disregards safety
- Calculating: Analytical, strategic, weighs odds

Social (how they interact):
- Friendly: Warm, approachable, seeks connection
- Gruff: Rough, brusque, uncomfortable with emotion
- Sarcastic: Mocking, witty, uses humor as shield
- Earnest: Sincere, honest, takes things seriously

Outlook (how they view the world):
- Optimistic: Hopeful, sees the bright side
- Pessimistic: Expects the worst, sees danger
- Pragmatic: Practical, focused on what works
- Idealistic: Guided by principles and values

Speech Style (how they talk):
- Verbose: Long-winded, elaborate, detailed
- Taciturn: Few words, terse, economical
- Poetic: Metaphorical, lyrical, artistic
- Blunt: Direct, straightforward, no subtlety

OUTPUT RULES:
- Match character personality exactly
- Solo musing: 1-2 sentences max
- Two-person exchange: 2-4 lines total
- Group conversation: 4-6 lines total
- Format each line as: "Name: dialogue"
- Use medieval fantasy tone (no modern slang)
- DO NOT mention specific items or equipment
- DO NOT reference events not provided in context
- Keep responses brief and conversational`;
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
    prompt += `Personality: ${speaker.personality.temperament}, ${speaker.personality.social}, ${speaker.personality.outlook}, ${speaker.personality.speech}\n`;

    if (speaker.status && speaker.status.length > 0) {
      prompt += `Status: ${speaker.status.join(', ')}\n`;
    }

    prompt += `\nLocation: Floor ${location.floor}`;
    if (location.isDark) {
      prompt += `, dark zone`;
    }
    prompt += `\n`;

    prompt += `Trigger: ${this.formatTriggerDetails(trigger)}\n`;

    if ('party' in context) {
      const party = context.party;
      prompt += `\nParty:\n`;
      for (const member of party.members) {
        if (member.name === speaker.name) continue;
        prompt += `- ${member.name}, ${member.race} ${member.class}, level ${member.level}`;
        prompt += ` (${member.personality.temperament}, ${member.personality.social})`;
        if (member.status && member.status.length > 0) {
          prompt += ` [${member.status.join(', ')}]`;
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

  private static formatTriggerDetails(trigger: any): string {
    switch (trigger.type) {
      case 'character_death':
        return trigger.details;
      case 'low_hp_warning':
        return 'Party HP is critically low';
      case 'dark_zone_entry':
        return 'Party entered a dark zone';
      case 'ambient_time':
        return 'Time passing in dungeon';
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
