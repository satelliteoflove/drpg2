export abstract class Scene {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public abstract enter(): void;
  public abstract exit(): void;
  public abstract update(deltaTime: number): void;
  public abstract render(ctx: CanvasRenderingContext2D): void;
  public abstract handleInput(key: string): boolean;
}

export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private nextScene: string | null = null;

  public addScene(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
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
