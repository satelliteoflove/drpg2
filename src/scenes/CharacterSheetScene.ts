import { Scene, SceneManager, SceneRenderContext } from '../core/Scene';
import { GameState, Equipment, Item } from '../types/GameTypes';
import { Character } from '../entities/Character';
import { InventorySystem } from '../systems/InventorySystem';
import { MenuInputHandler } from '../ui/components/MenuInputHandler';

type CharacterSheetMode = 'view' | 'items' | 'itemDetail' | 'spells' | 'spellDetail';
type CombinedItem = { item: Item; equipSlot?: keyof Equipment; isEquipped: boolean; originalIndex: number };

export class CharacterSheetScene extends Scene {
  private gameState: GameState;
  private sceneManager: SceneManager;
  private messageLog: any;

  private characterIndex: number = 0;
  private mode: CharacterSheetMode = 'view';
  private selectedItemIndex: number = 0;
  private selectedSpellIndex: number = 0;
  private itemsPage: number = 0;
  private spellsPage: number = 0;
  private itemsPerPage: number = 12;
  private spellsPerPage: number = 12;
  private returnToScene: string = 'town';

  constructor(gameState: GameState, sceneManager: SceneManager) {
    super('CharacterSheet');
    this.gameState = gameState;
    this.sceneManager = sceneManager;
    this.messageLog = this.gameState.messageLog;
  }

  public enter(): void {
    this.mode = 'view';
    this.selectedItemIndex = 0;
    this.selectedSpellIndex = 0;
    this.itemsPage = 0;
    this.spellsPage = 0;
  }

  public exit(): void {
  }

