import {
  BanterTrigger,
  BanterTriggerType,
  CharacterInfo,
  LocationInfo,
  MinimalContext,
  PartyInfo,
  RichContext,
  StandardContext,
  PersonalityTraits,
  Temperament,
  Social,
  Outlook,
  SpeechStyle
} from '../../types/BanterTypes';
import { Character } from '../../entities/Character';
import { Party } from '../../entities/Party';
import { CharacterStatus, GameState } from '../../types/GameTypes';
import { BanterEventTracker } from './BanterEventTracker';
import { RandomSelector } from '../../utils/RandomSelector';
import { DebugLogger } from '../../utils/DebugLogger';

export class ContextBuilder {
  private eventTracker: BanterEventTracker;

  constructor(eventTracker: BanterEventTracker) {
    this.eventTracker = eventTracker;
  }

  buildMinimalContext(trigger: BanterTrigger, gameState: GameState): MinimalContext {
    const speaker = this.selectSpeaker(gameState.party, trigger);
    const location = this.buildLocationInfo(gameState);

    const context: MinimalContext = {
      trigger,
      speaker: this.buildCharacterInfo(speaker),
      location
    };

    DebugLogger.info('ContextBuilder', 'Built minimal context', {
      triggerType: trigger.type,
      speaker: speaker.name,
      floor: location.floor,
      estimatedTokens: 500
    });

    return context;
  }

  buildStandardContext(trigger: BanterTrigger, gameState: GameState): StandardContext {
    const minimalContext = this.buildMinimalContext(trigger, gameState);
    const party = this.buildPartyInfo(gameState.party);

    const context: StandardContext = {
      ...minimalContext,
      party
    };

    DebugLogger.info('ContextBuilder', 'Built standard context', {
      triggerType: trigger.type,
      partySize: party.members.length,
      estimatedTokens: 2000
    });

    return context;
  }

  buildRichContext(trigger: BanterTrigger, gameState: GameState): RichContext {
    const standardContext = this.buildStandardContext(trigger, gameState);
    const recentEvents = this.eventTracker.getRecentEvents();

    const context: RichContext = {
      ...standardContext,
      recentEvents
    };

    DebugLogger.info('ContextBuilder', 'Built rich context', {
      triggerType: trigger.type,
      eventCount: recentEvents.length,
      estimatedTokens: 4000
    });

    return context;
  }

  buildContext(trigger: BanterTrigger, gameState: GameState): MinimalContext | StandardContext | RichContext {
    const tier = this.selectTier(trigger.type);

    switch (tier) {
      case 'rich':
        return this.buildRichContext(trigger, gameState);
      case 'standard':
        return this.buildStandardContext(trigger, gameState);
      case 'minimal':
      default:
        return this.buildMinimalContext(trigger, gameState);
    }
  }

  private selectTier(triggerType: BanterTriggerType): 'minimal' | 'standard' | 'rich' {
    switch (triggerType) {
      case BanterTriggerType.CharacterDeath:
        return 'rich';
      case BanterTriggerType.LowHpWarning:
      case BanterTriggerType.DarkZoneEntry:
        return 'standard';
      case BanterTriggerType.AmbientTime:
      case BanterTriggerType.AmbientDistance:
      default:
        return 'minimal';
    }
  }

  buildCharacterInfo(character: Character): CharacterInfo {
    const personality: PersonalityTraits = character.personality || {
      temperament: Temperament.Brave,
      social: Social.Friendly,
      outlook: Outlook.Pragmatic,
      speech: SpeechStyle.Blunt
    };

    const statuses: CharacterStatus[] = character.statuses.map(effect => effect.type);

    return {
      name: character.name,
      race: character.race,
      class: character.class,
      level: character.level,
      alignment: character.alignment,
      personality,
      hp: character.hp,
      maxHp: character.maxHp,
      mp: character.mp,
      maxMp: character.maxMp,
      status: statuses
    };
  }

  buildPartyInfo(party: Party): PartyInfo {
    const aliveCharacters = party.getAliveCharacters();

    if (aliveCharacters.length === 0) {
      return {
        members: [],
        avgHpPercent: 0,
        avgMpPercent: 0,
        hasActiveStatusEffects: false
      };
    }

    const members = aliveCharacters.map(char => this.buildCharacterInfo(char));

    const totalHpPercent = aliveCharacters.reduce((sum, char) => {
      return sum + (char.maxHp > 0 ? (char.hp / char.maxHp) * 100 : 0);
    }, 0);
    const avgHpPercent = totalHpPercent / aliveCharacters.length;

    const totalMpPercent = aliveCharacters.reduce((sum, char) => {
      return sum + (char.maxMp > 0 ? (char.mp / char.maxMp) * 100 : 0);
    }, 0);
    const avgMpPercent = totalMpPercent / aliveCharacters.length;

    const hasActiveStatusEffects = aliveCharacters.some(char => char.statuses.length > 0);

    return {
      members,
      avgHpPercent,
      avgMpPercent,
      hasActiveStatusEffects
    };
  }

  buildLocationInfo(gameState: GameState): LocationInfo {
    const party = gameState.party;
    const currentFloor = gameState.currentFloor;

    const isDark = this.checkIsDark(gameState, party.x, party.y);

    return {
      floor: currentFloor,
      isDark
    };
  }

  private checkIsDark(gameState: GameState, x: number, y: number): boolean {
    const currentFloor = gameState.currentFloor;

    if (!gameState.dungeon || gameState.dungeon.length === 0) {
      return false;
    }

    const dungeonLevel = gameState.dungeon[currentFloor - 1];
    if (!dungeonLevel) {
      return false;
    }

    const darknessEvent = dungeonLevel.events.find(
      event => event.type === 'darkness' && event.x === x && event.y === y
    );

    return !!darknessEvent;
  }

  selectSpeaker(party: Party, trigger: BanterTrigger): Character {
    const aliveCharacters = party.getAliveCharacters();

    if (aliveCharacters.length === 0) {
      DebugLogger.error('ContextBuilder', 'No alive characters to select as speaker');
      throw new Error('Cannot select speaker: no alive characters');
    }

    if (trigger.type === BanterTriggerType.CharacterDeath && trigger.details) {
      const deadCharacterName = this.extractCharacterNameFromDetails(trigger.details);
      const survivors = aliveCharacters.filter(char => char.name !== deadCharacterName);

      if (survivors.length > 0) {
        const speaker = RandomSelector.selectRandom(survivors);
        DebugLogger.debug('ContextBuilder', 'Selected speaker (excluding dead character)', {
          speaker: speaker.name,
          deadCharacter: deadCharacterName
        });
        return speaker;
      }
    }

    const speaker = RandomSelector.selectRandom(aliveCharacters);
    DebugLogger.debug('ContextBuilder', 'Selected speaker', {
      speaker: speaker.name,
      triggerType: trigger.type
    });
    return speaker;
  }

  private extractCharacterNameFromDetails(details: string): string {
    const match = details.match(/^(.+?)\s+(has died|died)/i);
    return match ? match[1] : '';
  }
}
