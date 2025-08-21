import { RenderManager } from './RenderManager';

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
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private nextScene: string | null = null;
  private renderManager?: RenderManager;

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
    this.nextScene = sceneName;
  }

  public update(deltaTime: number): void {
    if (this.nextScene) {
      if (this.currentScene) {
        this.currentScene.exit();
      }

      this.currentScene = this.scenes.get(this.nextScene) || null;
      this.nextScene = null;

      if (this.currentScene) {
        // Reset layers for the new scene
        if (this.renderManager) {
          this.renderManager.resetForSceneChange();
        }
        this.currentScene.enter();
      }
    }

    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.currentScene) {
      this.currentScene.render(ctx);
    }
  }

  public renderLayered(ctx: CanvasRenderingContext2D): void {
    if (this.currentScene && this.renderManager) {
      this.currentScene.renderLayered({
        renderManager: this.renderManager,
        mainContext: ctx,
      });
    }
  }

  public handleInput(key: string): boolean {
    if (this.currentScene) {
      return this.currentScene.handleInput(key);
    }
    return false;
  }

  public getCurrentScene(): Scene | null {
    return this.currentScene;
  }
}
