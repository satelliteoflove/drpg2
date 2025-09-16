import { Scene, SceneRenderContext } from '../core/Scene';
import { ASCIIState, ASCII_GRID_HEIGHT, ASCII_GRID_WIDTH } from './ASCIIState';
import { CanvasRenderer, RendererConfig } from './CanvasRenderer';
import { InputEvent, InputHandler, KeyBinding } from './InputHandler';
import { InputZone, SceneDeclaration, UIElement } from './SceneDeclaration';
import { FeatureFlagKey, FeatureFlags } from '../config/FeatureFlags';
import { DebugLogger } from '../utils/DebugLogger';

// Constants for scene management
const DEFAULT_RENDERER_CONFIG: RendererConfig = {
  charWidth: 10,
  charHeight: 20,
  fontFamily: 'monospace',
  fontSize: 16,
  antialiasing: false,
};

const UPDATE_THROTTLE_MS = 16; // ~60 FPS for state updates

export abstract class BaseASCIIScene extends Scene {
  protected asciiState: ASCIIState;
  protected canvasRenderer: CanvasRenderer | null = null;
  protected inputHandler: InputHandler | null = null;
  protected sceneDeclaration: SceneDeclaration | null = null;
  protected inputZones: InputZone[] = [];
  protected uiElements: UIElement[] = [];
  protected keyBindings: Map<string, KeyBinding> = new Map();
  protected lastUpdateTime: number = 0;
  protected isDirty: boolean = true;
  protected featureFlagKey: string;

  constructor(name: string, featureFlagKey: string) {
    super(name);
    this.featureFlagKey = featureFlagKey;
    this.asciiState = new ASCIIState(ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT);
    DebugLogger.info('BaseASCIIScene', `Initialized ASCII scene: ${name}`);
  }

  protected initializeRenderers(canvas: HTMLCanvasElement, config?: RendererConfig): void {
    const rendererConfig = { ...DEFAULT_RENDERER_CONFIG, ...config };
    this.canvasRenderer = new CanvasRenderer(canvas, rendererConfig);
    this.inputHandler = new InputHandler(canvas, {
      charWidth: rendererConfig.charWidth,
      charHeight: rendererConfig.charHeight,
      enableKeyboard: true,
      enableMouse: true,
    });

    this.setupInputHandlers();
    DebugLogger.info('BaseASCIIScene', 'Renderers initialized');
  }

  protected abstract setupInputHandlers(): void;
  protected abstract updateASCIIState(deltaTime: number): void;
  protected abstract generateSceneDeclaration(): SceneDeclaration;

  protected renderDeclarative(_ctx: CanvasRenderingContext2D): void {
    if (!this.canvasRenderer) {
      DebugLogger.warn('BaseASCIIScene', 'CanvasRenderer not initialized');
      return;
    }

    if (this.isDirty) {
      this.sceneDeclaration = this.generateSceneDeclaration();
      this.canvasRenderer.renderScene(this.sceneDeclaration);
      this.isDirty = false;
    } else {
      const dirtyRegions = this.asciiState.getDirtyRegions();
      if (dirtyRegions.size > 0) {
        this.canvasRenderer.renderASCIIGrid(this.asciiState.getGrid());
        this.asciiState.clearDirtyRegions();
      }
    }
  }

  protected renderImperative(_ctx: CanvasRenderingContext2D): void {
    DebugLogger.warn('BaseASCIIScene', `renderImperative not implemented for ${this.name}`);
  }

  public enter(): void {
    DebugLogger.info('BaseASCIIScene', `Entering scene: ${this.name}`);
    this.clearState();
    this.setupScene();
    this.isDirty = true;
  }

  public exit(): void {
    DebugLogger.info('BaseASCIIScene', `Exiting scene: ${this.name}`);
    this.clearInputZones();
    this.clearKeyBindings();
  }

  public update(deltaTime: number): void {
    const now = Date.now();
    if (now - this.lastUpdateTime > UPDATE_THROTTLE_MS) {
      this.updateASCIIState(deltaTime);
      this.lastUpdateTime = now;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.shouldUseASCIIRendering()) {
      this.renderDeclarative(ctx);
    } else {
      this.renderImperative(ctx);
    }
  }

  public renderLayered(renderContext: SceneRenderContext): void {
    this.render(renderContext.mainContext);
  }

  public handleInput(key: string): boolean {
    const handled = this.handleKeyBinding(key);
    if (handled) {
      DebugLogger.debug('BaseASCIIScene', `Key handled: ${key}`);
      return true;
    }
    return false;
  }

  protected shouldUseASCIIRendering(): boolean {
    return (
      FeatureFlags.isEnabled(FeatureFlagKey.ASCII_RENDERING) ||
      FeatureFlags.isEnabled(this.featureFlagKey, this.name)
    );
  }

  protected abstract setupScene(): void;

  protected clearState(): void {
    this.asciiState.clear();
    this.uiElements = [];
    this.inputZones = [];
    this.isDirty = true;
  }

  protected addInputZone(zone: InputZone): void {
    this.inputZones.push(zone);
    if (this.inputHandler) {
      this.inputHandler.setInputZones(this.inputZones);
    }
  }

