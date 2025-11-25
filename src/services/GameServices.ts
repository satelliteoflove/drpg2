import { ServiceContainer, serviceContainer } from './ServiceContainer';
import { ServiceIdentifiers } from './ServiceIdentifiers';
import { RenderManager } from '../core/RenderManager';
import { InputManager } from '../core/Input';
import { SceneManager } from '../core/Scene';
import { SpellCaster } from '../systems/magic/SpellCaster';
import { SpellRegistry } from '../systems/magic/SpellRegistry';
import { SpellValidation } from '../systems/magic/SpellValidation';
import { StatusEffectSystem } from '../systems/StatusEffectSystem';
import { AudioManager } from './audio/AudioManager';
import { GAME_CONFIG } from '../config/GameConstants';
import type { CombatSystem } from '../systems/CombatSystem';
import type { ModifierSystem } from '../systems/ModifierSystem';
import type { EquipmentModifierManager } from '../systems/EquipmentModifierManager';
import type { SpellEffectRegistry } from '../systems/magic/SpellEffectRegistry';
import type { SpellLearning } from '../systems/magic/SpellLearning';
import type { ItemManager } from '../systems/inventory/ItemManager';
import type { LootGenerator } from '../systems/inventory/LootGenerator';
import type { ItemIdentifier } from '../systems/inventory/ItemIdentifier';
import type { EncumbranceCalculator } from '../systems/inventory/EncumbranceCalculator';
import type { ItemDescriptionFormatter } from '../systems/inventory/ItemDescriptionFormatter';
import type { CharacterPersonalityService } from './banter/CharacterPersonalityService';
import type { BanterEventTracker } from '../types/BanterTypes';

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

    // Register AudioManager
    this.container.register(
      ServiceIdentifiers.AudioManager,
      () => {
        const { AudioManager } = require('./audio/AudioManager');
        return new AudioManager();
      },
      { singleton: true }
    );

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

    // Register Modifier System
    this.container.register(
      ServiceIdentifiers.ModifierSystem,
      () => {
        const { ModifierSystem } = require('../systems/ModifierSystem');
        return new ModifierSystem();
      },
      { singleton: true }
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
      ServiceIdentifiers.SpellEffectRegistry,
      () => {
        const { SpellEffectRegistry } = require('../systems/magic/SpellEffectRegistry');
        return new SpellEffectRegistry();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.SpellLearning,
      () => {
        const { SpellLearning } = require('../systems/magic/SpellLearning');
        const spellRegistry = this.container.resolve(ServiceIdentifiers.SpellRegistry);
        return new SpellLearning(spellRegistry);
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
        const spellRegistry = this.container.resolve(ServiceIdentifiers.SpellRegistry);
        const spellEffectRegistry = this.container.resolve(ServiceIdentifiers.SpellEffectRegistry);
        const spellValidation = this.container.resolve(ServiceIdentifiers.SpellValidation);
        return new SpellCaster(spellRegistry, spellEffectRegistry, spellValidation);
      },
      { singleton: true }
    );

    // Register Equipment Modifier Manager (no dependencies)
    this.container.register(
      ServiceIdentifiers.EquipmentModifierManager,
      () => {
        const { EquipmentModifierManager } = require('../systems/EquipmentModifierManager');
        return EquipmentModifierManager.getInstance();
      },
      { singleton: true }
    );

    // Register Status Effect System (depends on EquipmentModifierManager)
    this.container.register(
      ServiceIdentifiers.StatusEffectSystem,
      () => {
        const { StatusEffectSystem } = require('../systems/StatusEffectSystem');
        const equipmentManager = this.container.resolve(ServiceIdentifiers.EquipmentModifierManager);
        return new StatusEffectSystem(equipmentManager);
      },
      { singleton: true }
    );

    // Register Combat System (depends on SpellCaster, StatusEffectSystem, ModifierSystem, CombatActionRegistry)
    this.container.register(
      ServiceIdentifiers.CombatSystem,
      () => {
        const { CombatSystem } = require('../systems/CombatSystem');
        const { CombatActionRegistry } = require('../systems/combat/actions/CombatActionRegistry');
        const spellCaster = this.container.resolve(ServiceIdentifiers.SpellCaster);
        const statusEffectSystem = this.container.resolve(ServiceIdentifiers.StatusEffectSystem);
        const modifierSystem = this.container.resolve(ServiceIdentifiers.ModifierSystem);
        const actionRegistry = new CombatActionRegistry();
        return new CombatSystem(spellCaster, statusEffectSystem, modifierSystem, actionRegistry);
      },
      { singleton: true }
    );

    // Register Inventory System Services
    this.container.register(
      ServiceIdentifiers.ItemManager,
      () => {
        const { ItemManager } = require('../systems/inventory/ItemManager');
        const equipmentManager = this.container.resolve(ServiceIdentifiers.EquipmentModifierManager);
        return new ItemManager(equipmentManager);
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

    this.container.register(
      ServiceIdentifiers.CharacterPersonalityService,
      () => {
        const { CharacterPersonalityService } = require('./banter/CharacterPersonalityService');
        return new CharacterPersonalityService();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.BanterEventTracker,
      () => {
        const { BanterEventTracker } = require('./banter/BanterEventTracker');
        return new BanterEventTracker();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.BanterMetrics,
      () => {
        const { BanterMetrics } = require('./banter/BanterMetrics');
        return new BanterMetrics();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.TriggerDetector,
      () => {
        const { TriggerDetector } = require('./banter/TriggerDetector');
        const eventTracker = this.container.resolve(ServiceIdentifiers.BanterEventTracker);
        return new TriggerDetector(eventTracker);
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.ContextBuilder,
      () => {
        const { ContextBuilder } = require('./banter/ContextBuilder');
        const eventTracker = this.container.resolve(ServiceIdentifiers.BanterEventTracker);
        return new ContextBuilder(eventTracker);
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.BanterValidator,
      () => {
        const { BanterValidator } = require('./banter/BanterValidator');
        return new BanterValidator();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.BanterPresenter,
      () => {
        const { BanterPresenter } = require('./banter/BanterPresenter');
        return new BanterPresenter();
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.BanterGenerator,
      () => {
        const { BanterGenerator } = require('./banter/BanterGenerator');
        const metrics = this.container.resolve(ServiceIdentifiers.BanterMetrics);
        return new BanterGenerator(metrics);
      },
      { singleton: true }
    );

    this.container.register(
      ServiceIdentifiers.BanterOrchestrator,
      () => {
        const { BanterOrchestrator } = require('./banter/BanterOrchestrator');
        const triggerDetector = this.container.resolve(ServiceIdentifiers.TriggerDetector);
        const generator = this.container.resolve(ServiceIdentifiers.BanterGenerator);
        const validator = this.container.resolve(ServiceIdentifiers.BanterValidator);
        const presenter = this.container.resolve(ServiceIdentifiers.BanterPresenter);
        const eventTracker = this.container.resolve(ServiceIdentifiers.BanterEventTracker);
        const metrics = this.container.resolve(ServiceIdentifiers.BanterMetrics);
        const contextBuilder = this.container.resolve(ServiceIdentifiers.ContextBuilder);
        return new BanterOrchestrator(
          triggerDetector,
          generator,
          validator,
          presenter,
          eventTracker,
          metrics,
          contextBuilder
        );
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

  public getAudioManager(): AudioManager {
    return this.container.resolve(ServiceIdentifiers.AudioManager);
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

  public getModifierSystem(): ModifierSystem {
    return this.container.resolve(ServiceIdentifiers.ModifierSystem);
  }

  public getSpellRegistry(): SpellRegistry {
    return this.container.resolve(ServiceIdentifiers.SpellRegistry);
  }

  public getSpellEffectRegistry(): SpellEffectRegistry {
    return this.container.resolve(ServiceIdentifiers.SpellEffectRegistry);
  }

  public getSpellLearning(): SpellLearning {
    return this.container.resolve(ServiceIdentifiers.SpellLearning);
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

  public static getBanterOrchestrator(): any {
    try {
      const instance = GameServices.getInstance();
      return instance.getBanterOrchestratorInstance();
    } catch (error) {
      return null;
    }
  }

  public getEquipmentModifierManager(): EquipmentModifierManager {
    return this.container.resolve(ServiceIdentifiers.EquipmentModifierManager);
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

  public getCharacterPersonalityService(): CharacterPersonalityService {
    return this.container.resolve(ServiceIdentifiers.CharacterPersonalityService);
  }

  public getBanterEventTracker(): BanterEventTracker {
    return this.container.resolve(ServiceIdentifiers.BanterEventTracker);
  }

  public getBanterMetrics(): any {
    return this.container.resolve(ServiceIdentifiers.BanterMetrics);
  }

  public getTriggerDetector(): any {
    return this.container.resolve(ServiceIdentifiers.TriggerDetector);
  }

  public getContextBuilder(): any {
    return this.container.resolve(ServiceIdentifiers.ContextBuilder);
  }

  public getBanterValidator(): any {
    return this.container.resolve(ServiceIdentifiers.BanterValidator);
  }

  public getBanterPresenter(): any {
    return this.container.resolve(ServiceIdentifiers.BanterPresenter);
  }

  public getBanterGenerator(): any {
    return this.container.resolve(ServiceIdentifiers.BanterGenerator);
  }

  public getBanterOrchestratorInstance(): any {
    return this.container.resolve(ServiceIdentifiers.BanterOrchestrator);
  }

  public dispose(): void {
    this.container.dispose();
  }
}
