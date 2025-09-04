import { InputZone } from './SceneDeclaration';
import { DebugLogger } from '../utils/DebugLogger';

// Constants for input handling
const KEYBOARD_REPEAT_DELAY = 500;
const KEYBOARD_REPEAT_RATE = 50;
const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 20;

// Input event types
export type InputEventType = 'click' | 'hover' | 'keypress' | 'keydown' | 'keyup';

// Input event data
export interface InputEvent {
  type: InputEventType;
  gridX?: number;
  gridY?: number;
  key?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  zone?: InputZone;
  timestamp: number;
}

// Input handler configuration
export interface InputHandlerConfig {
  charWidth?: number;
  charHeight?: number;
  enableKeyboard?: boolean;
  enableMouse?: boolean;
  keyboardRepeatDelay?: number;
  keyboardRepeatRate?: number;
}

// Key binding definition
export interface KeyBinding {
  key: string;
  modifiers?: {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  action: (event: InputEvent) => void;
  description?: string;
}

// Declarative input handler
export class InputHandler {
  private canvas: HTMLCanvasElement;
  private config: Required<InputHandlerConfig>;
  private inputZones: InputZone[] = [];
  private keyBindings: Map<string, KeyBinding> = new Map();
  private hoveredZone: InputZone | null = null;
  private focusedZone: InputZone | null = null;
  private keyRepeatTimers: Map<string, number> = new Map();
  private eventListeners: Map<InputEventType, Array<(event: InputEvent) => void>> = new Map();
  
  constructor(canvas: HTMLCanvasElement, config: InputHandlerConfig = {}) {
    this.canvas = canvas;
    
    this.config = {
      charWidth: config.charWidth || CHAR_WIDTH,
      charHeight: config.charHeight || CHAR_HEIGHT,
      enableKeyboard: config.enableKeyboard !== false,
      enableMouse: config.enableMouse !== false,
      keyboardRepeatDelay: config.keyboardRepeatDelay || KEYBOARD_REPEAT_DELAY,
      keyboardRepeatRate: config.keyboardRepeatRate || KEYBOARD_REPEAT_RATE
    };
    
    this.setupEventListeners();
    DebugLogger.info('InputHandler', 'Input handler initialized');
  }
  
  private setupEventListeners(): void {
    // Mouse events
    if (this.config.enableMouse) {
      this.canvas.addEventListener('click', this.handleMouseClick.bind(this));
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
    
    // Keyboard events
    if (this.config.enableKeyboard) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
      document.addEventListener('keypress', this.handleKeyPress.bind(this));
    }
  }
  
  // Set input zones for the current scene
  public setInputZones(zones: InputZone[]): void {
    this.inputZones = zones;
    this.hoveredZone = null;
    this.focusedZone = null;
    
    DebugLogger.debug('InputHandler', `Set ${zones.length} input zones`);
  }
  
  // Add a key binding
  public addKeyBinding(binding: KeyBinding): void {
    const key = this.getKeyBindingKey(binding);
    this.keyBindings.set(key, binding);
    
    DebugLogger.debug('InputHandler', `Added key binding: ${key}`);
  }
  
  // Remove a key binding
  public removeKeyBinding(key: string, modifiers?: KeyBinding['modifiers']): void {
    const bindingKey = this.getKeyString(key, modifiers);
    this.keyBindings.delete(bindingKey);
  }
  
  // Clear all key bindings
  public clearKeyBindings(): void {
    this.keyBindings.clear();
  }
  
