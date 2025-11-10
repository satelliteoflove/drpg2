import { ServiceContainer, serviceContainer } from './ServiceContainer';
import { ServiceIdentifiers } from './ServiceIdentifiers';
import { RenderManager } from '../core/RenderManager';
import { InputManager } from '../core/Input';
import { SceneManager } from '../core/Scene';
import { SpellCaster } from '../systems/magic/SpellCaster';
import { SpellRegistry } from '../systems/magic/SpellRegistry';
import { SpellValidation } from '../systems/magic/SpellValidation';
import { StatusEffectSystem } from '../systems/StatusEffectSystem';
import { GAME_CONFIG } from '../config/GameConstants';
import type { CombatSystem } from '../systems/CombatSystem';
import type { ItemManager } from '../systems/inventory/ItemManager';
import type { LootGenerator } from '../systems/inventory/LootGenerator';
import type { ItemIdentifier } from '../systems/inventory/ItemIdentifier';
import type { EncumbranceCalculator } from '../systems/inventory/EncumbranceCalculator';
import type { ItemDescriptionFormatter } from '../systems/inventory/ItemDescriptionFormatter';

export interface GameServiceDependencies {
  canvas: HTMLCanvasElement;
}

export class GameServices {
  private static instance: GameServices | null = null;
  private container: ServiceContainer;
  private dependencies: GameServiceDependencies;

  constructor(dependencies: GameServiceDependencies) {
    this.container = serviceContainer;
    this.container.clear();
    this.dependencies = dependencies;
    GameServices.instance = this;
    this.registerServices();
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
      () => {
        const { RenderManager } = require('../core/RenderManager');
        return new RenderManager(this.dependencies.canvas);
      },
      { singleton: true }
    );

    // Register InputManager
    this.container.register(ServiceIdentifiers.InputManager, () => {
      const { InputManager } = require('../core/Input');
      return new InputManager();
    }, {
      singleton: true,
    });

    // Register SceneManager
    this.container.register(ServiceIdentifiers.SceneManager, () => {
      const { SceneManager } = require('../core/Scene');
      return new SceneManager();
    }, {
      singleton: true,
    });

    // SaveManager and ErrorHandler are static utilities, handled directly in getters

    // Register DungeonGenerator (non-singleton as it's stateless)
    this.container.register(
      ServiceIdentifiers.DungeonGenerator,
      () => {
        const { DungeonGenerator } = require('../utils/DungeonGenerator');
        return new DungeonGenerator(
          GAME_CONFIG.DUNGEON.DEFAULT_WIDTH,
          GAME_CONFIG.DUNGEON.DEFAULT_HEIGHT
        );
      },
      { singleton: false }
    );

    // Register Magic System Services
    this.container.register(
      ServiceIdentifiers.SpellRegistry,
      () => {
        const { SpellRegistry } = require('../systems/magic/SpellRegistry');
        return SpellRegistry.getInstance();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.SpellValidation,
      () => {
        const { SpellValidation } = require('../systems/magic/SpellValidation');
        return new SpellValidation();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.SpellCaster,
      () => {
        const { SpellCaster } = require('../systems/magic/SpellCaster');
        return SpellCaster.getInstance();
      },
      { singleton: true }
    );

    // Register Combat System
    this.container.register(
      ServiceIdentifiers.CombatSystem,
      () => {
        const { CombatSystem } = require('../systems/CombatSystem');
        return new CombatSystem();
      },
      { singleton: true }
    );

    // Register Status Effect System
    this.container.register(
      ServiceIdentifiers.StatusEffectSystem,
      () => {
        const { StatusEffectSystem } = require('../systems/StatusEffectSystem');
        return StatusEffectSystem.getInstance();
      },
      { singleton: true }
    );

    // Register Inventory System Services
    this.container.register(
      ServiceIdentifiers.ItemManager,
      () => {
        const { ItemManager } = require('../systems/inventory/ItemManager');
        return ItemManager.getInstance();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.LootGenerator,
      () => {
        const { LootGenerator } = require('../systems/inventory/LootGenerator');
        return LootGenerator.getInstance();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.ItemIdentifier,
      () => {
        const { ItemIdentifier } = require('../systems/inventory/ItemIdentifier');
        return ItemIdentifier.getInstance();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.EncumbranceCalculator,
      () => {
        const { EncumbranceCalculator } = require('../systems/inventory/EncumbranceCalculator');
        return EncumbranceCalculator.getInstance();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.ItemDescriptionFormatter,
      () => {
        const { ItemDescriptionFormatter } = require('../systems/inventory/ItemDescriptionFormatter');
        return ItemDescriptionFormatter.getInstance();
      },
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

  public getSaveManager() {
    const { SaveManager } = require('../utils/SaveManager');
    return SaveManager;
  }

  public getDungeonGenerator() {
    return this.container.resolve(ServiceIdentifiers.DungeonGenerator);
  }

  public getErrorHandler() {
    const { ErrorHandler } = require('../utils/ErrorHandler');
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

  public getItemManager(): ItemManager {
    return this.container.resolve(ServiceIdentifiers.ItemManager);
  }

  public getLootGenerator(): LootGenerator {
    return this.container.resolve(ServiceIdentifiers.LootGenerator);
  }

  public getItemIdentifier(): ItemIdentifier {
    return this.container.resolve(ServiceIdentifiers.ItemIdentifier);
  }

  public getEncumbranceCalculator(): EncumbranceCalculator {
    return this.container.resolve(ServiceIdentifiers.EncumbranceCalculator);
  }

  public getItemDescriptionFormatter(): ItemDescriptionFormatter {
    return this.container.resolve(ServiceIdentifiers.ItemDescriptionFormatter);
  }

  public dispose(): void {
    this.container.dispose();
  }
}
