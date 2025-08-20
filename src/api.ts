/**
 * DRPG2 - Dungeon Crawler Game Engine API
 * 
 * A TypeScript-based dungeon crawler game engine inspired by classic Wizardry-style RPGs.
 * Features a modular architecture with ECS patterns, canvas rendering, and comprehensive
 * game systems for character management, combat, and dungeon exploration.
 * 
 * @packageDocumentation
 */

// Core Engine
export { Game } from './core/Game';
export { Scene, SceneManager, SceneRenderContext } from './core/Scene';
export { InputManager } from './core/Input';
export { RenderingOptimizer } from './core/RenderingOptimizer';
export { RenderManager } from './core/RenderManager';

// Services
export * from './services';

// Entities
export { Character } from './entities/Character';
export { Party } from './entities/Party';

// Systems
export { CombatSystem } from './systems/CombatSystem';
export { InventorySystem } from './systems/InventorySystem';

// Scenes
export { MainMenuScene } from './scenes/MainMenuScene';
export { NewGameScene } from './scenes/NewGameScene';
export { CharacterCreationScene } from './scenes/CharacterCreationScene';
export { DungeonScene } from './scenes/DungeonScene';
export { CombatScene } from './scenes/CombatScene';

// UI Components
export { DungeonView } from './ui/DungeonView';
export { StatusPanel } from './ui/StatusPanel';
export { MessageLog } from './ui/MessageLog';

// Utilities
export { DungeonGenerator } from './utils/DungeonGenerator';
export { SaveManager } from './utils/SaveManager';
export { ErrorHandler, ErrorSeverity } from './utils/ErrorHandler';
export { TypeValidation } from './utils/TypeValidation';

// Types
export * from './types/GameTypes';

// Configuration
export { GAME_CONFIG } from './config/GameConstants';