  // Register event listener
  public addEventListener(type: InputEventType, callback: (event: InputEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(callback);
  }
  
  // Remove event listener
  public removeEventListener(type: InputEventType, callback: (event: InputEvent) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  // Convert pixel coordinates to grid coordinates
  private pixelToGrid(x: number, y: number): { gridX: number; gridY: number } {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;
    
    const gridX = Math.floor(canvasX / this.config.charWidth);
    const gridY = Math.floor(canvasY / this.config.charHeight);
    
    return { gridX, gridY };
  }
  
  // Find zone at grid coordinates
  private findZoneAt(gridX: number, gridY: number): InputZone | null {
    for (const zone of this.inputZones) {
      if (!zone.enabled) continue;
      
      const { x, y, width, height } = zone.bounds;
      if (gridX >= x && gridX < x + width &&
          gridY >= y && gridY < y + height) {
        return zone;
      }
    }
    return null;
  }
  
  // Handle mouse click
  private handleMouseClick(event: MouseEvent): void {
    const { gridX, gridY } = this.pixelToGrid(event.clientX, event.clientY);
    const zone = this.findZoneAt(gridX, gridY);
    
    const inputEvent: InputEvent = {
      type: 'click',
      gridX,
      gridY,
      zone: zone || undefined,
      timestamp: Date.now()
    };
    
    // Set focused zone
    this.focusedZone = zone;
    
    // Trigger zone activation
    if (zone && zone.onActivate) {
      zone.onActivate(zone);
    }
    
    // Dispatch event
    this.dispatchEvent(inputEvent);
    
    DebugLogger.debug('InputHandler', `Click at (${gridX}, ${gridY})${zone ? ` - Zone: ${zone.id}` : ''}`);
  }
  
  // Handle mouse move
  private handleMouseMove(event: MouseEvent): void {
    const { gridX, gridY } = this.pixelToGrid(event.clientX, event.clientY);
    const zone = this.findZoneAt(gridX, gridY);
    
    // Check if hovered zone changed
    if (zone !== this.hoveredZone) {
      // Leave previous zone
      if (this.hoveredZone) {
        DebugLogger.debug('InputHandler', `Mouse leave zone: ${this.hoveredZone.id}`);
      }
      
      // Enter new zone
      this.hoveredZone = zone;
      if (zone) {
        if (zone.onHover) {
          zone.onHover(zone);
        }
        DebugLogger.debug('InputHandler', `Mouse enter zone: ${zone.id}`);
      }
      
      // Dispatch hover event
      const inputEvent: InputEvent = {
        type: 'hover',
        gridX,
        gridY,
        zone: zone || undefined,
        timestamp: Date.now()
      };
      this.dispatchEvent(inputEvent);
    }
  }
  
  // Handle mouse leave
  private handleMouseLeave(): void {
    if (this.hoveredZone) {
      DebugLogger.debug('InputHandler', `Mouse leave zone: ${this.hoveredZone.id}`);
      this.hoveredZone = null;
    }
  }
  
  // Handle key down
  private handleKeyDown(event: KeyboardEvent): void {
    const inputEvent: InputEvent = {
      type: 'keydown',
      key: event.key,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now()
    };
    
    // Check for key binding
    const bindingKey = this.getKeyString(event.key, {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey
    });
    
    const binding = this.keyBindings.get(bindingKey);
    if (binding) {
      event.preventDefault();
      binding.action(inputEvent);
      DebugLogger.debug('InputHandler', `Key binding triggered: ${bindingKey}`);
    }
    
    // Check zone-specific key bindings
    if (this.focusedZone && this.focusedZone.keyBinding === event.key) {
      event.preventDefault();
      if (this.focusedZone.onActivate) {
        this.focusedZone.onActivate(this.focusedZone);
      }
    }
    
    // Setup key repeat
    if (!this.keyRepeatTimers.has(event.key)) {
      const repeatKey = event.key;
      const timer = window.setTimeout(() => {
        const interval = window.setInterval(() => {
          if (this.keyRepeatTimers.has(repeatKey)) {
            this.dispatchEvent(inputEvent);
          }
        }, this.config.keyboardRepeatRate);
        this.keyRepeatTimers.set(repeatKey, interval);
      }, this.config.keyboardRepeatDelay);
      this.keyRepeatTimers.set(repeatKey, timer);
    }
    
    this.dispatchEvent(inputEvent);
  }
  
  // Handle key up
  private handleKeyUp(event: KeyboardEvent): void {
    // Clear key repeat
    const timer = this.keyRepeatTimers.get(event.key);
    if (timer) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
      this.keyRepeatTimers.delete(event.key);
    }
    
    const inputEvent: InputEvent = {
      type: 'keyup',
      key: event.key,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now()
    };
    
    this.dispatchEvent(inputEvent);
  }
  
  // Handle key press
  private handleKeyPress(event: KeyboardEvent): void {
    const inputEvent: InputEvent = {
      type: 'keypress',
      key: event.key,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now()
    };
    
    this.dispatchEvent(inputEvent);
  }
  
  // Dispatch input event
  private dispatchEvent(event: InputEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }
  
  // Get key binding string
  private getKeyBindingKey(binding: KeyBinding): string {
    return this.getKeyString(binding.key, binding.modifiers);
  }
  
  // Get key string with modifiers
  private getKeyString(key: string, modifiers?: KeyBinding['modifiers']): string {
    const parts: string[] = [];
    if (modifiers?.ctrl) parts.push('Ctrl');
    if (modifiers?.alt) parts.push('Alt');
    if (modifiers?.shift) parts.push('Shift');
    if (modifiers?.meta) parts.push('Meta');
    parts.push(key);
    return parts.join('+');
  }
  
  // Get current focused zone
  public getFocusedZone(): InputZone | null {
    return this.focusedZone;
  }
  
  // Set focused zone programmatically
  public setFocusedZone(zoneId: string): void {
    const zone = this.inputZones.find(z => z.id === zoneId);
    if (zone) {
      this.focusedZone = zone;
      DebugLogger.debug('InputHandler', `Set focused zone: ${zoneId}`);
    }
  }
  
  // Navigate between zones (for keyboard navigation)
  public navigateZones(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.inputZones.length === 0) return;
    
    if (!this.focusedZone) {
      // Focus first enabled zone
      this.focusedZone = this.inputZones.find(z => z.enabled) || null;
      return;
    }
    
    const currentIndex = this.inputZones.indexOf(this.focusedZone);
    const enabledZones = this.inputZones.filter(z => z.enabled);
    
    if (enabledZones.length === 0) return;
    
    // Simple navigation (can be enhanced with spatial navigation)
    let nextIndex: number;
    switch (direction) {
      case 'down':
      case 'right':
        nextIndex = (currentIndex + 1) % this.inputZones.length;
        break;
      case 'up':
      case 'left':
        nextIndex = (currentIndex - 1 + this.inputZones.length) % this.inputZones.length;
        break;
    }
    
    // Find next enabled zone
    while (!this.inputZones[nextIndex].enabled) {
      nextIndex = (nextIndex + 1) % this.inputZones.length;
      if (nextIndex === currentIndex) break;
    }
    
    this.focusedZone = this.inputZones[nextIndex];
    DebugLogger.debug('InputHandler', `Navigated to zone: ${this.focusedZone.id}`);
  }
  
  // Cleanup
  public destroy(): void {
    // Remove event listeners
    if (this.config.enableMouse) {
      this.canvas.removeEventListener('click', this.handleMouseClick.bind(this));
      this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
    
    if (this.config.enableKeyboard) {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
      document.removeEventListener('keyup', this.handleKeyUp.bind(this));
      document.removeEventListener('keypress', this.handleKeyPress.bind(this));
    }
    
    // Clear timers
    this.keyRepeatTimers.forEach(timer => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    });
    this.keyRepeatTimers.clear();
    
    // Clear data
    this.inputZones = [];
    this.keyBindings.clear();
    this.eventListeners.clear();
    
    DebugLogger.info('InputHandler', 'Input handler destroyed');
  }
}