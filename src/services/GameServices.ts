import { ServiceContainer, serviceContainer } from './ServiceContainer';
import { ServiceIdentifiers } from './ServiceIdentifiers';
import { RenderManager } from '../core/RenderManager';
import { InputManager } from '../core/Input';
import { SceneManager } from '../core/Scene';
import { SaveManager } from '../utils/SaveManager';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { ErrorHandler } from '../utils/ErrorHandler';
import { SpellCaster } from '../systems/magic/SpellCaster';
import { SpellRegistry } from '../systems/magic/SpellRegistry';
import { GAME_CONFIG } from '../config/GameConstants';
import { SpellValidation } from '../systems/magic/SpellValidation';
import { CombatSystem } from '../systems/CombatSystem';
import { StatusEffectSystem } from '../systems/StatusEffectSystem';

export interface GameServiceDependencies {
  canvas: HTMLCanvasElement;
}

export class GameServices {
  private static instance: GameServices | null = null;
  private container: ServiceContainer;
  private dependencies: GameServiceDependencies;

  constructor(dependencies: GameServiceDependencies) {
    this.container = serviceContainer;
    this.dependencies = dependencies;
    this.registerServices();
    GameServices.instance = this;
  }

  public static getInstance(): GameServices {
    if (!GameServices.instance) {
      if (typeof window !== 'undefined' && (window as any).game?.services) {
        GameServices.instance = (window as any).game.services;
      }
      if (!GameServices.instance) {
        throw new Error('GameServices not initialized. Game must be started first.');
      }
    }
    return GameServices.instance;
  }

  private registerServices(): void {
    // Register RenderManager with canvas dependency
    this.container.register(
      ServiceIdentifiers.RenderManager,
      () => new RenderManager(this.dependencies.canvas),
      { singleton: true }
    );

    // Register InputManager
    this.container.register(ServiceIdentifiers.InputManager, () => new InputManager(), {
      singleton: true,
    });

    // Register SceneManager
    this.container.register(ServiceIdentifiers.SceneManager, () => new SceneManager(), {
      singleton: true,
    });

    // SaveManager and ErrorHandler are static utilities, handled directly in getters

    // Register DungeonGenerator (non-singleton as it's stateless)
    this.container.register(
      ServiceIdentifiers.DungeonGenerator,
      () => new DungeonGenerator(
        GAME_CONFIG.DUNGEON.DEFAULT_WIDTH,
        GAME_CONFIG.DUNGEON.DEFAULT_HEIGHT
      ),
      { singleton: false }
    );

    // Register Magic System Services
    this.container.register(
      ServiceIdentifiers.SpellRegistry,
      () => SpellRegistry.getInstance(),
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.SpellValidation,
      () => new SpellValidation(),
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.SpellCaster,
      () => SpellCaster.getInstance(),
      { singleton: true }
    );

    // Register Combat System
    this.container.register(
      ServiceIdentifiers.CombatSystem,
      () => new CombatSystem(),
      { singleton: true }
    );

    // Register Status Effect System
    this.container.register(
      ServiceIdentifiers.StatusEffectSystem,
      () => StatusEffectSystem.getInstance(),
      { singleton: true }
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

  public getSpellRegistry(): SpellRegistry {
    return this.container.resolve(ServiceIdentifiers.SpellRegistry);
  }

  public getSpellValidation(): SpellValidation {
    return this.container.resolve(ServiceIdentifiers.SpellValidation);
  }

  public getSpellCaster(): SpellCaster {
    return this.container.resolve(ServiceIdentifiers.SpellCaster);
  }

  public getCombatSystem(): CombatSystem {
    return this.container.resolve(ServiceIdentifiers.CombatSystem);
  }

  public getStatusEffectSystem(): StatusEffectSystem {
    return this.container.resolve(ServiceIdentifiers.StatusEffectSystem);
  }

  public dispose(): void {
    this.container.dispose();
  }
}
