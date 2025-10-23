import { SpellEffectProcessor, EffectTarget, EffectResult } from '../SpellEffectProcessor';
import { Character } from '../../../entities/Character';
import { SpellData, SpellCastingContext } from '../../../types/SpellTypes';
import { CureEffectConfig, SpellEffectConfig, STATUS_CURE_GROUPS } from '../../../data/spells/SpellEffectTypes';
import { StatusEffectSystem } from '../../StatusEffectSystem';
import { CharacterStatus } from '../../../types/GameTypes';
import { DebugLogger } from '../../../utils/DebugLogger';

export class CureEffect extends SpellEffectProcessor {
  private statusEffectSystem: StatusEffectSystem;

  constructor() {
    super();
    this.statusEffectSystem = StatusEffectSystem.getInstance();
  }

  processEffect(
    _caster: Character,
    spell: SpellData,
    effect: SpellEffectConfig,
    targets: EffectTarget[],
    _context: SpellCastingContext
  ): EffectResult {
    const config = effect as CureEffectConfig;
    const result: EffectResult = {
      success: true,
      targets: [],
      messages: []
    };

    for (const targetInfo of targets) {
      const target = targetInfo.entity;
      const targetName = this.getEntityName(target);

      if (!this.isCharacter(target)) {
        result.messages.push(`${spell.name} has no effect on ${targetName}!`);
        continue;
      }

      const statusesToCure = this.getStatusesToCure(config);
      let curedStatuses: CharacterStatus[] = [];

      for (const status of statusesToCure) {
        if (this.statusEffectSystem.hasStatus(target, status)) {
          const removed = this.statusEffectSystem.removeStatusEffect(target, status);
          if (removed) {
            curedStatuses.push(status);
          }
        }
      }

      if (curedStatuses.length > 0) {
        result.targets.push({
          target: targetInfo
        });

        if (curedStatuses.length === 1) {
          result.messages.push(`${targetName} is cured of ${this.getStatusName(curedStatuses[0])}!`);
        } else {
          const statusNames = curedStatuses.map(s => this.getStatusName(s)).join(', ');
          result.messages.push(`${targetName} is cured of ${statusNames}!`);
        }

        DebugLogger.info('CureEffect', `Cured ${targetName} of ${curedStatuses.length} status(es)`, {
          spell: spell.name,
          statuses: curedStatuses
        });
      } else {
        result.messages.push(`${targetName} has no ailments to cure!`);
      }
    }

    return result;
  }

  private getStatusesToCure(config: CureEffectConfig): CharacterStatus[] {
    if (config.cureAll) {
      const allStatuses = STATUS_CURE_GROUPS.all;
      return this.mapStatusTypes(allStatuses);
    }

    if (config.cureGroup) {
      const groupStatuses = STATUS_CURE_GROUPS[config.cureGroup];
      return this.mapStatusTypes(groupStatuses);
    }

    if (config.cureStatuses) {
      return this.mapStatusTypes(config.cureStatuses);
    }

    return [];
  }

  private mapStatusTypes(statusTypes: string[]): CharacterStatus[] {
    const mapping: Record<string, CharacterStatus> = {
      'sleep': 'Sleeping',
      'paralyzed': 'Paralyzed',
      'poisoned': 'Poisoned',
      'stoned': 'Stoned',
      'silenced': 'Silenced',
      'blinded': 'Blinded',
      'confused': 'Confused',
      'afraid': 'Afraid',
      'charmed': 'Charmed',
      'berserk': 'Berserk',
      'blessed': 'Blessed',
      'cursed': 'Cursed'
    };

    return statusTypes
      .map(st => mapping[st])
      .filter(st => st !== undefined) as CharacterStatus[];
  }

  private getStatusName(status: CharacterStatus): string {
    const statusNames: Record<CharacterStatus, string> = {
      'OK': 'OK',
      'Dead': 'death',
      'Ashed': 'ashes',
      'Lost': 'lost',
      'Paralyzed': 'paralysis',
      'Stoned': 'petrification',
      'Poisoned': 'poison',
      'Sleeping': 'sleep',
      'Silenced': 'silence',
      'Blinded': 'blindness',
      'Confused': 'confusion',
      'Afraid': 'fear',
      'Charmed': 'charm',
      'Berserk': 'berserk',
      'Blessed': 'blessing',
      'Cursed': 'curse'
    };

    return statusNames[status] || status.toLowerCase();
  }
}
