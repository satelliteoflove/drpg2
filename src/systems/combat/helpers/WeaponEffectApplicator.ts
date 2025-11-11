import { Character } from '../../../entities/Character';
import { Monster, Item, CharacterStatus } from '../../../types/GameTypes';
import { StatusEffectSystem } from '../../StatusEffectSystem';
import { DebugLogger } from '../../../utils/DebugLogger';

export class WeaponEffectApplicator {
  constructor(private statusEffectSystem: StatusEffectSystem) {}

  applyWeaponEffect(attacker: Character, target: Monster, weapon: Item): string | null {
    if (!weapon.onHitEffect) return null;

    const statusType = weapon.onHitEffect.statusType;
    const duration = weapon.onHitEffect.duration;

    DebugLogger.info('WeaponEffectApplicator', `${weapon.name} triggers on-hit effect`, {
      attacker: attacker.name,
      target: target.name,
      effect: statusType,
      duration
    });

    const applied = this.statusEffectSystem.applyStatusEffect(target, statusType, {
      duration,
      source: weapon.name,
      ignoreResistance: false
    });

    if (applied) {
      return `${target.name} is afflicted by ${this.getStatusEffectName(statusType)}!`;
    } else {
      return `${target.name} resisted ${this.getStatusEffectName(statusType)}!`;
    }
  }

  private getStatusEffectName(status: CharacterStatus): string {
    const names: Record<CharacterStatus, string> = {
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
    return names[status] || status.toLowerCase();
  }
}
