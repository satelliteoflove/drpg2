import { RenderManager } from './RenderManager';
import { DebugLogger } from '../utils/DebugLogger';
import { ErrorHandler, ErrorSeverity } from '../utils/ErrorHandler';

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

  protected handleError(error: Error, context: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM): void {
    const fullContext = `${this.constructor.name}.${context}`;
    ErrorHandler.logError(error.message, severity, fullContext, error);
  }

  protected safeExecute<T>(
    fn: () => T,
    context: string,
    fallback?: T,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): T | undefined {
    try {
      return fn();
    } catch (error) {
      this.handleError(error as Error, context, severity);
      return fallback;
    }
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
        try {
          this._currentScene.exit();
        } catch (error) {
          ErrorHandler.logError(
            `Error exiting scene ${this._currentScene.getName()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ErrorSeverity.MEDIUM,
            'SceneManager.update',
            error instanceof Error ? error : undefined
          );
        }
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
        DebugLogger.debug('SceneManager', 'About to call enter() on scene: ' + this._currentScene.getName());
        // Reset layers for the new scene
        if (this.renderManager) {
          this.renderManager.resetForSceneChange();
        }
        // Notify about scene change for performance monitoring
        if (this.onSceneChange) {
          this.onSceneChange(this._currentScene.getName());
        }
        try {
          this._currentScene.enter();
          DebugLogger.debug('SceneManager', 'Called enter() on scene: ' + this._currentScene.getName());
        } catch (error) {
          ErrorHandler.logError(
            `Error entering scene ${this._currentScene.getName()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ErrorSeverity.HIGH,
            'SceneManager.update',
            error instanceof Error ? error : undefined
          );
        }
      }
    }

    if (this._currentScene) {
      try {
        this._currentScene.update(deltaTime);
      } catch (error) {
        ErrorHandler.logError(
          `Error updating scene ${this._currentScene.getName()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ErrorSeverity.MEDIUM,
          'SceneManager.update',
          error instanceof Error ? error : undefined
        );
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this._currentScene) {
      DebugLogger.debug('SceneManager', 'Rendering scene: ' + this._currentScene.getName());
      try {
        this._currentScene.render(ctx);
      } catch (error) {
        ErrorHandler.logError(
          `Error rendering scene ${this._currentScene.getName()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ErrorSeverity.MEDIUM,
          'SceneManager.render',
          error instanceof Error ? error : undefined
        );
      }
    } else {
      DebugLogger.debug('SceneManager', 'No current scene to render');
    }
  }

  public renderLayered(ctx: CanvasRenderingContext2D): void {
    if (this._currentScene && this.renderManager) {
      try {
        this._currentScene.renderLayered({
          renderManager: this.renderManager,
          mainContext: ctx,
        });
      } catch (error) {
        ErrorHandler.logError(
          `Error in layered rendering for scene ${this._currentScene.getName()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ErrorSeverity.MEDIUM,
          'SceneManager.renderLayered',
          error instanceof Error ? error : undefined
        );
      }
    }
  }

  public handleInput(key: string): boolean {
    if (this._currentScene) {
      try {
        return this._currentScene.handleInput(key);
      } catch (error) {
        ErrorHandler.logError(
          `Error handling input in scene ${this._currentScene.getName()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ErrorSeverity.MEDIUM,
          'SceneManager.handleInput',
          error instanceof Error ? error : undefined
        );
        return false;
      }
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
