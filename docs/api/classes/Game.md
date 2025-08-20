[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / Game

# Class: Game

Defined in: [core/Game.ts:17](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L17)

## Constructors

### Constructor

> **new Game**(`canvas`): `Game`

Defined in: [core/Game.ts:29](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L29)

#### Parameters

##### canvas

`HTMLCanvasElement`

#### Returns

`Game`

## Properties

### canvas

> `private` **canvas**: `HTMLCanvasElement`

Defined in: [core/Game.ts:18](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L18)

***

### ctx

> `private` **ctx**: `CanvasRenderingContext2D`

Defined in: [core/Game.ts:19](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L19)

***

### services

> `private` **services**: [`GameServices`](GameServices.md)

Defined in: [core/Game.ts:20](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L20)

***

### renderManager

> `private` **renderManager**: [`RenderManager`](RenderManager.md)

Defined in: [core/Game.ts:21](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L21)

***

### sceneManager

> `private` **sceneManager**: [`SceneManager`](SceneManager.md)

Defined in: [core/Game.ts:22](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L22)

***

### inputManager

> `private` **inputManager**: [`InputManager`](InputManager.md)

Defined in: [core/Game.ts:23](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L23)

***

### lastTime

> `private` **lastTime**: `number` = `0`

Defined in: [core/Game.ts:24](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L24)

***

### isRunning

> `private` **isRunning**: `boolean` = `false`

Defined in: [core/Game.ts:25](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L25)

***

### gameState

> `private` **gameState**: [`GameState`](../interfaces/GameState.md)

Defined in: [core/Game.ts:26](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L26)

***

### playtimeStart

> `private` **playtimeStart**: `number`

Defined in: [core/Game.ts:27](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L27)

## Methods

### setupCanvas()

> `private` **setupCanvas**(): `void`

Defined in: [core/Game.ts:48](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L48)

#### Returns

`void`

***

### initializeManagers()

> `private` **initializeManagers**(): `void`

Defined in: [core/Game.ts:53](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L53)

#### Returns

`void`

***

### initializeGameState()

> `private` **initializeGameState**(): `void`

Defined in: [core/Game.ts:61](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L61)

#### Returns

`void`

***

### createNewGameState()

> `private` **createNewGameState**(): `void`

Defined in: [core/Game.ts:89](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L89)

#### Returns

`void`

***

### generateNewDungeon()

> `private` **generateNewDungeon**(): `void`

Defined in: [core/Game.ts:103](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L103)

#### Returns

`void`

***

### reconstructParty()

> `private` **reconstructParty**(`partyData`): [`Party`](Party.md)

Defined in: [core/Game.ts:116](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L116)

#### Parameters

##### partyData

`unknown`

#### Returns

[`Party`](Party.md)

***

### setupScenes()

> `private` **setupScenes**(): `void`

Defined in: [core/Game.ts:180](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L180)

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: [core/Game.ts:196](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L196)

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [core/Game.ts:204](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L204)

#### Returns

`void`

***

### setupAutoSave()

> `private` **setupAutoSave**(): `void`

Defined in: [core/Game.ts:220](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L220)

#### Returns

`void`

***

### gameLoop()

> `private` **gameLoop**(`currentTime`): `void`

Defined in: [core/Game.ts:228](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L228)

#### Parameters

##### currentTime

`number` = `0`

#### Returns

`void`

***

### update()

> `private` **update**(`deltaTime`): `void`

Defined in: [core/Game.ts:240](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L240)

#### Parameters

##### deltaTime

`number`

#### Returns

`void`

***

### render()

> `private` **render**(): `void`

Defined in: [core/Game.ts:245](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L245)

#### Returns

`void`

***

### renderDebugInfo()

> `private` **renderDebugInfo**(): `void`

Defined in: [core/Game.ts:265](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L265)

#### Returns

`void`

***

### saveGame()

> `private` **saveGame**(): `void`

Defined in: [core/Game.ts:289](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L289)

#### Returns

`void`

***

### getCanvas()

> **getCanvas**(): `HTMLCanvasElement`

Defined in: [core/Game.ts:295](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L295)

#### Returns

`HTMLCanvasElement`

***

### getGameState()

> **getGameState**(): [`GameState`](../interfaces/GameState.md)

Defined in: [core/Game.ts:299](https://github.com/the4ofus/drpg2/blob/main/src/core/Game.ts#L299)

#### Returns

[`GameState`](../interfaces/GameState.md)
