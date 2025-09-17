import { createServiceIdentifier } from './ServiceContainer';
import { RenderManager } from '../core/RenderManager';
import { InputManager } from '../core/Input';
import { SceneManager } from '../core/Scene';
import { SaveManager } from '../utils/SaveManager';
import { DungeonGenerator } from '../utils/DungeonGenerator';
import { ErrorHandler } from '../utils/ErrorHandler';

export const ServiceIdentifiers = {
  RenderManager: createServiceIdentifier('RenderManager', RenderManager),
  InputManager: createServiceIdentifier('InputManager', InputManager),
  SceneManager: createServiceIdentifier('SceneManager', SceneManager),
  SaveManager: createServiceIdentifier('SaveManager', SaveManager),
  DungeonGenerator: createServiceIdentifier('DungeonGenerator', DungeonGenerator),
  ErrorHandler: createServiceIdentifier('ErrorHandler', ErrorHandler),
} as const;
