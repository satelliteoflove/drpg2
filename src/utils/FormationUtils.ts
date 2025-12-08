import { Character } from '../entities/Character';
import { Monster, WeaponRange } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConstants';

export class FormationUtils {
  static isCharacterInFrontRow(character: Character, party: Character[]): boolean {
    const index = party.findIndex(c => c.id === character.id);
    return index !== -1 && GAME_CONFIG.PARTY.FRONT_ROW_INDICES.includes(index);
  }

  static isCharacterInBackRow(character: Character, party: Character[]): boolean {
    const index = party.findIndex(c => c.id === character.id);
    return index !== -1 && GAME_CONFIG.PARTY.BACK_ROW_INDICES.includes(index);
  }

  static isMonsterInFrontRow(monster: Monster, monsters: Monster[]): boolean {
    const index = monsters.findIndex(m => m.id === monster.id);
    return index !== -1 && GAME_CONFIG.MONSTER_FORMATION.FRONT_ROW_INDICES.includes(index);
  }

  static isMonsterInBackRow(monster: Monster, monsters: Monster[]): boolean {
    const index = monsters.findIndex(m => m.id === monster.id);
    return index !== -1 && GAME_CONFIG.MONSTER_FORMATION.BACK_ROW_INDICES.includes(index);
  }

  static getFrontRowCharacters(party: Character[]): Character[] {
    return GAME_CONFIG.PARTY.FRONT_ROW_INDICES
      .map(i => party[i])
      .filter((c): c is Character => c !== undefined && !c.isDead);
  }

  static getBackRowCharacters(party: Character[]): Character[] {
    return GAME_CONFIG.PARTY.BACK_ROW_INDICES
      .map(i => party[i])
      .filter((c): c is Character => c !== undefined && !c.isDead);
  }

  static getFrontRowMonsters(monsters: Monster[]): Monster[] {
    return GAME_CONFIG.MONSTER_FORMATION.FRONT_ROW_INDICES
      .map(i => monsters[i])
      .filter((m): m is Monster => m !== undefined && m.hp > 0 && !m.isDead);
  }

  static getBackRowMonsters(monsters: Monster[]): Monster[] {
    return GAME_CONFIG.MONSTER_FORMATION.BACK_ROW_INDICES
      .map(i => monsters[i])
      .filter((m): m is Monster => m !== undefined && m.hp > 0 && !m.isDead);
  }

  static getCharacterWeaponRange(character: Character): WeaponRange {
    return character.equipment.weapon?.range || 'melee';
  }

  static canMeleeAttackFromPosition(character: Character, party: Character[]): boolean {
    const range = this.getCharacterWeaponRange(character);
    if (range === 'ranged' || range === 'reach') {
      return true;
    }
    return this.isCharacterInFrontRow(character, party);
  }

  static getValidMeleeTargets(monsters: Monster[]): Monster[] {
    const frontRow = this.getFrontRowMonsters(monsters);
    if (frontRow.length > 0) {
      return frontRow;
    }
    return this.getBackRowMonsters(monsters);
  }

  static getValidTargetsForAttacker(
    attacker: Character,
    monsters: Monster[]
  ): Monster[] {
    const range = this.getCharacterWeaponRange(attacker);
    const aliveMonsters = monsters.filter(m => m.hp > 0 && !m.isDead);

    if (range === 'ranged' || range === 'reach') {
      return aliveMonsters;
    }

    return this.getValidMeleeTargets(monsters);
  }

  static getMonsterMeleeTargets(party: Character[]): Character[] {
    const frontRow = this.getFrontRowCharacters(party);
    if (frontRow.length > 0) {
      return frontRow;
    }
    return this.getBackRowCharacters(party);
  }

  static getCharacterRowIndex(character: Character, party: Character[]): number {
    return party.findIndex(c => c.id === character.id);
  }

  static getMonsterRowIndex(monster: Monster, monsters: Monster[]): number {
    return monsters.findIndex(m => m.id === monster.id);
  }

  static isCharacterRow(index: number): 'front' | 'back' {
    return GAME_CONFIG.PARTY.FRONT_ROW_INDICES.includes(index) ? 'front' : 'back';
  }

  static isMonsterRow(index: number): 'front' | 'back' {
    return GAME_CONFIG.MONSTER_FORMATION.FRONT_ROW_INDICES.includes(index) ? 'front' : 'back';
  }

  static promoteBackRowIfNeeded(party: Character[]): boolean {
    const frontRowAlive = GAME_CONFIG.PARTY.FRONT_ROW_INDICES
      .map(i => party[i])
      .filter((c): c is Character => c !== undefined && !c.isDead);

    if (frontRowAlive.length > 0) {
      return false;
    }

    const backRowAlive = GAME_CONFIG.PARTY.BACK_ROW_INDICES
      .map(i => party[i])
      .filter((c): c is Character => c !== undefined && !c.isDead);

    if (backRowAlive.length === 0) {
      return false;
    }

    const aliveChars = party.filter(c => c && !c.isDead);
    const deadChars = party.filter(c => c && c.isDead);
    const originalLength = party.length;

    const newOrder = [...aliveChars, ...deadChars];
    while (newOrder.length < originalLength) {
      newOrder.push(undefined as unknown as Character);
    }

    party.length = 0;
    for (let i = 0; i < originalLength; i++) {
      party.push(newOrder[i]);
    }

    return true;
  }
}
