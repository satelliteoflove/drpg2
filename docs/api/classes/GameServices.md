[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / GameServices

# Class: GameServices

Defined in: services/GameServices.ts:14

## Constructors

### Constructor

> **new GameServices**(`dependencies`): `GameServices`

Defined in: services/GameServices.ts:18

#### Parameters

##### dependencies

`GameServiceDependencies`

#### Returns

`GameServices`

## Properties

### container

> `private` **container**: [`ServiceContainer`](ServiceContainer.md)

Defined in: services/GameServices.ts:15

***

### dependencies

> `private` **dependencies**: `GameServiceDependencies`

Defined in: services/GameServices.ts:16

## Methods

### registerServices()

> `private` **registerServices**(): `void`

Defined in: services/GameServices.ts:24

#### Returns

`void`

***

### getRenderManager()

> **getRenderManager**(): [`RenderManager`](RenderManager.md)

Defined in: services/GameServices.ts:56

#### Returns

[`RenderManager`](RenderManager.md)

***

### getInputManager()

> **getInputManager**(): [`InputManager`](InputManager.md)

Defined in: services/GameServices.ts:60

#### Returns

[`InputManager`](InputManager.md)

***

### getSceneManager()

> **getSceneManager**(): [`SceneManager`](SceneManager.md)

Defined in: services/GameServices.ts:64

#### Returns

[`SceneManager`](SceneManager.md)

***

### getSaveManager()

> **getSaveManager**(): *typeof* [`SaveManager`](SaveManager.md)

Defined in: services/GameServices.ts:68

#### Returns

*typeof* [`SaveManager`](SaveManager.md)

***

### getDungeonGenerator()

> **getDungeonGenerator**(): [`DungeonGenerator`](DungeonGenerator.md)

Defined in: services/GameServices.ts:72

#### Returns

[`DungeonGenerator`](DungeonGenerator.md)

***

### getErrorHandler()

> **getErrorHandler**(): *typeof* [`ErrorHandler`](ErrorHandler.md)

Defined in: services/GameServices.ts:76

#### Returns

*typeof* [`ErrorHandler`](ErrorHandler.md)

***

### dispose()

> **dispose**(): `void`

Defined in: services/GameServices.ts:80

#### Returns

`void`
