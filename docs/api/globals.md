[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](README.md)

***

# DRPG2 - Dungeon Crawler Game Engine v1.0.0

DRPG2 - Dungeon Crawler Game Engine API

A TypeScript-based dungeon crawler game engine inspired by classic Wizardry-style RPGs.
Features a modular architecture with ECS patterns, canvas rendering, and comprehensive
game systems for character management, combat, and dungeon exploration.

## Enumerations

- [ErrorSeverity](enumerations/ErrorSeverity.md)

## Classes

- [Game](classes/Game.md)
- [InputManager](classes/InputManager.md)
- [RenderManager](classes/RenderManager.md)
- [RenderingOptimizer](classes/RenderingOptimizer.md)
- [Scene](classes/Scene.md)
- [SceneManager](classes/SceneManager.md)
- [Character](classes/Character.md)
- [Party](classes/Party.md)
- [CharacterCreationScene](classes/CharacterCreationScene.md)
- [CombatScene](classes/CombatScene.md)
- [DungeonScene](classes/DungeonScene.md)
- [MainMenuScene](classes/MainMenuScene.md)
- [NewGameScene](classes/NewGameScene.md)
- [GameServices](classes/GameServices.md)
- [ServiceContainer](classes/ServiceContainer.md)
- [ServiceRegistry](classes/ServiceRegistry.md)
- [CombatSystem](classes/CombatSystem.md)
- [InventorySystem](classes/InventorySystem.md)
- [DungeonView](classes/DungeonView.md)
- [MessageLog](classes/MessageLog.md)
- [StatusPanel](classes/StatusPanel.md)
- [DungeonGenerator](classes/DungeonGenerator.md)
- [ErrorHandler](classes/ErrorHandler.md)
- [SaveManager](classes/SaveManager.md)
- [TypeValidation](classes/TypeValidation.md)

## Interfaces

- [SceneRenderContext](interfaces/SceneRenderContext.md)
- [ISaveService](interfaces/ISaveService.md)
- [IDungeonService](interfaces/IDungeonService.md)
- [IValidationService](interfaces/IValidationService.md)
- [IInputService](interfaces/IInputService.md)
- [IMovementInput](interfaces/IMovementInput.md)
- [IRenderService](interfaces/IRenderService.md)
- [IRenderStats](interfaces/IRenderStats.md)
- [ISceneService](interfaces/ISceneService.md)
- [CharacterStats](interfaces/CharacterStats.md)
- [Equipment](interfaces/Equipment.md)
- [Item](interfaces/Item.md)
- [ItemEffect](interfaces/ItemEffect.md)
- [Spell](interfaces/Spell.md)
- [SpellEffect](interfaces/SpellEffect.md)
- [Monster](interfaces/Monster.md)
- [Attack](interfaces/Attack.md)
- [ItemDrop](interfaces/ItemDrop.md)
- [DungeonTile](interfaces/DungeonTile.md)
- [DungeonLevel](interfaces/DungeonLevel.md)
- [EncounterZone](interfaces/EncounterZone.md)
- [DungeonEvent](interfaces/DungeonEvent.md)
- [IParty](interfaces/IParty.md)
- [GameState](interfaces/GameState.md)
- [Encounter](interfaces/Encounter.md)

## Type Aliases

- [CharacterClass](type-aliases/CharacterClass.md)
- [CharacterRace](type-aliases/CharacterRace.md)
- [CharacterAlignment](type-aliases/CharacterAlignment.md)
- [CharacterStatus](type-aliases/CharacterStatus.md)
- [DungeonEventData](type-aliases/DungeonEventData.md)
- [Formation](type-aliases/Formation.md)
- [Direction](type-aliases/Direction.md)

## Variables

- [GAME\_CONFIG](variables/GAME_CONFIG.md)
- [serviceContainer](variables/serviceContainer.md)
- [ServiceIdentifiers](variables/ServiceIdentifiers.md)
- [serviceRegistry](variables/serviceRegistry.md)

## Functions

- [createServiceIdentifier](functions/createServiceIdentifier.md)
