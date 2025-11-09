import { GameState, CharacterClass } from '../../types/GameTypes';
import { Character } from '../../entities/Character';
import { StatusPanel } from '../../ui/StatusPanel';
import { TrainingGroundsStateContext } from '../../types/TrainingGroundsTypes';
import { TrainingGroundsStateManager } from './TrainingGroundsStateManager';
import { SpellRegistry } from '../magic/SpellRegistry';
import { SpellData, SpellId } from '../../types/SpellTypes';
import { UIRenderingUtils } from '../../utils/UIRenderingUtils';
import { UI_CONSTANTS } from '../../config/UIConstants';

export class TrainingGroundsUIRenderer {
  private gameState: GameState;
  private messageLog: any;
  private stateManager: TrainingGroundsStateManager;
  private statusPanel: StatusPanel | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private registry: SpellRegistry;

  constructor(gameState: GameState, messageLog: any, stateManager: TrainingGroundsStateManager) {
    this.gameState = gameState;
    this.messageLog = messageLog;
    this.stateManager = stateManager;
    this.registry = SpellRegistry.getInstance();
  }

  public render(ctx: CanvasRenderingContext2D, stateContext: TrainingGroundsStateContext): void {
    if (!this.canvas) {
      this.canvas = ctx.canvas;
      this.statusPanel = new StatusPanel(
        ctx.canvas,
        UI_CONSTANTS.LAYOUT.STATUS_PANEL_X,
        UI_CONSTANTS.LAYOUT.STATUS_PANEL_Y,
        UI_CONSTANTS.LAYOUT.STATUS_PANEL_WIDTH,
        UI_CONSTANTS.LAYOUT.STATUS_PANEL_HEIGHT
      );
    }

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderHeader(ctx);

    if (stateContext.currentState === 'createBonusPoints') {
      this.renderClassEligibilityPanel(ctx, stateContext);
    } else if (this.statusPanel) {
      this.statusPanel.render(this.gameState.party, ctx);
    }

    this.renderMainArea(ctx, stateContext);
    this.renderActionMenu(ctx, stateContext);

    if (this.messageLog) {
      this.messageLog.render(ctx);
    }
  }

