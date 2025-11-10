import { createServiceIdentifier } from './ServiceContainer';
import { RenderManager } from '../core/RenderManager';
import { InputManager } from '../core/Input';
import { SceneManager } from '../core/Scene';
import { SaveManager } from '../utils/SaveManager';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { ErrorHandler } from '../utils/ErrorHandler';
import { SpellValidation } from '../systems/magic/SpellValidation';

export const ServiceIdentifiers = {
  RenderManager: createServiceIdentifier('RenderManager', RenderManager),
  InputManager: createServiceIdentifier('InputManager', InputManager),
  SceneManager: createServiceIdentifier('SceneManager', SceneManager),
  SaveManager: createServiceIdentifier('SaveManager', SaveManager),
  DungeonGenerator: createServiceIdentifier('DungeonGenerator', DungeonGenerator),
  ErrorHandler: createServiceIdentifier('ErrorHandler', ErrorHandler),
  SpellRegistry: Symbol('SpellRegistry') as any,
  SpellValidation: createServiceIdentifier('SpellValidation', SpellValidation),
  SpellCaster: Symbol('SpellCaster') as any,
  CombatSystem: Symbol('CombatSystem') as any,
  StatusEffectSystem: Symbol('StatusEffectSystem') as any,
  ItemManager: Symbol('ItemManager') as any,
  LootGenerator: Symbol('LootGenerator') as any,
  ItemIdentifier: Symbol('ItemIdentifier') as any,
  EncumbranceCalculator: Symbol('EncumbranceCalculator') as any,
  ItemDescriptionFormatter: Symbol('ItemDescriptionFormatter') as any,
} as const;
