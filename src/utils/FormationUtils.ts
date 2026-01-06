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

  static isMonsterInFrontColumn(monster: Monster, monsters: Monster[]): boolean {
    const index = monsters.findIndex(m => m.id === monster.id);
    return index !== -1 && GAME_CONFIG.MONSTER_FORMATION.FRONT_COLUMN_INDICES.includes(index);
  }

  static isMonsterInBackColumn(monster: Monster, monsters: Monster[]): boolean {
    const index = monsters.findIndex(m => m.id === monster.id);
    const backIndices = [
      ...GAME_CONFIG.MONSTER_FORMATION.BACK_COLUMN_INDICES,
      ...GAME_CONFIG.MONSTER_FORMATION.OVERFLOW_COLUMN_INDICES
    ];
    return index !== -1 && backIndices.includes(index);
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

  static getFrontColumnMonsters(monsters: Monster[]): Monster[] {
    return GAME_CONFIG.MONSTER_FORMATION.FRONT_COLUMN_INDICES
      .map(i => monsters[i])
      .filter((m): m is Monster => m !== undefined && m.hp > 0 && !m.isDead);
  }

  static getBackColumnMonsters(monsters: Monster[]): Monster[] {
    const backIndices = [
      ...GAME_CONFIG.MONSTER_FORMATION.BACK_COLUMN_INDICES,
      ...GAME_CONFIG.MONSTER_FORMATION.OVERFLOW_COLUMN_INDICES
    ];
    return backIndices
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
    const frontColumn = this.getFrontColumnMonsters(monsters);
    if (frontColumn.length > 0) {
      return frontColumn;
    }
    return this.getBackColumnMonsters(monsters);
  }

  static getValidTargetsForAttacker(
    attacker: Character,
    monsters: Monster[]
  ): Monster[] {
    const range = this.getCharacterWeaponRange(attacker);
    const aliveMonsters = monsters.filter(m => m.hp > 0 && !m.isDead);

    if (range === 'ranged') {
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

  static getMonsterColumnIndex(monster: Monster, monsters: Monster[]): number {
    return monsters.findIndex(m => m.id === monster.id);
  }

  static isCharacterRow(index: number): 'front' | 'back' {
    return GAME_CONFIG.PARTY.FRONT_ROW_INDICES.includes(index) ? 'front' : 'back';
  }

  static getMonsterColumn(index: number): 'front' | 'back' | 'overflow' {
    if (GAME_CONFIG.MONSTER_FORMATION.FRONT_COLUMN_INDICES.includes(index)) {
      return 'front';
    }
    if (GAME_CONFIG.MONSTER_FORMATION.BACK_COLUMN_INDICES.includes(index)) {
      return 'back';
    }
    return 'overflow';
  }

  static navigateTargetGrid(
    currentIndex: number,
    direction: 'up' | 'down' | 'left' | 'right',
    validTargets: Monster[],
    allMonsters: Monster[]
  ): number {
    if (validTargets.length === 0) return currentIndex;

    const currentMonster = allMonsters[currentIndex];
    const currentValidIdx = validTargets.findIndex(m => m === currentMonster);
    if (currentValidIdx === -1) return currentIndex;

    const currentCol = Math.floor(currentIndex / 3);
    const currentRow = currentIndex % 3;

    const getValidInColumn = (col: number): Monster[] => {
      return validTargets.filter(m => {
        const idx = allMonsters.findIndex(mon => mon === m);
        return Math.floor(idx / 3) === col;
      });
    };

    const getMonsterIndex = (monster: Monster): number => {
      return allMonsters.findIndex(m => m === monster);
    };

    if (direction === 'up' || direction === 'down') {
      const colMonsters = getValidInColumn(currentCol);
      if (colMonsters.length <= 1) {
        const newValidIdx = direction === 'up'
          ? (currentValidIdx > 0 ? currentValidIdx - 1 : validTargets.length - 1)
          : (currentValidIdx < validTargets.length - 1 ? currentValidIdx + 1 : 0);
        return getMonsterIndex(validTargets[newValidIdx]);
      }

      const currentPosInCol = colMonsters.findIndex(m => m === currentMonster);
      const newPosInCol = direction === 'up'
        ? (currentPosInCol > 0 ? currentPosInCol - 1 : colMonsters.length - 1)
        : (currentPosInCol < colMonsters.length - 1 ? currentPosInCol + 1 : 0);
      return getMonsterIndex(colMonsters[newPosInCol]);
    }

    if (direction === 'left' || direction === 'right') {
      const maxCol = Math.max(...validTargets.map(m => Math.floor(getMonsterIndex(m) / 3)));
      const minCol = Math.min(...validTargets.map(m => Math.floor(getMonsterIndex(m) / 3)));

      let targetCol = direction === 'left' ? currentCol - 1 : currentCol + 1;

      if (targetCol < minCol) targetCol = maxCol;
      if (targetCol > maxCol) targetCol = minCol;

      const targetColMonsters = getValidInColumn(targetCol);
      if (targetColMonsters.length === 0) {
        const newValidIdx = direction === 'left'
          ? (currentValidIdx > 0 ? currentValidIdx - 1 : validTargets.length - 1)
          : (currentValidIdx < validTargets.length - 1 ? currentValidIdx + 1 : 0);
        return getMonsterIndex(validTargets[newValidIdx]);
      }

      let bestMatch = targetColMonsters[0];
      let bestDiff = Infinity;
      for (const m of targetColMonsters) {
        const mRow = getMonsterIndex(m) % 3;
        const diff = Math.abs(mRow - currentRow);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestMatch = m;
        }
      }
      return getMonsterIndex(bestMatch);
    }

    return currentIndex;
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