  private renderHeader(ctx: CanvasRenderingContext2D): void {
    UIRenderingUtils.drawPanel(ctx, 10, 10, ctx.canvas.width - 20, 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TRAINING GROUNDS', ctx.canvas.width / 2, 45);

    ctx.fillStyle = '#4a4';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Roster: ${this.gameState.characterRoster.length} characters`, ctx.canvas.width - 30, 45);
  }

  private renderMainArea(ctx: CanvasRenderingContext2D, stateContext: TrainingGroundsStateContext): void {
    const mainX = 260;
    const mainY = 80;
    const mainWidth = 500;
    const mainHeight = 480;

    UIRenderingUtils.drawPanel(ctx, mainX, mainY, mainWidth, mainHeight);

    switch (stateContext.currentState) {
      case 'main':
        this.renderWelcomeScreen(ctx, mainX, mainY, mainWidth, mainHeight);
        break;
      case 'createName':
        this.renderNameEntry(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'createRace':
        this.renderRaceSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'createGender':
        this.renderGenderSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'createBonusPoints':
        this.renderBonusPointAllocation(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'createClass':
        this.renderClassSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'createAlignment':
        this.renderAlignmentSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'createConfirm':
        this.renderCreationConfirmation(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'inspectSelectCharacter':
        this.renderInspectCharacterSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'inspectMenu':
        this.renderInspectMenu(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'inspectView':
        this.renderInspectView(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'inspectDeleteConfirm':
        this.renderDeleteConfirmation(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'inspectClassChange':
        this.renderClassChangeInfo(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'inspectClassChangeSelect':
        this.renderClassChangeSelection(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'inspectClassChangeConfirm':
        this.renderClassChangeConfirmation(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'inspectRename':
        this.renderRenameInput(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
      case 'roster':
        this.renderRosterView(ctx, mainX, mainY, mainWidth, mainHeight, stateContext);
        break;
    }
  }

  private renderWelcomeScreen(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to the Training Grounds', x + width / 2, y + 60);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Create and manage your character roster', x + width / 2, y + 90);

    ctx.fillStyle = '#4a4';
    ctx.font = '16px monospace';
    ctx.fillText('Services Available:', x + width / 2, y + 140);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    const services = [
      'Create new characters with bonus point allocation',
      'View and inspect existing characters',
      'Change character classes (multi-classing)',
      'Delete or rename characters'
    ];

    services.forEach((service, index) => {
      ctx.fillText(`• ${service}`, x + width / 2, y + 175 + index * 25);
    });

    if (this.gameState.characterRoster.length > 0) {
      ctx.fillStyle = '#4a4';
      ctx.font = '14px monospace';
      ctx.fillText(`Current Roster: ${this.gameState.characterRoster.length} character(s)`, x + width / 2, y + 300);
    }
  }

  private renderNameEntry(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER CHARACTER NAME', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Choose a name for your new character', x + width / 2, y + 70);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    const displayName = stateContext.textInput || '_';
    ctx.fillText(displayName, x + width / 2, y + 150);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + width / 2 - 100, y + 135, 200, 30);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`${stateContext.textInput.length} / 16 characters`, x + width / 2, y + 190);
  }

  private renderRaceSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT RACE', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`For: ${stateContext.creationData.name}`, x + width / 2, y + 70);

    const races = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Hobbit', 'Faerie', 'Lizman', 'Dracon', 'Rawulf', 'Mook', 'Felpurr'];
    ctx.textAlign = 'left';
    let yPos = y + 110;

    races.forEach((race, index) => {
      const isSelected = index === stateContext.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 25);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(race, x + 60, yPos);

      yPos += 30;
    });
  }

  private renderGenderSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT GENDER', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`${stateContext.creationData.name} the ${stateContext.creationData.race}`, x + width / 2, y + 70);

    const genders = ['Male', 'Female'];
    ctx.textAlign = 'left';
    let yPos = y + 130;

    genders.forEach((gender, index) => {
      const isSelected = index === stateContext.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 150, yPos - 15, 200, 30);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.fillText(gender, x + 200, yPos);

      yPos += 50;
    });

    ctx.font = '12px monospace';
    ctx.fillStyle = '#fa0';
    ctx.textAlign = 'center';
    ctx.fillText('Note: Valkyrie class is female-only', x + width / 2, y + 250);
  }

  private renderBonusPointAllocation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ALLOCATE BONUS POINTS', x + width / 2, y + 40);

    const remaining = stateContext.creationData.bonusPoints - Object.values(stateContext.creationData.allocatedBonusPoints).reduce((sum, val) => sum + (val || 0), 0);

    ctx.font = '14px monospace';
    ctx.fillStyle = remaining > 0 ? '#fa0' : '#4a4';
    ctx.fillText(`Bonus Points Remaining: ${remaining}`, x + width / 2, y + 70);

    if (stateContext.creationData.startAtLevel4) {
      ctx.fillStyle = '#ffa500';
      ctx.fillText('★ Low roll - Character will start at Level 4! ★', x + width / 2, y + 95);
    }

    const stats = ['strength', 'intelligence', 'piety', 'vitality', 'agility', 'luck'];
    const statLabels = ['Strength', 'Intelligence', 'Piety', 'Vitality', 'Agility', 'Luck'];
    const currentStats = this.stateManager.getCurrentStats();
    const baseStats = stateContext.creationData.baseStats;

    ctx.textAlign = 'left';
    let yPos = y + 130;

    stats.forEach((stat, index) => {
      const isSelected = index === stateContext.selectedOption;
      const statKey = stat as keyof typeof baseStats;
      const baseValue = baseStats ? baseStats[statKey] : 0;
      const allocated = stateContext.creationData.allocatedBonusPoints[statKey] || 0;
      const currentValue = currentStats[statKey];

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 25);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(statLabels[index], x + 60, yPos);

      ctx.font = '14px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${baseValue}`, x + 220, yPos);

      if (allocated > 0) {
        ctx.fillStyle = '#4a4';
        ctx.fillText(`+${allocated}`, x + 260, yPos);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.fillText(`= ${currentValue}`, x + 320, yPos);

      yPos += 30;
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    yPos += 10;
    ctx.fillText('Use LEFT/RIGHT or -/+ to adjust', x + width / 2, yPos);

    yPos += 20;
    const eligibleCount = stateContext.eligibleClasses.length;
    ctx.fillStyle = eligibleCount > 0 ? '#4a4' : '#a44';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`Eligible Classes: ${eligibleCount}`, x + width / 2, yPos);
  }

