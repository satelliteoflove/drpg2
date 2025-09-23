import { Character } from '../entities/Character';
import { Monster } from '../types/GameTypes';

export type CombatEntity = Character | Monster;

export class EntityUtils {
  static isCharacter(entity: CombatEntity): entity is Character {
    return 'class' in entity && 'stats' in entity;
  }

  static isMonster(entity: CombatEntity): entity is Monster {
    return 'monsterType' in entity || (!this.isCharacter(entity) && 'hp' in entity);
  }

  static getName(entity: CombatEntity): string {
    return entity.name;
  }

  static getHP(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return entity.hp;
    } else {
      return entity.currentHp !== undefined ? entity.currentHp : entity.hp;
    }
  }

  static getMaxHP(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return entity.maxHp;
    } else {
      return entity.maxHp || entity.hp;
    }
  }

  static setHP(entity: CombatEntity, hp: number): void {
    const maxHP = this.getMaxHP(entity);
    const newHP = Math.max(0, Math.min(hp, maxHP));

    if (this.isCharacter(entity)) {
      entity.hp = newHP;
    } else {
      entity.hp = newHP;
      entity.currentHp = newHP;
      if (newHP === 0) {
        entity.isDead = true;
      }
    }
  }

  static applyDamage(entity: CombatEntity, damage: number): number {
    const currentHP = this.getHP(entity);
    const actualDamage = Math.min(damage, currentHP);
    this.setHP(entity, currentHP - actualDamage);
    return actualDamage;
  }

  static applyHealing(entity: CombatEntity, healing: number): number {
    const currentHP = this.getHP(entity);
    const maxHP = this.getMaxHP(entity);
    const actualHealing = Math.min(healing, maxHP - currentHP);
    this.setHP(entity, currentHP + actualHealing);
    return actualHealing;
  }

  static isDead(entity: CombatEntity): boolean {
    if (this.isCharacter(entity)) {
      return entity.isDead;
    } else {
      return entity.isDead === true || this.getHP(entity) <= 0;
    }
  }

  static getLevel(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return entity.level;
    } else {
      return entity.level || 1;
    }
  }

  static getAC(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return entity.ac;
    } else {
      return entity.ac || 10;
    }
  }

  static getResistance(entity: CombatEntity, element: string): number {
    if (this.isCharacter(entity)) {
      const resistances = (entity as any).resistances || {};
      return resistances[element] || 0;
    } else {
      if (entity.resistances && entity.resistances.includes(element)) {
        return 50;
      }
      if (entity.weaknesses && entity.weaknesses.includes(element)) {
        return -50;
      }
      return entity.resistance || 0;
    }
  }

  static getMagicResistance(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return (entity as any).magicResistance || 0;
    } else {
      return entity.magicResistance || 0;
    }
  }

  static getAgility(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return entity.stats.agility;
    } else {
      return 10;
    }
  }

  static getIntelligence(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return entity.stats.intelligence;
    } else {
      return 10;
    }
  }

  static getVitality(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return entity.stats.vitality;
    } else {
      return 10;
    }
  }

  static getLuck(entity: CombatEntity): number {
    if (this.isCharacter(entity)) {
      return entity.stats.luck;
    } else {
      return 10;
    }
  }

  static checkDeath(entity: CombatEntity): boolean {
    const isDead = this.getHP(entity) <= 0;

    if (isDead) {
      if (this.isCharacter(entity)) {
        entity.isDead = true;
        if (Array.isArray(entity.status) && !entity.status.includes('dead')) {
          entity.status.push('dead');
        }
      } else {
        entity.isDead = true;
      }
    }

    return isDead;
  }
}