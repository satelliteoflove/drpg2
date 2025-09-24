import { Character } from '../entities/Character';
import { Monster } from '../types/GameTypes';
import { SpellData, SpellTargetType } from '../types/SpellTypes';
import { EntityUtils } from '../utils/EntityUtils';
import { KEY_BINDINGS } from '../config/KeyBindings';

export interface SpellTargetState {
  spell: SpellData | null;
  targetType: SpellTargetType | null;
  validTargets: (Character | Monster)[];
  selectedTargetIndex: number;
  isSelectingTarget: boolean;
  requiresTargetSelection: boolean;
}

export class SpellTargetSelector {
  private state: SpellTargetState;
  private onTargetSelected?: (targetIndex: number | null) => void;
  private onCancel?: () => void;

  constructor() {
    this.state = {
      spell: null,
      targetType: null,
      validTargets: [],
      selectedTargetIndex: 0,
      isSelectingTarget: false,
      requiresTargetSelection: false
    };
  }

  setupForSpell(
    spell: SpellData,
    enemies: Monster[],
    party: Character[],
    onTargetSelected: (targetIndex: number | null) => void,
    onCancel: () => void
  ): void {
    this.state.spell = spell;
    this.state.targetType = spell.targetType;
    this.onTargetSelected = onTargetSelected;
    this.onCancel = onCancel;

    switch (spell.targetType) {
      case 'enemy':
        this.state.validTargets = enemies.filter(m => m.hp > 0);
        this.state.requiresTargetSelection = true;
        break;
      case 'ally':
        this.state.validTargets = party.filter(c => !c.isDead);
        this.state.requiresTargetSelection = true;
        break;
      case 'self':
        const caster = party.find(c => !c.isDead);
        this.state.validTargets = caster ? [caster] : [];
        this.state.requiresTargetSelection = false;
        break;
      case 'allAllies':
        this.state.validTargets = party.filter(c => !c.isDead);
        this.state.requiresTargetSelection = false;
        break;
      case 'allEnemies':
        this.state.validTargets = enemies.filter(m => m.hp > 0);
        this.state.requiresTargetSelection = false;
        break;
      case 'group':
        this.state.validTargets = enemies.filter(m => m.hp > 0);
        this.state.requiresTargetSelection = true;
        break;
      case 'dead':
        this.state.validTargets = party.filter(c => c.isDead);
        this.state.requiresTargetSelection = true;
        break;
      default:
        this.state.validTargets = [];
        this.state.requiresTargetSelection = false;
    }

    this.state.selectedTargetIndex = 0;
    this.state.isSelectingTarget = this.state.requiresTargetSelection;

    if (!this.state.requiresTargetSelection) {
      onTargetSelected(null);
    }
  }

  handleInput(key: string): boolean {
    if (!this.state.isSelectingTarget) return false;

    if (key === 'escape') {
      this.cancel();
      return true;
    } else if (key === 'enter') {
      this.confirmTarget();
      return true;
    } else if (key === KEY_BINDINGS.movement.left || key === KEY_BINDINGS.movement.alternateLeft ||
               key === KEY_BINDINGS.menu.up || key === KEY_BINDINGS.menu.alternateUp) {
      this.selectPreviousTarget();
      return true;
    } else if (key === KEY_BINDINGS.movement.right || key === KEY_BINDINGS.movement.alternateRight ||
               key === KEY_BINDINGS.menu.down || key === KEY_BINDINGS.menu.alternateDown) {
      this.selectNextTarget();
      return true;
    } else if (key >= '1' && key <= '9') {
      const index = parseInt(key) - 1;
      if (index < this.state.validTargets.length) {
        this.state.selectedTargetIndex = index;
        this.confirmTarget();
      }
      return true;
    }

    return false;
  }

  private selectPreviousTarget(): void {
    if (this.state.selectedTargetIndex > 0) {
      this.state.selectedTargetIndex--;
    } else {
      this.state.selectedTargetIndex = this.state.validTargets.length - 1;
    }
  }

  private selectNextTarget(): void {
    if (this.state.selectedTargetIndex < this.state.validTargets.length - 1) {
      this.state.selectedTargetIndex++;
    } else {
      this.state.selectedTargetIndex = 0;
    }
  }

  private confirmTarget(): void {
    if (this.state.validTargets.length > 0) {
      this.onTargetSelected?.(this.state.selectedTargetIndex);
      this.reset();
    }
  }

  private cancel(): void {
    this.onCancel?.();
    this.reset();
  }

  private reset(): void {
    this.state.isSelectingTarget = false;
    this.state.spell = null;
    this.state.validTargets = [];
    this.state.selectedTargetIndex = 0;
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.state.isSelectingTarget || !this.state.spell) return;

    ctx.fillStyle = '#222';
    ctx.fillRect(x, y, 350, 80);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 350, 80);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    const targetTypeText = this.state.targetType === 'enemy' ? 'Select Enemy Target' :
                           this.state.targetType === 'ally' ? 'Select Ally Target' :
                           this.state.targetType === 'group' ? 'Select Enemy Group' :
                           this.state.targetType === 'dead' ? 'Select Dead Ally' : 'Select Target';

    ctx.fillText(targetTypeText, x + 10, y + 25);

    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText('← →: Navigate | Enter: Confirm | Escape: Cancel', x + 10, y + 50);

    if (this.state.validTargets.length > 0) {
      const target = this.state.validTargets[this.state.selectedTargetIndex];
      ctx.fillStyle = '#ffff00';
      ctx.font = '14px monospace';
      const targetName = EntityUtils.isCharacter(target) ?
        (target as Character).name :
        (target as Monster).name;
      ctx.fillText(`> ${targetName}`, x + 10, y + 70);
    }
  }

  getSelectedTargetIndex(): number {
    return this.state.selectedTargetIndex;
  }

  isActive(): boolean {
    return this.state.isSelectingTarget;
  }

  getState(): SpellTargetState {
    return this.state;
  }
}