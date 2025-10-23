import { Character } from '../entities/Character';
import { SpellRegistry } from '../systems/magic/SpellRegistry';
import { SpellData, SpellId } from '../types/SpellTypes';
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
      const spell = this.registry.getSpellById(spellId as SpellId);
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
        this.state.menuState.selectedIndex = newIndex;
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

    const listWidth = width * 0.55;
    const detailsX = x + listWidth + 10;
    const detailsWidth = width - listWidth - 20;

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
      ctx.fillText('← →: Change Level', x + listWidth - 150, y + 25);
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
        ctx.fillRect(x + 5, listY - 15, listWidth - 10, 22);
      }

      ctx.fillStyle = index === this.state.selectedSpellIndex ? '#ffff00' : canCast ? '#fff' : '#666';
      ctx.font = '14px monospace';
      ctx.fillText(`${index + 1}. ${spell.name}`, x + 20, listY);

      ctx.fillStyle = canCast ? '#aaa' : '#666';
      ctx.fillText(`${spell.mpCost} MP`, x + listWidth - 80, listY);

      listY += 25;
    });

    if (spellsAtLevel.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px monospace';
      ctx.fillText('No spells known at this level', x + 20, listY);
    }

    const selectedSpell = spellsAtLevel[this.state.selectedSpellIndex];
    if (selectedSpell) {
      this.renderSpellDetails(ctx, detailsX, y + 70, detailsWidth, height - 90, selectedSpell);
    }

    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText('Enter: Cast | Escape: Cancel', x + 10, y + height - 10);
  }

  private renderSpellDetails(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    spell: SpellData
  ): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    let detailY = y + 20;
    const lineHeight = 16;
    const padding = 10;

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(spell.name, x + padding, detailY);
    detailY += lineHeight;

    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText(`[${spell.school.toUpperCase()}]`, x + padding, detailY);
    detailY += lineHeight + 5;

    ctx.fillStyle = '#aaa';
    ctx.font = '11px monospace';

    const targetText = this.getTargetTypeText(spell.targetType);
    ctx.fillText(`Target: ${targetText}`, x + padding, detailY);
    detailY += lineHeight;

    ctx.fillText(`MP Cost: ${spell.mpCost}`, x + padding, detailY);
    detailY += lineHeight + 5;

    ctx.fillStyle = '#ccc';
    ctx.font = '10px monospace';
    const descLines = this.wrapText(ctx, spell.description, width - padding * 2);
    descLines.forEach(line => {
      ctx.fillText(line, x + padding, detailY);
      detailY += lineHeight - 2;
    });
    detailY += 5;

    if (spell.effects && spell.effects.length > 0) {
      ctx.fillStyle = '#88ff88';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Effects:', x + padding, detailY);
      detailY += lineHeight;

      ctx.fillStyle = '#aaa';
      ctx.font = '10px monospace';
      spell.effects.forEach(effect => {
        const effectDesc = this.formatEffectDescription(effect);
        const effectLines = this.wrapText(ctx, effectDesc, width - padding * 2 - 10);
        effectLines.forEach(line => {
          if (detailY < y + height - 10) {
            ctx.fillText(`• ${line}`, x + padding + 5, detailY);
            detailY += lineHeight - 2;
          }
        });
      });
    }
  }

  private formatEffectDescription(effect: any): string {
    switch (effect.type) {
      case 'damage':
        const dmgRange = effect.baseDamage || effect.value || effect.power || '?';
        return `Damage: ${dmgRange}${effect.element ? ` (${effect.element})` : ''}`;

      case 'heal':
        const healRange = effect.baseHealing || effect.value || effect.power || '?';
        return `Heal: ${healRange}`;

      case 'status':
        const status = effect.statusType || effect.statusEffect || 'Unknown';
        const duration = effect.duration ? ` (${effect.duration}t)` : '';
        return `Inflict ${status}${duration}`;

      case 'buff':
        const buff = effect.buffType || 'stat boost';
        const buffDur = effect.duration ? ` (${effect.duration}t)` : '';
        return `${buff}${buffDur}`;

      case 'cure':
        const cured = effect.cureStatuses?.join(', ') || 'status effects';
        return `Cure ${cured}`;

      case 'modifier':
        const stat = effect.stat || 'stats';
        const modValue = effect.value || effect.power || '?';
        return `Modify ${stat}: ${modValue}`;

      case 'instantDeath':
        return 'Instant death (save negates)';

      case 'resurrection':
        return 'Resurrect the dead';

      case 'dispel':
        return 'Remove magical effects';

      case 'teleport':
        return 'Teleport party';

      default:
        return effect.special || effect.subtype || `${effect.type}`;
    }
  }

  private getTargetTypeText(targetType: string): string {
    const map: Record<string, string> = {
      'group': 'Enemy Group',
      'allAllies': 'All Allies',
      'allEnemies': 'All Enemies',
      'enemy': 'Single Enemy',
      'ally': 'Single Ally',
      'self': 'Self',
      'row': 'Enemy Row',
      'dead': 'Dead Ally'
    };
    return map[targetType] || targetType;
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  getState(): SpellMenuState {
    return this.state;
  }
}