  public update(_deltaTime: number): void {
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const character = this.getCurrentCharacter();
    if (!character) {
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText('No character selected', 50, 50);
      return;
    }

    this.renderHeader(ctx, character);
    this.renderStatsPanel(ctx, character);
    this.renderItemsPanel(ctx, character);
    this.renderSpellsPanel(ctx, character);
    this.renderControls(ctx);

    if (this.mode === 'itemDetail') {
      this.renderItemDetailModal(ctx, character);
    }

    if (this.mode === 'spellDetail') {
      this.renderSpellDetailModal(ctx, character);
    }
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    const { renderManager } = renderContext;

    renderManager.renderBackground((ctx) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    renderManager.renderUI((ctx) => {
      const character = this.getCurrentCharacter();
      if (!character) {
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText('No character selected', 50, 50);
        return;
      }

      this.renderHeader(ctx, character);
      this.renderStatsPanel(ctx, character);
      this.renderItemsPanel(ctx, character);
      this.renderSpellsPanel(ctx, character);
      this.renderControls(ctx);

      if (this.mode === 'itemDetail') {
        this.renderItemDetailModal(ctx, character);
      }

      if (this.mode === 'spellDetail') {
        this.renderSpellDetailModal(ctx, character);
      }
    });
  }

  private getCurrentCharacter(): Character | null {
    if (!this.gameState.party.characters || this.gameState.party.characters.length === 0) {
      return null;
    }
    return this.gameState.party.characters[this.characterIndex] || null;
  }

  private getCombinedItems(character: Character): CombinedItem[] {
    const combined: CombinedItem[] = [];
    const equipSlots: Array<{ key: keyof Equipment; label: string }> = [
      { key: 'weapon', label: 'Weapon' },
      { key: 'armor', label: 'Armor' },
      { key: 'shield', label: 'Shield' },
      { key: 'helmet', label: 'Helmet' },
      { key: 'gauntlets', label: 'Gauntlets' },
      { key: 'boots', label: 'Boots' },
      { key: 'accessory', label: 'Accessory' },
    ];

    equipSlots.forEach((slot, index) => {
      const item = character.equipment[slot.key];
      if (item) {
        combined.push({
          item,
          equipSlot: slot.key,
          isEquipped: true,
          originalIndex: index,
        });
      }
    });

    character.inventory.forEach((item, index) => {
      combined.push({
        item,
        isEquipped: false,
        originalIndex: index,
      });
    });

    return combined;
  }

  private renderHeader(ctx: CanvasRenderingContext2D, character: Character): void {
    const x = 20;
    const y = 20;
    const width = ctx.canvas.width - 40;
    const height = 50;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${character.name} Lv.${character.level} ${character.race} ${character.class} (${character.alignment})`,
      x + 15,
      y + 32
    );
  }

  private renderStatsPanel(ctx: CanvasRenderingContext2D, character: Character): void {
    const x = 20;
    const y = 90;
    const width = 240;
    const height = 320;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('STATISTICS', x + 10, y + 25);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#fff';
    const statY = y + 50;
    const lineHeight = 22;

    const stats = [
      { label: 'ST', value: character.stats.strength, effectiveKey: null },
      { label: 'IQ', value: character.stats.intelligence, effectiveKey: null },
      { label: 'PI', value: character.stats.piety, effectiveKey: null },
      { label: 'VT', value: character.stats.vitality, effectiveKey: null },
      { label: 'AG', value: character.stats.agility, effectiveKey: null },
      { label: 'LK', value: character.stats.luck, effectiveKey: null },
    ];

    stats.forEach((stat, index) => {
      const currentY = statY + index * lineHeight;
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${stat.label}:`, x + 15, currentY);
      ctx.fillStyle = '#fff';
      ctx.fillText(`${stat.value}`, x + 60, currentY);
    });

    ctx.fillStyle = '#aaa';
    ctx.fillText('AC:', x + 15, statY + stats.length * lineHeight + 15);
    ctx.fillStyle = '#fff';
    ctx.fillText(`${character.effectiveAC}`, x + 60, statY + stats.length * lineHeight + 15);

    ctx.fillStyle = '#aaa';
    ctx.fillText('HP:', x + 15, statY + stats.length * lineHeight + 37);
    ctx.fillStyle = character.hp > character.maxHp * 0.5 ? '#00ff00' : character.hp > character.maxHp * 0.25 ? '#ffaa00' : '#ff0000';
    ctx.fillText(`${character.hp}/${character.maxHp}`, x + 60, statY + stats.length * lineHeight + 37);

    ctx.fillStyle = '#aaa';
    ctx.fillText('MP:', x + 15, statY + stats.length * lineHeight + 59);
    ctx.fillStyle = '#8af';
    ctx.fillText(`${character.mp}/${character.maxMp}`, x + 60, statY + stats.length * lineHeight + 59);

    ctx.fillStyle = '#aaa';
    ctx.fillText('Gold:', x + 15, statY + stats.length * lineHeight + 81);
    ctx.fillStyle = '#ffa500';
    ctx.fillText(`${character.gold}`, x + 60, statY + stats.length * lineHeight + 81);
  }

  private renderItemsPanel(ctx: CanvasRenderingContext2D, character: Character): void {
    const x = 280;
    const y = 90;
    const width = 330;
    const height = 490;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    const allItems = this.getCombinedItems(character);
    const totalPages = Math.max(1, Math.ceil(allItems.length / this.itemsPerPage));
    const startIndex = this.itemsPage * this.itemsPerPage;
    const endIndex = Math.min(allItems.length, startIndex + this.itemsPerPage);
    const pageItems = allItems.slice(startIndex, endIndex);

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ITEMS (${this.itemsPage + 1}/${totalPages})`, x + 10, y + 25);

    const weight = InventorySystem.getInventoryWeight(character);
    const capacity = InventorySystem.getCarryCapacity(character);
    const weightColor = weight > capacity ? '#ff0000' : weight > capacity * 0.8 ? '#ffaa00' : '#fff';

    ctx.fillStyle = weightColor;
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${weight}/${capacity}lbs`, x + width - 10, y + 25);
    ctx.textAlign = 'left';

    if (pageItems.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.fillText('(no items)', x + 15, y + 60);
      return;
    }

    ctx.font = '12px monospace';
    const itemY = y + 50;
    const lineHeight = 16;

    pageItems.forEach((combined, index) => {
      const globalIndex = startIndex + index;
      const currentY = itemY + index * lineHeight;
      const isSelected = this.mode === 'items' && globalIndex === this.selectedItemIndex;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 5, currentY - 12, width - 10, lineHeight);
      }

      const prefix = isSelected ? '>' : ' ';
      const itemName = InventorySystem.getItemDescription(combined.item);
      const equipMarker = combined.isEquipped ? ' (E)' : '';
      const fullName = `${itemName}${equipMarker}`;
      const displayName = fullName.length > 36 ? fullName.substring(0, 33) + '...' : fullName;

      if (combined.item.cursed && combined.item.identified) {
        ctx.fillStyle = '#ff0000';
      } else {
        ctx.fillStyle = isSelected ? '#ffa500' : '#fff';
      }

      ctx.fillText(`${prefix} ${displayName}`, x + 10, currentY);
    });
  }

  private renderSpellsPanel(ctx: CanvasRenderingContext2D, character: Character): void {
    const x = 630;
    const y = 90;
    const width = 370;
    const height = 490;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    const spells = character.spells || [];
    const totalPages = Math.max(1, Math.ceil(spells.length / this.spellsPerPage));
    const startIndex = this.spellsPage * this.spellsPerPage;
    const endIndex = Math.min(spells.length, startIndex + this.spellsPerPage);
    const pageSpells = spells.slice(startIndex, endIndex);

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SPELLS (${this.spellsPage + 1}/${totalPages})`, x + 10, y + 25);

    ctx.fillStyle = '#8af';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`MP: ${character.mp}/${character.maxMp}`, x + width - 10, y + 25);
    ctx.textAlign = 'left';

    if (pageSpells.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.fillText('(no spells known)', x + 15, y + 60);
      return;
    }

    ctx.font = '12px monospace';
    const spellY = y + 50;
    const lineHeight = 16;

    pageSpells.forEach((spell, index) => {
      const globalIndex = startIndex + index;
      const currentY = spellY + index * lineHeight;
      const isSelected = this.mode === 'spells' && globalIndex === this.selectedSpellIndex;

      if (isSelected) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 5, currentY - 12, width - 10, lineHeight);
      }

      const prefix = isSelected ? '>' : ' ';
      const schoolColor = spell.school === 'mage' ? '#8af' : spell.school === 'priest' ? '#ffa500' : spell.school === 'alchemist' ? '#0f0' : '#f0f';
      const spellName = `Lv${spell.level}: ${spell.name}`;
      const displayName = spellName.length > 40 ? spellName.substring(0, 37) + '...' : spellName;

      ctx.fillStyle = isSelected ? '#ffa500' : schoolColor;
      ctx.fillText(`${prefix} ${displayName}`, x + 10, currentY);

      ctx.fillStyle = '#666';
      ctx.textAlign = 'right';
      ctx.fillText(`${spell.mpCost}MP`, x + width - 10, currentY);
      ctx.textAlign = 'left';
    });
  }

  private renderControls(ctx: CanvasRenderingContext2D): void {
    const y = ctx.canvas.height - 30;

    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    let controlText = '';
    switch (this.mode) {
      case 'view':
        controlText = 'I)tems  S)pells  P)rev  N)ext  ESC)Close';
        break;
      case 'items':
        controlText = 'Arrow Keys: Navigate  E)quip/Unequip  Enter/I)nspect  ESC)Back';
        break;
      case 'itemDetail':
        controlText = 'E)quip/Unequip  ESC)Back';
        break;
      case 'spells':
        controlText = 'Arrow Keys: Navigate  Enter/I)nspect  ESC)Back';
        break;
      case 'spellDetail':
        controlText = 'ESC)Back';
        break;
    }

    ctx.fillText(controlText, ctx.canvas.width / 2, y);
  }

  private renderItemDetailModal(ctx: CanvasRenderingContext2D, character: Character): void {
    const modalWidth = 500;
    const modalHeight = 350;
    const modalX = (ctx.canvas.width - modalWidth) / 2;
    const modalY = (ctx.canvas.height - modalHeight) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 3;
    ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

    const allItems = this.getCombinedItems(character);
    const combined = allItems[this.selectedItemIndex];
    const item = combined?.item;

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ITEM DETAILS', modalX + modalWidth / 2, modalY + 30);

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    if (!item) {
      ctx.fillStyle = '#666';
      ctx.fillText('(No item selected)', modalX + 30, modalY + 70);
    } else if (item.identified) {
      const itemDesc = InventorySystem.getItemDescription(item);
      const statusText = combined.isEquipped ? ' (EQUIPPED)' : '';
      ctx.fillStyle = '#fff';
      ctx.fillText(itemDesc + statusText, modalX + 30, modalY + 70);

      const damageEffect = item.effects?.find(e => e.type === 'damage');
      const damage = damageEffect && damageEffect.type === 'damage' ? damageEffect.value : 0;
      const acEffect = item.effects?.find(e => e.type === 'ac');
      const ac = acEffect && acEffect.type === 'ac' ? acEffect.value : 0;

      let yOffset = 100;
      ctx.fillStyle = '#aaa';

      ctx.fillText(`Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`, modalX + 30, modalY + yOffset);
      yOffset += 20;

      if (damage > 0) {
        ctx.fillText(`Damage: +${damage}`, modalX + 30, modalY + yOffset);
        yOffset += 20;
      }

      if (ac !== 0) {
        ctx.fillText(`AC: ${ac > 0 ? '+' : ''}${ac}`, modalX + 30, modalY + yOffset);
        yOffset += 20;
      }

      ctx.fillText(`Weight: ${item.weight} lbs`, modalX + 30, modalY + yOffset);
      yOffset += 20;

      ctx.fillText(`Value: ${item.value}g`, modalX + 30, modalY + yOffset);
      yOffset += 20;

      if (item.cursed) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText('CURSED - Cannot remove! Visit Temple (500g)', modalX + 30, modalY + yOffset);
        yOffset += 20;
      }

      const otherEffects = item.effects?.filter(e => e.type !== 'damage' && e.type !== 'ac') || [];
      if (otherEffects.length > 0) {
        yOffset += 5;
        ctx.fillStyle = '#8af';
        ctx.fillText('Special Effects:', modalX + 30, modalY + yOffset);
        yOffset += 18;
        otherEffects.forEach(effect => {
          ctx.fillStyle = '#aaa';
          const effectAny = effect as any;
          if (effectAny.statusType) {
            const statusName = effectAny.statusType.charAt(0).toUpperCase() + effectAny.statusType.slice(1);
            const chancePercent = Math.round((effectAny.chance || 0) * 100);
            const duration = effectAny.duration || 0;
            ctx.fillText(`  On Hit: ${statusName} (${chancePercent}% chance, ${duration} turns)`, modalX + 30, modalY + yOffset);
          } else if (effect.value !== undefined) {
            ctx.fillText(`  ${effect.type}: ${effect.value > 0 ? '+' : ''}${effect.value}`, modalX + 30, modalY + yOffset);
          } else {
            ctx.fillText(`  ${effect.type}`, modalX + 30, modalY + yOffset);
          }
          yOffset += 18;
        });
      }
    } else {
      const unidentifiedName = item.unidentifiedName || '?Unknown';
      ctx.fillStyle = '#fff';
      ctx.fillText(unidentifiedName, modalX + 30, modalY + 70);
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`, modalX + 30, modalY + 100);
      ctx.fillText(`Weight: ${item.weight} lbs`, modalX + 30, modalY + 120);
      ctx.fillStyle = '#666';
      ctx.fillText('(Unidentified - stats unknown)', modalX + 30, modalY + 150);
      ctx.fillText('Visit shop to identify or use Bishop', modalX + 30, modalY + 175);
    }

    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    const controls = combined?.isEquipped ? 'E: Unequip | ESC: Back' : 'E: Equip | ESC: Back';
    ctx.fillText(controls, modalX + modalWidth / 2, modalY + modalHeight - 20);
  }

  private renderSpellDetailModal(ctx: CanvasRenderingContext2D, character: Character): void {
    const modalWidth = 500;
    const modalHeight = 350;
    const modalX = (ctx.canvas.width - modalWidth) / 2;
    const modalY = (ctx.canvas.height - modalHeight) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 3;
    ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

    const spell = character.spells[this.selectedSpellIndex];

    ctx.fillStyle = '#ffa500';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPELL DETAILS', modalX + modalWidth / 2, modalY + 30);

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    if (!spell) {
      ctx.fillStyle = '#666';
      ctx.fillText('(No spell selected)', modalX + 30, modalY + 70);
    } else {
      const schoolColor = spell.school === 'mage' ? '#8af' : spell.school === 'priest' ? '#ffa500' : spell.school === 'alchemist' ? '#0f0' : '#f0f';
      ctx.fillStyle = schoolColor;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(spell.name, modalX + 30, modalY + 70);

      let yOffset = 95;
      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';

      ctx.fillText(`School: ${spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}`, modalX + 30, modalY + yOffset);
      yOffset += 20;

      ctx.fillText(`Level: ${spell.level}`, modalX + 30, modalY + yOffset);
      yOffset += 20;

      ctx.fillText(`MP Cost: ${spell.mpCost}`, modalX + 30, modalY + yOffset);
      yOffset += 20;

      ctx.fillText(`Target: ${spell.targetType}`, modalX + 30, modalY + yOffset);
      yOffset += 20;

      const usageText = spell.inCombat && spell.outOfCombat ? 'Combat & Out' : spell.inCombat ? 'Combat Only' : 'Out of Combat';
      ctx.fillText(`Usage: ${usageText}`, modalX + 30, modalY + yOffset);
      yOffset += 25;

      ctx.fillStyle = '#fff';
      ctx.fillText('Description:', modalX + 30, modalY + yOffset);
      yOffset += 20;

      ctx.fillStyle = '#ccc';
      const maxLineLength = 50;
      const words = spell.description.split(' ');
      let line = '';
      words.forEach(word => {
        const testLine = line + word + ' ';
        if (testLine.length > maxLineLength) {
          ctx.fillText(line, modalX + 30, modalY + yOffset);
          yOffset += 18;
          line = word + ' ';
        } else {
          line = testLine;
        }
      });
      if (line) {
        ctx.fillText(line, modalX + 30, modalY + yOffset);
      }
    }

    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ESC: Back', modalX + modalWidth / 2, modalY + modalHeight - 20);
  }

  public handleInput(key: string): boolean {
    const normalizedKey = key.toLowerCase();

    switch (this.mode) {
      case 'view':
        return this.handleViewInput(normalizedKey);
      case 'items':
        return this.handleItemsInput(normalizedKey);
      case 'itemDetail':
        return this.handleItemDetailInput(normalizedKey);
      case 'spells':
        return this.handleSpellsInput(normalizedKey);
      case 'spellDetail':
        return this.handleSpellDetailInput(normalizedKey);
      default:
        return false;
    }
  }

  private handleViewInput(key: string): boolean {
    if (key === 'escape') {
      this.sceneManager.switchTo(this.returnToScene);
      return true;
    }

    if (key === 'i') {
      this.mode = 'items';
      this.selectedItemIndex = 0;
      return true;
    }

    if (key === 's') {
      this.mode = 'spells';
      this.selectedSpellIndex = 0;
      return true;
    }

    if (key === 'p') {
      const character = this.getCurrentCharacter();
      if (character && this.gameState.party.characters.length > 0) {
        this.characterIndex = (this.characterIndex - 1 + this.gameState.party.characters.length) % this.gameState.party.characters.length;
        this.resetView();
      }
      return true;
    }

    if (key === 'n') {
      const character = this.getCurrentCharacter();
      if (character && this.gameState.party.characters.length > 0) {
        this.characterIndex = (this.characterIndex + 1) % this.gameState.party.characters.length;
        this.resetView();
      }
      return true;
    }

    return false;
  }

  private handleItemsInput(key: string): boolean {
    const character = this.getCurrentCharacter();
    if (!character) return false;

    if (key === 'escape') {
      this.mode = 'view';
      return true;
    }

    if (key === 'e') {
      this.toggleEquipSelectedItem();
      return true;
    }

    if (key === 'enter' || key === 'i') {
      this.mode = 'itemDetail';
      return true;
    }

    const allItems = this.getCombinedItems(character);
    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.selectedItemIndex,
        maxIndex: allItems.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.selectedItemIndex = newIndex;
        },
        onConfirm: () => {
          this.mode = 'itemDetail';
        },
      }
    );

    return action.type !== 'none';
  }

  private handleItemDetailInput(key: string): boolean {
    if (key === 'escape') {
      this.mode = 'items';
      return true;
    }

    if (key === 'e') {
      this.toggleEquipSelectedItem();
      return true;
    }

    return false;
  }

  private handleSpellsInput(key: string): boolean {
    const character = this.getCurrentCharacter();
    if (!character) return false;

    if (key === 'escape') {
      this.mode = 'view';
      return true;
    }

    if (key === 'enter' || key === 'i') {
      this.mode = 'spellDetail';
      return true;
    }

    const action = MenuInputHandler.handleMenuInput(
      key,
      {
        selectedIndex: this.selectedSpellIndex,
        maxIndex: character.spells.length - 1,
      },
      {
        onNavigate: (newIndex: number) => {
          this.selectedSpellIndex = newIndex;
        },
        onConfirm: () => {
          this.mode = 'spellDetail';
        },
      }
    );

    return action.type !== 'none';
  }

  private handleSpellDetailInput(key: string): boolean {
    if (key === 'escape') {
      this.mode = 'spells';
      return true;
    }

    return false;
  }

  private toggleEquipSelectedItem(): void {
    const character = this.getCurrentCharacter();
    if (!character) return;

    const allItems = this.getCombinedItems(character);
    const combined = allItems[this.selectedItemIndex];
    if (!combined) return;

    const item = combined.item;

    if (combined.isEquipped) {
      if (item.cursed) {
        this.messageLog?.add('This item is cursed! Cannot remove.');
        this.messageLog?.add('Visit the Temple to remove curse (500g)');
        return;
      }

      const success = InventorySystem.unequipItem(character, combined.equipSlot!);
      if (success) {
        this.messageLog?.add(`Unequipped ${item.name}`);
      } else {
        this.messageLog?.add('Cannot unequip this item');
      }
    } else {
      if (item.type === 'consumable') {
        this.messageLog?.add('Consumables cannot be equipped.');
        return;
      }

      const success = InventorySystem.equipItem(character, item.id);
      if (success) {
        this.messageLog?.add(`Equipped ${item.name}`);
      } else {
        this.messageLog?.add('Cannot equip this item');
      }
    }
  }

  private resetView(): void {
    this.selectedItemIndex = 0;
    this.selectedSpellIndex = 0;
    this.itemsPage = 0;
    this.spellsPage = 0;
    this.mode = 'view';
  }

  public setCharacterIndex(index: number): void {
    this.characterIndex = index;
    this.resetView();
  }

  public setReturnScene(sceneName: string): void {
    this.returnToScene = sceneName;
  }
}
