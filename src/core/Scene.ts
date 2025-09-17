import { RenderManager } from './RenderManager';
import { DebugLogger } from '../utils/DebugLogger';

export interface SceneRenderContext {
  renderManager: RenderManager;
  mainContext: CanvasRenderingContext2D;
}

export abstract class Scene {
  protected name: string;
  protected renderManager?: RenderManager;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public setRenderManager(renderManager: RenderManager): void {
    this.renderManager = renderManager;
  }

  public abstract enter(): void;
  public abstract exit(): void;
  public abstract update(deltaTime: number): void;
  public abstract render(ctx: CanvasRenderingContext2D): void;
  public abstract renderLayered(renderContext: SceneRenderContext): void;
  public abstract handleInput(key: string): boolean;

  public hasLayeredRendering(): boolean {
    return this.renderManager !== undefined;
  }
}

export class SceneManager {
  public scenes: Map<string, Scene> = new Map();
  private _currentScene: Scene | null = null;
  private nextScene: string | null = null;
  private renderManager?: RenderManager;
  public onSceneChange?: (sceneName: string) => void;

  public get currentScene(): Scene | null {
    return this._currentScene;
  }

  public setRenderManager(renderManager: RenderManager): void {
    this.renderManager = renderManager;
    // Inject render manager into all existing scenes
    for (const scene of this.scenes.values()) {
      scene.setRenderManager(renderManager);
    }
  }

  public addScene(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
    // Inject render manager if available
    if (this.renderManager) {
      scene.setRenderManager(this.renderManager);
    }
  }

  public switchTo(sceneName: string): void {
    DebugLogger.debug('SceneManager', 'Switching to scene: ' + sceneName);
    this.nextScene = sceneName;
  }

  public update(deltaTime: number): void {
    if (this.nextScene) {
      DebugLogger.debug('SceneManager', 'Processing scene switch to: ' + this.nextScene);

      if (this._currentScene) {
        DebugLogger.debug('SceneManager', 'Exiting current scene: ' + this._currentScene.getName());
        this._currentScene.exit();
      }

      const newScene = this.scenes.get(this.nextScene);
      DebugLogger.debug(
        'SceneManager',
        'Found new scene: ' + (newScene ? newScene.getName() : 'null')
      );

      this._currentScene = newScene || null;
      this.nextScene = null;

      if (this._currentScene) {
        DebugLogger.debug('SceneManager', 'Entering new scene: ' + this._currentScene.getName());
        console.log('[SceneManager] About to call enter() on scene:', this._currentScene.getName());
        // Reset layers for the new scene
        if (this.renderManager) {
          this.renderManager.resetForSceneChange();
        }
        // Notify about scene change for performance monitoring
        if (this.onSceneChange) {
          this.onSceneChange(this._currentScene.getName());
        }
        this._currentScene.enter();
        console.log('[SceneManager] Called enter() on scene:', this._currentScene.getName());
      }
    }

    if (this._currentScene) {
      this._currentScene.update(deltaTime);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this._currentScene) {
      DebugLogger.debug('SceneManager', 'Rendering scene: ' + this._currentScene.getName());
      this._currentScene.render(ctx);
    } else {
      DebugLogger.debug('SceneManager', 'No current scene to render');
    }
  }

  public renderLayered(ctx: CanvasRenderingContext2D): void {
    if (this._currentScene && this.renderManager) {
      this._currentScene.renderLayered({
        renderManager: this.renderManager,
        mainContext: ctx,
      });
    }
  }

  public handleInput(key: string): boolean {
    if (this._currentScene) {
      return this._currentScene.handleInput(key);
    }
    return false;
  }

  public getCurrentScene(): Scene | null {
    return this._currentScene;
  }

  public getScene(name: string): Scene | null {
    return this.scenes.get(name) || null;
  }
}