  private renderClassSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CLASS', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Choose your character class', x + width / 2, y + 70);

    const eligibleClasses = stateContext.eligibleClasses;
    ctx.textAlign = 'left';
    let yPos = y + 110;

    eligibleClasses.forEach((charClass: CharacterClass, index: number) => {
      const isSelected = index === stateContext.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 25);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(charClass, x + 60, yPos);

      yPos += 30;
    });
  }

  private renderAlignmentSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT ALIGNMENT', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`${stateContext.creationData.name} the ${stateContext.creationData.class}`, x + width / 2, y + 70);

    const alignments = ['Good', 'Neutral', 'Evil'];
    ctx.textAlign = 'left';
    let yPos = y + 130;

    alignments.forEach((alignment, index) => {
      const isSelected = index === stateContext.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 150, yPos - 15, 200, 30);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
      ctx.fillText(alignment, x + 200, yPos);

      yPos += 50;
    });
  }

  private renderCreationConfirmation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONFIRM CHARACTER CREATION', x + width / 2, y + 40);

    const data = stateContext.creationData;
    const stats = this.stateManager.getCurrentStats();

    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffa500';
    ctx.fillText(data.name, x + width / 2, y + 90);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#fff';
    let yPos = y + 130;
    ctx.fillText(`Race: ${data.race}`, x + width / 2, yPos);
    yPos += 25;
    ctx.fillText(`Gender: ${data.gender}`, x + width / 2, yPos);
    yPos += 25;
    ctx.fillText(`Class: ${data.class}`, x + width / 2, yPos);
    yPos += 25;
    ctx.fillText(`Alignment: ${data.alignment}`, x + width / 2, yPos);
    yPos += 35;

    ctx.font = '12px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`ST: ${stats.strength}  IQ: ${stats.intelligence}  PI: ${stats.piety}`, x + width / 2, yPos);
    yPos += 18;
    ctx.fillText(`VT: ${stats.vitality}  AG: ${stats.agility}  LK: ${stats.luck}`, x + width / 2, yPos);
    yPos += 35;

    if (data.startAtLevel4) {
      ctx.fillStyle = '#ffa500';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('★ Will start at Level 4 ★', x + width / 2, yPos);
      yPos += 30;
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('Press Y to confirm, N to cancel', x + width / 2, yPos);
  }

  private renderInspectCharacterSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CHARACTER TO INSPECT', x + width / 2, y + 40);

    const characters = this.stateManager.getRosterCharacters();
    ctx.textAlign = 'left';
    let yPos = y + 90;

    characters.forEach((char: Character, index: number) => {
      const isSelected = index === stateContext.selectedOption;
      const isInParty = this.isCharacterInParty(char);

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 30);
      }

      if (isInParty) {
        ctx.fillStyle = isSelected ? '#ffa500' : '#4a4';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('★', x + 40, yPos);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(`${index + 1}. ${char.name}`, x + 60, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${char.race} ${char.class} Lv.${char.level}`, x + 250, yPos);

      yPos += 35;
    });
  }

  private renderInspectMenu(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    const character = this.stateManager.getRosterCharacters()[stateContext.selectedCharacterIndex];
    if (!character) return;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INSPECT CHARACTER', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffa500';
    ctx.fillText(character.name, x + width / 2, y + 70);

    ctx.fillStyle = '#aaa';
    ctx.fillText(`${character.race} ${character.class} Level ${character.level}`, x + width / 2, y + 95);

    const options = this.stateManager.getInspectMenuOptions();
    ctx.textAlign = 'left';
    let yPos = y + 140;

    options.forEach((option, index) => {
      const isSelected = index === stateContext.selectedOption;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 100, yPos - 15, 300, 30);
      }

      ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(option, x + 150, yPos);

      yPos += 40;
    });
  }

  private renderInspectView(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, stateContext: TrainingGroundsStateContext): void {
    const character = this.stateManager.getRosterCharacters()[stateContext.selectedCharacterIndex];
    if (!character) return;

    const panelHeight = height - 60;
    const contentY = y + 60;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHARACTER DETAILS', x + width / 2, y + 40);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, contentY, width, panelHeight);
    ctx.clip();

    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffa500';
    let yPos = contentY + 20 - stateContext.scrollOffset;
    const lineHeight = 18;
    const padding = 20;

    ctx.fillText(character.name, x + width / 2, yPos);
    yPos += lineHeight + 10;

    ctx.font = '14px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${character.race} ${character.class} - ${character.alignment}`, x + width / 2, yPos);
    yPos += lineHeight;
    ctx.fillText(`Level ${character.level} | Age ${character.age} | XP ${character.experience}`, x + width / 2, yPos);
    yPos += lineHeight + 15;

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText(`HP: ${character.hp}/${character.maxHp}  MP: ${character.mp}/${character.maxMp}  AC: ${character.ac}`, x + width / 2, yPos);
    yPos += lineHeight;
    ctx.fillText(`ST: ${character.stats.strength}  IQ: ${character.stats.intelligence}  PI: ${character.stats.piety}`, x + width / 2, yPos);
    yPos += 16;
    ctx.fillText(`VT: ${character.stats.vitality}  AG: ${character.stats.agility}  LK: ${character.stats.luck}`, x + width / 2, yPos);
    yPos += lineHeight + 15;

    ctx.fillStyle = '#88ff88';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Known Spells:', x + width / 2, yPos);
    yPos += lineHeight + 5;

    const knownSpells = character.getKnownSpells();
    const spellsByLevel = this.groupSpellsByLevel(knownSpells);

    if (spellsByLevel.size === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px monospace';
      ctx.fillText('No spells known', x + width / 2, yPos);
      yPos += lineHeight + 10;
    } else {
      const levels = Array.from(spellsByLevel.keys()).sort();
      ctx.textAlign = 'left';

      for (const level of levels) {
        const spells = spellsByLevel.get(level)!;

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`Level ${level}:`, x + padding + 10, yPos);
        yPos += lineHeight + 5;

        spells.forEach(spell => {
          ctx.fillStyle = '#fff';
          ctx.font = '13px monospace';
          ctx.fillText(`• ${spell.name} (${spell.mpCost} MP)`, x + padding + 20, yPos);
          yPos += lineHeight;

          ctx.fillStyle = '#aaa';
          ctx.font = '11px monospace';
          const effectDesc = this.getSpellEffectSummary(spell);
          ctx.fillText(`  ${effectDesc}`, x + padding + 25, yPos);
          yPos += lineHeight + 3;
        });

        yPos += 10;
      }
    }

    ctx.restore();

    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑/↓: Scroll | Press any key to return', x + width / 2, y + height - 10);
  }

  private groupSpellsByLevel(spellIds: string[]): Map<number, SpellData[]> {
    const grouped = new Map<number, SpellData[]>();

    for (const spellId of spellIds) {
      const spell = this.registry.getSpellById(spellId as SpellId);
      if (spell) {
        if (!grouped.has(spell.level)) {
          grouped.set(spell.level, []);
        }
        grouped.get(spell.level)!.push(spell);
      }
    }

    return grouped;
  }

  private getSpellEffectSummary(spell: SpellData): string {
    if (!spell.effects || spell.effects.length === 0) {
      return 'No effects';
    }

    const effect = spell.effects[0];
    const targetText = this.getTargetTypeText(spell.targetType);

    switch (effect.type) {
      case 'damage':
        const dmg = effect.baseDamage || effect.value || '?';
        return `${targetText}, Damage: ${dmg}`;
      case 'heal':
        const heal = effect.baseHealing || effect.value || '?';
        return `${targetText}, Heal: ${heal}`;
      case 'status':
        const status = effect.statusType || 'status effect';
        return `${targetText}, Inflict ${status}`;
      case 'buff':
        const buff = effect.buffType || 'buff';
        return `${targetText}, ${buff}`;
      case 'cure':
        return `${targetText}, Cure status`;
      default:
        return targetText;
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

  private renderDeleteConfirmation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    const character = this.stateManager.getRosterCharacters()[stateContext.selectedCharacterIndex];
    if (!character) return;

    ctx.fillStyle = '#a44';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DELETE CHARACTER?', x + width / 2, y + 80);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(character.name, x + width / 2, y + 130);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`${character.race} ${character.class} Level ${character.level}`, x + width / 2, y + 160);

    ctx.fillStyle = '#a44';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('This action cannot be undone!', x + width / 2, y + 220);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('Press Y to confirm, N to cancel', x + width / 2, y + 270);
  }

  private renderClassChangeInfo(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    const character = this.stateManager.getRosterCharacters()[stateContext.selectedCharacterIndex];
    if (!character) return;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHANGE CLASS', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffa500';
    ctx.fillText(`${character.name} - Current: ${character.class}`, x + width / 2, y + 75);

    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    let yPos = y + 120;
    ctx.fillText('Class change effects:', x + width / 2, yPos);
    yPos += 25;

    ctx.fillStyle = '#a44';
    ctx.fillText('• Level reset to 1', x + width / 2, yPos);
    yPos += 20;
    ctx.fillText('• Experience reset to 0', x + width / 2, yPos);
    yPos += 20;
    ctx.fillText('• Age increases by 1 year', x + width / 2, yPos);
    yPos += 20;
    ctx.fillText('• All equipment unequipped', x + width / 2, yPos);
    yPos += 30;

    ctx.fillStyle = '#4a4';
    ctx.fillText('✓ All stats retained', x + width / 2, yPos);
    yPos += 20;
    ctx.fillText('✓ HP value retained', x + width / 2, yPos);
    yPos += 20;
    ctx.fillText('✓ MP percentage retained', x + width / 2, yPos);
    yPos += 20;
    ctx.fillText('✓ All spells retained', x + width / 2, yPos);
    yPos += 40;

    ctx.fillStyle = '#aaa';
    ctx.fillText('Press ENTER to continue', x + width / 2, yPos);
  }

  private renderClassChangeSelection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    const character = this.stateManager.getRosterCharacters()[stateContext.selectedCharacterIndex];
    if (!character) return;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT NEW CLASS', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`For: ${character.name}`, x + width / 2, y + 70);

    const eligibleClasses = stateContext.eligibleClasses;
    ctx.textAlign = 'left';
    let yPos = y + 110;

    eligibleClasses.forEach((charClass: CharacterClass, index: number) => {
      const isSelected = index === stateContext.selectedOption;
      const isCurrent = charClass === character.class;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 40, yPos - 15, width - 80, 25);
      }

      ctx.fillStyle = isCurrent ? '#666' : isSelected ? '#ffa500' : '#fff';
      ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(charClass, x + 60, yPos);

      if (isCurrent) {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText('(Current)', x + 200, yPos);
      }

      yPos += 30;
    });
  }

  private renderClassChangeConfirmation(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    const character = this.stateManager.getRosterCharacters()[stateContext.selectedCharacterIndex];
    if (!character) return;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONFIRM CLASS CHANGE', x + width / 2, y + 60);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(character.name, x + width / 2, y + 110);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`${character.class} → ${stateContext.creationData.class}`, x + width / 2, y + 145);

    ctx.fillStyle = '#fa0';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('Level will reset to 1!', x + width / 2, y + 190);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('Press Y to confirm, N to cancel', x + width / 2, y + 240);
  }

  private renderRenameInput(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, stateContext: TrainingGroundsStateContext): void {
    const character = this.stateManager.getRosterCharacters()[stateContext.selectedCharacterIndex];
    if (!character) return;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RENAME CHARACTER', x + width / 2, y + 40);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Current name: ${character.name}`, x + width / 2, y + 75);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    const displayName = stateContext.textInput || '_';
    ctx.fillText(displayName, x + width / 2, y + 150);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + width / 2 - 100, y + 135, 200, 30);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`${stateContext.textInput.length} / 16 characters`, x + width / 2, y + 190);
  }

  private renderRosterView(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number, _stateContext: TrainingGroundsStateContext): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHARACTER ROSTER', x + width / 2, y + 40);

    const partyCount = this.gameState.party.characters.length;
    const totalCount = this.gameState.characterRoster.length;
    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Total: ${totalCount} (${partyCount} in active party)`, x + width / 2, y + 70);

    const characters = this.stateManager.getRosterCharacters();
    ctx.textAlign = 'left';
    let yPos = y + 110;

    characters.forEach((char: Character, index: number) => {
      const isInParty = this.isCharacterInParty(char);

      if (isInParty) {
        ctx.fillStyle = '#4a4';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('★', x + 40, yPos);
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`${index + 1}. ${char.name}`, x + 60, yPos);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${char.race} ${char.class} Lv.${char.level}`, x + 200, yPos);

      const statusColor = char.isDead ? '#a44' : '#4a4';
      ctx.fillStyle = statusColor;
      const statusText = char.statuses.length > 0 ? char.statuses[0].type : 'OK';
      ctx.fillText(statusText, x + 380, yPos);

      yPos += 30;
    });

    if (characters.length === 0) {
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No characters in roster', x + width / 2, y + 150);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press any key to return', x + width / 2, y + 420);
  }

  private renderActionMenu(ctx: CanvasRenderingContext2D, stateContext: TrainingGroundsStateContext): void {
    const menuX = 770;
    const menuY = 80;
    const menuWidth = 240;
    const menuHeight = 480;

    UIRenderingUtils.drawPanel(ctx, menuX, menuY, menuWidth, menuHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ACTIONS', menuX + menuWidth / 2, menuY + 25);

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    if (stateContext.currentState === 'main') {
      const options = this.stateManager.getMainMenuOptions();
      const startY = menuY + 60;

      options.forEach((option, index) => {
        const y = startY + index * 35;
        const isSelected = index === stateContext.selectedOption;

        if (isSelected) {
          ctx.fillStyle = '#333';
          ctx.fillRect(menuX + 10, y - 15, menuWidth - 20, 25);
        }

        ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
        ctx.font = isSelected ? 'bold 12px monospace' : '12px monospace';
        ctx.fillText(`${index + 1}. ${option}`, menuX + 20, y);
      });
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    const controlText = this.getControlText(stateContext.currentState);
    const lines = controlText.split('\n');
    let yPos = menuY + menuHeight - 15 - (lines.length - 1) * 15;

    lines.forEach(line => {
      ctx.fillText(line, menuX + menuWidth / 2, yPos);
      yPos += 15;
    });
  }

  private getControlText(state: string): string {
    switch (state) {
      case 'main':
        return 'UP/DOWN: Select\nENTER: Choose\nESC: Leave';
      case 'createName':
      case 'inspectRename':
        return 'Type to enter name\nENTER: Confirm\nBACKSPACE: Delete\nESC: Cancel';
      case 'createBonusPoints':
        return 'UP/DOWN: Select stat\nLEFT/RIGHT: Adjust\nENTER: Continue\nESC: Back';
      case 'createConfirm':
      case 'inspectDeleteConfirm':
      case 'inspectClassChangeConfirm':
        return 'Y: Confirm\nN: Cancel';
      default:
        return 'UP/DOWN: Select\nENTER: Confirm\nESC: Back';
    }
  }

  private renderClassEligibilityPanel(ctx: CanvasRenderingContext2D, stateContext: TrainingGroundsStateContext): void {
    const panelX = 10;
    const panelY = 80;
    const panelWidth = 240;
    const panelHeight = 480;

    UIRenderingUtils.drawPanel(ctx, panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AVAILABLE CLASSES', panelX + panelWidth / 2, panelY + 25);

    const allClasses: CharacterClass[] = [
      'Fighter', 'Mage', 'Priest', 'Thief', 'Alchemist',
      'Bishop', 'Bard', 'Ranger', 'Psionic',
      'Valkyrie', 'Samurai', 'Lord', 'Monk', 'Ninja'
    ];

    const eligibleClasses = stateContext.eligibleClasses;

    ctx.textAlign = 'left';
    ctx.font = '12px monospace';

    let yPos = panelY + 50;

    allClasses.forEach((className) => {
      const isEligible = eligibleClasses.includes(className);
      ctx.fillStyle = isEligible ? '#fff' : '#666';
      ctx.fillText(className, panelX + 15, yPos);
      yPos += 20;
    });
  }

  private isCharacterInParty(character: Character): boolean {
    return this.gameState.party.characters.some((c: Character) => c.id === character.id);
  }
}
