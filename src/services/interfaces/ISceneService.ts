import { Scene, SceneManager } from '../../core/Scene';

export interface ISceneService {
  getSceneManager(): SceneManager;
  addScene(name: string, scene: Scene): void;
  switchTo(sceneName: string): void;
  getCurrentScene(): Scene | null;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  renderLayered(ctx: CanvasRenderingContext2D): void;
  handleInput(key: string): boolean;
}
