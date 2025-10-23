import { createServiceIdentifier } from './ServiceContainer';
import { RenderManager } from '../core/RenderManager';
import { InputManager } from '../core/Input';
import { SceneManager } from '../core/Scene';
import { SaveManager } from '../utils/SaveManager';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { ErrorHandler } from '../utils/ErrorHandler';
import { SpellValidation } from '../systems/magic/SpellValidation';
import { CombatSystem } from '../systems/CombatSystem';
import { StatusEffectSystem } from '../systems/StatusEffectSystem';

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
  CombatSystem: createServiceIdentifier('CombatSystem', CombatSystem),
  StatusEffectSystem: createServiceIdentifier('StatusEffectSystem', StatusEffectSystem),
} as const;
