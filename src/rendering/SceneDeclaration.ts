import { ASCIIGrid, CellStyle } from './ASCIIState';

// Input zone for handling user interactions
export interface InputZone {
  id: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'button' | 'menu-item' | 'grid-cell' | 'custom';
  enabled: boolean;
  onActivate?: (zone: InputZone) => void;
  onHover?: (zone: InputZone) => void;
  keyBinding?: string;  // Keyboard shortcut
}

// UI Element definition
export interface UIElement {
  id: string;
  type: 'text' | 'box' | 'list' | 'grid' | 'bar' | 'custom';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  content?: string | string[];
  style?: CellStyle;
  visible: boolean;
  zIndex?: number;
}

// Animation frame for transitions
export interface AnimationFrame {
  duration: number;  // milliseconds
  changes: Array<{
    x: number;
    y: number;
    char: string;
    style?: CellStyle;
  }>;
}

// Animation sequence
export interface Animation {
  id: string;
  frames: AnimationFrame[];
  loop: boolean;
  onComplete?: () => void;
}

// Layer for compositing
export interface RenderLayer {
  id: string;
  grid: ASCIIGrid;
  opacity?: number;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  visible: boolean;
  zIndex: number;
}

// Main scene declaration interface
export interface SceneDeclaration {
  id: string;
  name: string;
  
  // Visual layers
  layers: RenderLayer[];
  
  // UI elements
  uiElements: UIElement[];
  
  // Interactive zones
  inputZones: InputZone[];
  
  // Active animations
  animations?: Animation[];
  
  // Scene-specific data
  data?: Record<string, any>;
  
  // Lifecycle hooks
  onEnter?: () => void;
  onExit?: () => void;
  onUpdate?: (deltaTime: number) => void;
  
  // Render configuration
  renderConfig?: {
    clearColor?: string;
    fontSize?: number;
    fontFamily?: string;
    letterSpacing?: number;
    lineHeight?: number;
  };
}

// Menu item for UI lists
export interface MenuItem {
  id: string;
  label: string;
  enabled: boolean;
  selected?: boolean;
  icon?: string;
  shortcut?: string;
  action?: () => void;
}

// Status bar segment
export interface StatusBarSegment {
  label: string;
  value: string | number;
  maxValue?: number;  // For progress bars
  style?: CellStyle;
  width?: number;
}

// Dialog box declaration
export interface DialogDeclaration {
  title: string;
  content: string[];
  buttons?: Array<{
    label: string;
    action: () => void;
    default?: boolean;
  }>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  modal?: boolean;
}

// Inventory grid declaration
export interface InventoryGridDeclaration {
  rows: number;
  cols: number;
  items: Array<{
    slot: number;
    icon: string;
    name: string;
    quantity?: number;
    equipped?: boolean;
  }>;
  selectedSlot?: number;
  emptySlotChar?: string;
}

// Scene builder helper class
export class SceneBuilder {
  private scene: SceneDeclaration;

  constructor(id: string, name: string) {
    this.scene = {
      id,
      name,
      layers: [],
      uiElements: [],
      inputZones: []
    };
  }

  public addLayer(layer: RenderLayer): SceneBuilder {
    this.scene.layers.push(layer);
    this.scene.layers.sort((a, b) => a.zIndex - b.zIndex);
    return this;
  }

  public addUIElement(element: UIElement): SceneBuilder {
    this.scene.uiElements.push(element);
    return this;
  }

  public addInputZone(zone: InputZone): SceneBuilder {
    this.scene.inputZones.push(zone);
    return this;
  }

  public addAnimation(animation: Animation): SceneBuilder {
    if (!this.scene.animations) {
      this.scene.animations = [];
    }
    this.scene.animations.push(animation);
    return this;
  }

  public setRenderConfig(config: SceneDeclaration['renderConfig']): SceneBuilder {
    this.scene.renderConfig = config;
    return this;
  }

  public setData(data: Record<string, any>): SceneBuilder {
    this.scene.data = data;
    return this;
  }

  public onEnter(callback: () => void): SceneBuilder {
    this.scene.onEnter = callback;
    return this;
  }

  public onExit(callback: () => void): SceneBuilder {
    this.scene.onExit = callback;
    return this;
  }

  public onUpdate(callback: (deltaTime: number) => void): SceneBuilder {
    this.scene.onUpdate = callback;
    return this;
  }

  public build(): SceneDeclaration {
    return this.scene;
  }
}

// Utility functions for common UI patterns
export class UIPatterns {
  // Create a menu from items
  public static createMenu(
    x: number,
    y: number,
    items: MenuItem[],
    selectedIndex: number = 0
  ): UIElement[] {
    const elements: UIElement[] = [];
    
    items.forEach((item, index) => {
      const prefix = index === selectedIndex ? '> ' : '  ';
      const suffix = item.shortcut ? ` [${item.shortcut}]` : '';
      
      elements.push({
        id: `menu-item-${item.id}`,
        type: 'text',
        position: { x: x, y: y + index },
        content: `${prefix}${item.label}${suffix}`,
        style: {
          foreground: item.enabled ? '#ffffff' : '#666666',
          bold: index === selectedIndex
        },
        visible: true
      });
    });
    
    return elements;
  }

  // Create a status bar
  public static createStatusBar(
    y: number,
    segments: StatusBarSegment[]
  ): UIElement[] {
    const elements: UIElement[] = [];
    let currentX = 0;
    
    segments.forEach((segment, index) => {
      const text = segment.maxValue !== undefined
        ? `${segment.label}: ${segment.value}/${segment.maxValue}`
        : `${segment.label}: ${segment.value}`;
      
      elements.push({
        id: `status-segment-${index}`,
        type: 'text',
        position: { x: currentX, y },
        content: text,
        style: segment.style,
        visible: true
      });
      
      currentX += segment.width || (text.length + 2);
    });
    
    return elements;
  }

  // Create a dialog box
  public static createDialog(dialog: DialogDeclaration): UIElement[] {
    const elements: UIElement[] = [];
    const width = dialog.size?.width || 40;
    const height = dialog.size?.height || 10;
    const x = dialog.position?.x || Math.floor((80 - width) / 2);
    const y = dialog.position?.y || Math.floor((25 - height) / 2);
    
    // Box border
    elements.push({
      id: 'dialog-box',
      type: 'box',
      position: { x, y },
      size: { width, height },
      visible: true,
      zIndex: 100
    });
    
    // Title
    if (dialog.title) {
      elements.push({
        id: 'dialog-title',
        type: 'text',
        position: { x: x + 2, y: y + 1 },
        content: dialog.title,
        style: { bold: true },
        visible: true,
        zIndex: 101
      });
    }
    
    // Content
    dialog.content.forEach((line, index) => {
      elements.push({
        id: `dialog-content-${index}`,
        type: 'text',
        position: { x: x + 2, y: y + 3 + index },
        content: line,
        visible: true,
        zIndex: 101
      });
    });
    
    // Buttons
    if (dialog.buttons) {
      const buttonY = y + height - 2;
      let buttonX = x + 2;
      
      dialog.buttons.forEach((button, index) => {
        const buttonText = button.default ? `[${button.label}]` : ` ${button.label} `;
        elements.push({
          id: `dialog-button-${index}`,
          type: 'text',
          position: { x: buttonX, y: buttonY },
          content: buttonText,
          style: { bold: button.default },
          visible: true,
          zIndex: 101
        });
        buttonX += buttonText.length + 2;
      });
    }
    
    return elements;
  }
}