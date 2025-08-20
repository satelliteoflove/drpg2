[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / DungeonScene

# Class: DungeonScene

Defined in: [scenes/DungeonScene.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L11)

## Extends

- [`Scene`](Scene.md)

## Constructors

### Constructor

> **new DungeonScene**(`gameState`, `sceneManager`, `inputManager`): `DungeonScene`

Defined in: [scenes/DungeonScene.ts:23](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L23)

#### Parameters

##### gameState

[`GameState`](../interfaces/GameState.md)

##### sceneManager

[`SceneManager`](SceneManager.md)

##### inputManager

[`InputManager`](InputManager.md)

#### Returns

`DungeonScene`

#### Overrides

[`Scene`](Scene.md).[`constructor`](Scene.md#constructor)

## Properties

### name

> `protected` **name**: `string`

Defined in: [core/Scene.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L9)

#### Inherited from

[`Scene`](Scene.md).[`name`](Scene.md#name)

***

### renderManager?

> `protected` `optional` **renderManager**: [`RenderManager`](RenderManager.md)

Defined in: [core/Scene.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L10)

#### Inherited from

[`Scene`](Scene.md).[`renderManager`](Scene.md#rendermanager)

***

### gameState

> `private` **gameState**: [`GameState`](../interfaces/GameState.md)

Defined in: [scenes/DungeonScene.ts:12](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L12)

***

### sceneManager

> `private` **sceneManager**: [`SceneManager`](SceneManager.md)

Defined in: [scenes/DungeonScene.ts:13](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L13)

***

### inputManager

> `private` **inputManager**: [`InputManager`](InputManager.md)

Defined in: [scenes/DungeonScene.ts:14](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L14)

***

### dungeonView

> `private` **dungeonView**: [`DungeonView`](DungeonView.md)

Defined in: [scenes/DungeonScene.ts:15](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L15)

***

### statusPanel

> `private` **statusPanel**: [`StatusPanel`](StatusPanel.md)

Defined in: [scenes/DungeonScene.ts:16](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L16)

***

### messageLog

> `private` **messageLog**: [`MessageLog`](MessageLog.md)

Defined in: [scenes/DungeonScene.ts:17](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L17)

***

### dungeonMapView

> `private` **dungeonMapView**: `DungeonMapView`

Defined in: [scenes/DungeonScene.ts:18](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L18)

***

### lastMoveTime

> `private` **lastMoveTime**: `number` = `0`

Defined in: [scenes/DungeonScene.ts:19](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L19)

***

### moveDelay

> `private` **moveDelay**: `number` = `350`

Defined in: [scenes/DungeonScene.ts:20](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L20)

***

### lastTileEventPosition

> `private` **lastTileEventPosition**: `null` \| \{ `x`: `number`; `y`: `number`; `floor`: `number`; \} = `null`

Defined in: [scenes/DungeonScene.ts:21](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L21)

## Methods

### getName()

> **getName**(): `string`

Defined in: [core/Scene.ts:16](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L16)

#### Returns

`string`

#### Inherited from

[`Scene`](Scene.md).[`getName`](Scene.md#getname)

***

### setRenderManager()

> **setRenderManager**(`renderManager`): `void`

Defined in: [core/Scene.ts:20](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L20)

#### Parameters

##### renderManager

[`RenderManager`](RenderManager.md)

#### Returns

`void`

#### Inherited from

[`Scene`](Scene.md).[`setRenderManager`](Scene.md#setrendermanager)

***

### hasLayeredRendering()

> **hasLayeredRendering**(): `boolean`

Defined in: [core/Scene.ts:31](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L31)

#### Returns

`boolean`

#### Inherited from

[`Scene`](Scene.md).[`hasLayeredRendering`](Scene.md#haslayeredrendering)

***

### enter()

> **enter**(): `void`

Defined in: [scenes/DungeonScene.ts:30](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L30)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`enter`](Scene.md#enter)

***

### exit()

> **exit**(): `void`

Defined in: [scenes/DungeonScene.ts:35](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L35)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`exit`](Scene.md#exit)

***

### update()

> **update**(`_deltaTime`): `void`

Defined in: [scenes/DungeonScene.ts:37](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L37)

#### Parameters

##### \_deltaTime

`number`

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`update`](Scene.md#update)

***

### render()

> **render**(`ctx`): `void`

Defined in: [scenes/DungeonScene.ts:43](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L43)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`render`](Scene.md#render)

***

### renderLayered()

> **renderLayered**(`renderContext`): `void`

Defined in: [scenes/DungeonScene.ts:74](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L74)

#### Parameters

##### renderContext

[`SceneRenderContext`](../interfaces/SceneRenderContext.md)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`renderLayered`](Scene.md#renderlayered)

***

### initializeUI()

> `private` **initializeUI**(`canvas`): `void`

Defined in: [scenes/DungeonScene.ts:113](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L113)

#### Parameters

##### canvas

`HTMLCanvasElement`

#### Returns

`void`

***

### handleMovement()

> `private` **handleMovement**(): `void`

Defined in: [scenes/DungeonScene.ts:126](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L126)

#### Returns

`void`

***

### canMoveForward()

> `private` **canMoveForward**(): `boolean`

Defined in: [scenes/DungeonScene.ts:176](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L176)

#### Returns

`boolean`

***

### canMoveBackward()

> `private` **canMoveBackward**(): `boolean`

Defined in: [scenes/DungeonScene.ts:192](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L192)

#### Returns

`boolean`

***

### getDirectionVector()

> `private` **getDirectionVector**(): \[`number`, `number`\]

Defined in: [scenes/DungeonScene.ts:208](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L208)

#### Returns

\[`number`, `number`\]

***

### markCurrentTileDiscovered()

> `private` **markCurrentTileDiscovered**(): `void`

Defined in: [scenes/DungeonScene.ts:223](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L223)

#### Returns

`void`

***

### checkRandomEncounter()

> `private` **checkRandomEncounter**(): `void`

Defined in: [scenes/DungeonScene.ts:233](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L233)

#### Returns

`void`

***

### checkTileEvents()

> `private` **checkTileEvents**(): `void`

Defined in: [scenes/DungeonScene.ts:256](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L256)

#### Returns

`void`

***

### handleTrap()

> `private` **handleTrap**(`_tile`): `void`

Defined in: [scenes/DungeonScene.ts:301](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L301)

#### Parameters

##### \_tile

[`DungeonTile`](../interfaces/DungeonTile.md)

#### Returns

`void`

***

### handleEvent()

> `private` **handleEvent**(`_tile`): `void`

Defined in: [scenes/DungeonScene.ts:322](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L322)

#### Parameters

##### \_tile

[`DungeonTile`](../interfaces/DungeonTile.md)

#### Returns

`void`

***

### handleInput()

> **handleInput**(`key`): `boolean`

Defined in: [scenes/DungeonScene.ts:364](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L364)

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Overrides

[`Scene`](Scene.md).[`handleInput`](Scene.md#handleinput)

***

### toggleCombat()

> `private` **toggleCombat**(): `void`

Defined in: [scenes/DungeonScene.ts:403](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L403)

#### Returns

`void`

***

### toggleMap()

> `private` **toggleMap**(): `void`

Defined in: [scenes/DungeonScene.ts:413](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L413)

#### Returns

`void`

***

### handleInteraction()

> `private` **handleInteraction**(): `void`

Defined in: [scenes/DungeonScene.ts:423](https://github.com/the4ofus/drpg2/blob/main/src/scenes/DungeonScene.ts#L423)

#### Returns

`void`
