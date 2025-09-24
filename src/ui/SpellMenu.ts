import { Character } from '../entities/Character';
import { SpellRegistry } from '../systems/magic/SpellRegistry';
import { SpellData } from '../types/SpellTypes';
import { MenuInputHandler, MenuState } from './components/MenuInputHandler';
import { KEY_BINDINGS } from '../config/KeyBindings';

export interface SpellMenuState {
  isOpen: boolean;
  selectedSpellIndex: number;
  selectedLevel: number;
  spellsByLevel: Map<number, SpellData[]>;
  caster: Character | null;
  menuState: MenuState;
}

export class SpellMenu {
  private state: SpellMenuState;
  private registry: SpellRegistry;
  private onSpellSelected?: (spellId: string) => void;
  private onCancel?: () => void;

  constructor() {
    this.registry = SpellRegistry.getInstance();
    this.state = {
      isOpen: false,
      selectedSpellIndex: 0,
      selectedLevel: 1,
      spellsByLevel: new Map(),
      caster: null,
      menuState: MenuInputHandler.createMenuState(0)
    };
  }

  open(caster: Character, onSpellSelected: (spellId: string) => void, onCancel: () => void): void {
    this.state.isOpen = true;
    this.state.caster = caster;
    this.state.selectedSpellIndex = 0;
    this.state.selectedLevel = 1;
    this.onSpellSelected = onSpellSelected;
    this.onCancel = onCancel;

    this.buildSpellList(caster);
    this.updateMenuState();
  }

  close(): void {
    this.state.isOpen = false;
    this.state.caster = null;
    this.state.spellsByLevel.clear();
  }

  private buildSpellList(caster: Character): void {
    this.state.spellsByLevel.clear();

    const knownSpells = caster.getKnownSpells();
    for (const spellId of knownSpells) {
      const spell = this.registry.getSpellById(spellId);
      if (spell) {
        if (!this.state.spellsByLevel.has(spell.level)) {
          this.state.spellsByLevel.set(spell.level, []);
        }
        this.state.spellsByLevel.get(spell.level)!.push(spell);
      }
    }

    const levels = Array.from(this.state.spellsByLevel.keys()).sort();
    if (levels.length > 0) {
      this.state.selectedLevel = levels[0];
    }
  }

  private updateMenuState(): void {
    const spellsAtLevel = this.state.spellsByLevel.get(this.state.selectedLevel) || [];
    this.state.menuState = MenuInputHandler.createMenuState(
      spellsAtLevel.length,
      this.state.selectedSpellIndex,
      false
    );
  }

  handleInput(key: string): boolean {
    if (!this.state.isOpen || !this.state.caster) return false;

    const spellsAtLevel = this.state.spellsByLevel.get(this.state.selectedLevel) || [];
    const levels = Array.from(this.state.spellsByLevel.keys()).sort();

    const action = MenuInputHandler.handleMenuInput(key, this.state.menuState, {
      allowHorizontal: true,
      onConfirm: () => {
        const spell = spellsAtLevel[this.state.selectedSpellIndex];
        if (spell && this.state.caster!.mp >= spell.mpCost) {
          this.onSpellSelected?.(spell.id);
          this.close();
        }
      },
      onCancel: () => {
        this.onCancel?.();
        this.close();
      },
      onNavigate: (newIndex) => {
        this.state.selectedSpellIndex = newIndex;
      }
    });

    if ((key === KEY_BINDINGS.movement.left || key === KEY_BINDINGS.movement.alternateLeft) && levels.length > 1) {
      const currentLevelIndex = levels.indexOf(this.state.selectedLevel);
      if (currentLevelIndex > 0) {
        this.state.selectedLevel = levels[currentLevelIndex - 1];
        this.state.selectedSpellIndex = 0;
        this.updateMenuState();
        return true;
      }
    } else if ((key === KEY_BINDINGS.movement.right || key === KEY_BINDINGS.movement.alternateRight) && levels.length > 1) {
      const currentLevelIndex = levels.indexOf(this.state.selectedLevel);
      if (currentLevelIndex < levels.length - 1) {
        this.state.selectedLevel = levels[currentLevelIndex + 1];
        this.state.selectedSpellIndex = 0;
        this.updateMenuState();
        return true;
      }
    } else if (key >= '1' && key <= '9') {
      const index = parseInt(key) - 1;
      if (index < spellsAtLevel.length) {
        this.state.selectedSpellIndex = index;
        const spell = spellsAtLevel[index];
        if (spell && this.state.caster!.mp >= spell.mpCost) {
          this.onSpellSelected?.(spell.id);
          this.close();
        }
        return true;
      }
    }

    return action.type !== 'none';
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    if (!this.state.isOpen || !this.state.caster) return;

    ctx.fillStyle = '#222';
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    const levels = Array.from(this.state.spellsByLevel.keys()).sort();
    const spellsAtLevel = this.state.spellsByLevel.get(this.state.selectedLevel) || [];

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Select Spell:', x + 10, y + 25);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText(`MP: ${this.state.caster.mp}/${this.state.caster.maxMp}`, x + 150, y + 25);

    if (levels.length > 1) {
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.fillText('← →: Change Level', x + width - 150, y + 25);
    }

    const levelTabs = levels.map(level => `L${level}`).join(' | ');
    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText(levelTabs, x + 10, y + 50);

    const levelIndicatorX = x + 10 + (levels.indexOf(this.state.selectedLevel) * 45);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(levelIndicatorX, y + 52, 30, 2);

    let listY = y + 80;
    spellsAtLevel.forEach((spell, index) => {
      const canCast = this.state.caster!.mp >= spell.mpCost;

      if (index === this.state.selectedSpellIndex) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 5, listY - 15, width - 10, 22);
      }

      ctx.fillStyle = index === this.state.selectedSpellIndex ? '#ffff00' : canCast ? '#fff' : '#666';
      ctx.font = '14px monospace';
      ctx.fillText(`${index + 1}. ${spell.name}`, x + 20, listY);

      ctx.fillStyle = canCast ? '#aaa' : '#666';
      ctx.fillText(`${spell.mpCost} MP`, x + 250, listY);

      if (spell.targetType) {
        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        const targetText = spell.targetType === 'group' ? 'Group' :
                          spell.targetType === 'allAllies' ? 'All Allies' :
                          spell.targetType === 'allEnemies' ? 'All Enemies' :
                          spell.targetType === 'enemy' ? 'Enemy' :
                          spell.targetType === 'ally' ? 'Ally' :
                          spell.targetType === 'self' ? 'Self' :
                          spell.targetType === 'row' ? 'Row' :
                          spell.targetType === 'dead' ? 'Dead' : '';
        ctx.fillText(targetText, x + 320, listY);
      }

      listY += 25;
    });

    if (spellsAtLevel.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px monospace';
      ctx.fillText('No spells known at this level', x + 20, listY);
    }

    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText('Enter: Cast | Escape: Cancel', x + 10, y + height - 10);
  }

  getState(): SpellMenuState {
    return this.state;
  }
}