  protected removeInputZone(zoneId: string): void {
    this.inputZones = this.inputZones.filter((z) => z.id !== zoneId);
    if (this.inputHandler) {
      this.inputHandler.setInputZones(this.inputZones);
    }
  }

  protected clearInputZones(): void {
    this.inputZones = [];
    if (this.inputHandler) {
      this.inputHandler.setInputZones([]);
    }
  }

  protected addKeyBinding(binding: KeyBinding): void {
    const key = this.getKeyBindingKey(binding);
    this.keyBindings.set(key, binding);
    if (this.inputHandler) {
      this.inputHandler.addKeyBinding(binding);
    }
  }

  protected removeKeyBinding(key: string): void {
    this.keyBindings.delete(key);
    if (this.inputHandler) {
      this.inputHandler.removeKeyBinding(key);
    }
  }

  protected clearKeyBindings(): void {
    this.keyBindings.clear();
    if (this.inputHandler) {
      this.inputHandler.clearKeyBindings();
    }
  }

  private getKeyBindingKey(binding: KeyBinding): string {
    let key = binding.key;
    if (binding.modifiers) {
      if (binding.modifiers.ctrl) key = 'ctrl+' + key;
      if (binding.modifiers.alt) key = 'alt+' + key;
      if (binding.modifiers.shift) key = 'shift+' + key;
      if (binding.modifiers.meta) key = 'meta+' + key;
    }
    return key;
  }

  private handleKeyBinding(key: string): boolean {
    const binding = this.keyBindings.get(key);
    if (binding && binding.action) {
      const event: InputEvent = {
        type: 'keypress',
        key,
        timestamp: Date.now(),
      };
      binding.action(event);
      return true;
    }
    return false;
  }

  protected addUIElement(element: UIElement): void {
    this.uiElements.push(element);
    this.renderUIElement(element);
    this.isDirty = true;
  }

  protected updateUIElement(elementId: string, updates: Partial<UIElement>): void {
    const element = this.uiElements.find((e) => e.id === elementId);
    if (element) {
      Object.assign(element, updates);
      this.renderUIElement(element);
      this.isDirty = true;
    }
  }

  protected removeUIElement(elementId: string): void {
    this.uiElements = this.uiElements.filter((e) => e.id !== elementId);
    this.isDirty = true;
  }

  private renderUIElement(element: UIElement): void {
    if (!element.visible) return;

    const { x, y } = element.position;

    switch (element.type) {
      case 'text':
        if (element.content && typeof element.content === 'string') {
          this.asciiState.writeText(x, y, element.content, element.style);
        }
        break;

      case 'box':
        if (element.size) {
          this.asciiState.drawBox(x, y, element.size.width, element.size.height);
        }
        break;

      case 'list':
        if (element.content && Array.isArray(element.content)) {
          element.content.forEach((line, index) => {
            this.asciiState.writeText(x, y + index, line, element.style);
          });
        }
        break;

      case 'bar':
        if (element.size && element.content) {
          const percentage = parseFloat(element.content as string) || 0;
          const fillWidth = Math.floor((element.size.width * percentage) / 100);
          const emptyWidth = element.size.width - fillWidth;

          const barText = '█'.repeat(fillWidth) + '░'.repeat(emptyWidth);
          this.asciiState.writeText(x, y, barText, element.style);
        }
        break;

      case 'grid':
      case 'custom':
        DebugLogger.warn('BaseASCIIScene', `UIElement type ${element.type} not yet implemented`);
        break;
    }
  }

  protected markDirty(): void {
    this.isDirty = true;
  }

  public serialize(): string {
    const data = {
      sceneName: this.name,
      asciiState: this.asciiState.serialize(),
      inputZones: this.inputZones,
      uiElements: this.uiElements,
      featureFlagKey: this.featureFlagKey,
    };
    return JSON.stringify(data);
  }

  public deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.asciiState) {
        this.asciiState = ASCIIState.deserialize(parsed.asciiState);
      }
      if (parsed.inputZones) {
        this.inputZones = parsed.inputZones;
      }
      if (parsed.uiElements) {
        this.uiElements = parsed.uiElements;
      }
      this.isDirty = true;
      DebugLogger.info('BaseASCIIScene', `Deserialized scene: ${this.name}`);
    } catch (error) {
      DebugLogger.error('BaseASCIIScene', `Failed to deserialize scene: ${error}`);
    }
  }

  protected drawBorder(): void {
    this.asciiState.drawBox(0, 0, ASCII_GRID_WIDTH, ASCII_GRID_HEIGHT, {
      horizontal: '─',
      vertical: '│',
      corner: '┌',
    });
  }

  protected centerText(y: number, text: string, style?: any): void {
    const x = Math.floor((ASCII_GRID_WIDTH - text.length) / 2);
    this.asciiState.writeText(x, y, text, style);
  }

  protected clearRegion(x: number, y: number, width: number, height: number): void {
    this.asciiState.setRegion(x, y, width, height, ' ', 'empty');
  }
}
