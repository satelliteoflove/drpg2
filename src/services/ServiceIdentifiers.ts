import { createServiceIdentifier } from './ServiceContainer';
import { RenderManager } from '../core/RenderManager';
import { InputManager } from '../core/Input';
import { SceneManager } from '../core/Scene';
import { SaveManager } from '../utils/SaveManager';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { ErrorHandler } from '../utils/ErrorHandler';
import { SpellValidation } from '../systems/magic/SpellValidation';

const createSimpleIdentifier = (name: string) => ({ name, type: null as any }) as any;

export const ServiceIdentifiers = {
  RenderManager: createServiceIdentifier('RenderManager', RenderManager),
  InputManager: createServiceIdentifier('InputManager', InputManager),
  SceneManager: createServiceIdentifier('SceneManager', SceneManager),
  SaveManager: createServiceIdentifier('SaveManager', SaveManager),
  DungeonGenerator: createServiceIdentifier('DungeonGenerator', DungeonGenerator),
  ErrorHandler: createServiceIdentifier('ErrorHandler', ErrorHandler),
  SpellRegistry: createSimpleIdentifier('SpellRegistry'),
  SpellValidation: createServiceIdentifier('SpellValidation', SpellValidation),
  SpellCaster: createSimpleIdentifier('SpellCaster'),
  CombatSystem: createSimpleIdentifier('CombatSystem'),
  StatusEffectSystem: createSimpleIdentifier('StatusEffectSystem'),
  EquipmentModifierManager: createSimpleIdentifier('EquipmentModifierManager'),
  ItemManager: createSimpleIdentifier('ItemManager'),
  LootGenerator: createSimpleIdentifier('LootGenerator'),
  ItemIdentifier: createSimpleIdentifier('ItemIdentifier'),
  EncumbranceCalculator: createSimpleIdentifier('EncumbranceCalculator'),
  ItemDescriptionFormatter: createSimpleIdentifier('ItemDescriptionFormatter'),
} as const;
