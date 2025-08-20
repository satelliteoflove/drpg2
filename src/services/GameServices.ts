import { ServiceContainer, serviceContainer } from './ServiceContainer';
import { ServiceIdentifiers } from './ServiceIdentifiers';
import { RenderManager } from '../core/RenderManager';
import { InputManager } from '../core/Input';
import { SceneManager } from '../core/Scene';
import { SaveManager } from '../utils/SaveManager';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { ErrorHandler } from '../utils/ErrorHandler';

export interface GameServiceDependencies {
  canvas: HTMLCanvasElement;
}

export class GameServices {
  private container: ServiceContainer;
  private dependencies: GameServiceDependencies;

  constructor(dependencies: GameServiceDependencies) {
    this.container = serviceContainer;
    this.dependencies = dependencies;
    this.registerServices();
  }

  private registerServices(): void {
    // Register RenderManager with canvas dependency
    this.container.register(
      ServiceIdentifiers.RenderManager,
      () => new RenderManager(this.dependencies.canvas),
      { singleton: true }
    );

    // Register InputManager
    this.container.register(
      ServiceIdentifiers.InputManager,
      () => new InputManager(),
      { singleton: true }
    );

    // Register SceneManager
    this.container.register(
      ServiceIdentifiers.SceneManager,
      () => new SceneManager(),
      { singleton: true }
    );

    // SaveManager and ErrorHandler are static utilities, handled directly in getters

    // Register DungeonGenerator (non-singleton as it's stateless)
    this.container.register(
      ServiceIdentifiers.DungeonGenerator,
      () => new DungeonGenerator(20, 20),
      { singleton: false }
    );
  }

  public getRenderManager(): RenderManager {
    return this.container.resolve(ServiceIdentifiers.RenderManager);
  }

  public getInputManager(): InputManager {
    return this.container.resolve(ServiceIdentifiers.InputManager);
  }

  public getSceneManager(): SceneManager {
    return this.container.resolve(ServiceIdentifiers.SceneManager);
  }

  public getSaveManager(): typeof SaveManager {
    return SaveManager;
  }

  public getDungeonGenerator(): DungeonGenerator {
    return this.container.resolve(ServiceIdentifiers.DungeonGenerator);
  }

  public getErrorHandler(): typeof ErrorHandler {
    return ErrorHandler;
  }

  public dispose(): void {
    this.container.dispose();
  }
}