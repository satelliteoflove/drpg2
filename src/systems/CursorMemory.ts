import { CursorMemoryEntry } from '../types/InitiativeTypes';
import { DebugLogger } from '../utils/DebugLogger';

export class CursorMemory {
  private memory: Map<string, CursorMemoryEntry> = new Map();

  public save(characterId: string, entry: CursorMemoryEntry): void {
    this.memory.set(characterId, { ...entry });

    DebugLogger.debug('CursorMemory', 'Cursor position saved', {
      characterId,
      actionIndex: entry.actionIndex,
      targetId: entry.targetId,
      spellId: entry.spellId,
      itemId: entry.itemId
    });
  }

  public get(characterId: string): CursorMemoryEntry | null {
    const entry = this.memory.get(characterId);
    return entry ? { ...entry } : null;
  }

  public getActionIndex(characterId: string): number {
    const entry = this.memory.get(characterId);
    return entry?.actionIndex ?? 0;
  }

  public getTargetId(characterId: string): string | undefined {
    const entry = this.memory.get(characterId);
    return entry?.targetId;
  }

  public getSpellId(characterId: string): string | undefined {
    const entry = this.memory.get(characterId);
    return entry?.spellId;
  }

  public getItemId(characterId: string): string | undefined {
    const entry = this.memory.get(characterId);
    return entry?.itemId;
  }

  public updateActionIndex(characterId: string, actionIndex: number): void {
    const existing = this.memory.get(characterId);
    if (existing) {
      existing.actionIndex = actionIndex;
    } else {
      this.memory.set(characterId, { actionIndex });
    }
  }

  public updateTarget(characterId: string, targetId: string): void {
    const existing = this.memory.get(characterId);
    if (existing) {
      existing.targetId = targetId;
    } else {
      this.memory.set(characterId, { actionIndex: 0, targetId });
    }
  }

  public updateSpell(characterId: string, spellId: string): void {
    const existing = this.memory.get(characterId);
    if (existing) {
      existing.spellId = spellId;
    } else {
      this.memory.set(characterId, { actionIndex: 0, spellId });
    }
  }

  public updateItem(characterId: string, itemId: string): void {
    const existing = this.memory.get(characterId);
    if (existing) {
      existing.itemId = itemId;
    } else {
      this.memory.set(characterId, { actionIndex: 0, itemId });
    }
  }

  public clear(characterId: string): void {
    this.memory.delete(characterId);
    DebugLogger.debug('CursorMemory', 'Cursor memory cleared', { characterId });
  }

  public clearAll(): void {
    this.memory.clear();
    DebugLogger.debug('CursorMemory', 'All cursor memory cleared');
  }

  public has(characterId: string): boolean {
    return this.memory.has(characterId);
  }
}
