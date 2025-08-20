[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / NewGameScene

# Class: NewGameScene

Defined in: [scenes/NewGameScene.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L6)

## Extends

- [`Scene`](Scene.md)

## Constructors

### Constructor

> **new NewGameScene**(`gameState`, `sceneManager`): `NewGameScene`

Defined in: [scenes/NewGameScene.ts:12](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L12)

#### Parameters

##### gameState

[`GameState`](../interfaces/GameState.md)

##### sceneManager

[`SceneManager`](SceneManager.md)

#### Returns

`NewGameScene`

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

Defined in: [scenes/NewGameScene.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L7)

***

### sceneManager

> `private` **sceneManager**: [`SceneManager`](SceneManager.md)

Defined in: [scenes/NewGameScene.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L8)

***

### selectedOption

> `private` **selectedOption**: `number` = `0`

Defined in: [scenes/NewGameScene.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L9)

***

### menuOptions

> `private` **menuOptions**: `string`[]

Defined in: [scenes/NewGameScene.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L10)

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

Defined in: [scenes/NewGameScene.ts:18](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L18)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`enter`](Scene.md#enter)

***

### exit()

> **exit**(): `void`

Defined in: [scenes/NewGameScene.ts:22](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L22)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`exit`](Scene.md#exit)

***

### update()

> **update**(`_deltaTime`): `void`

Defined in: [scenes/NewGameScene.ts:24](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L24)

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

Defined in: [scenes/NewGameScene.ts:26](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L26)

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

Defined in: [scenes/NewGameScene.ts:74](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L74)

#### Parameters

##### renderContext

[`SceneRenderContext`](../interfaces/SceneRenderContext.md)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`renderLayered`](Scene.md#renderlayered)

***

### handleInput()

> **handleInput**(`key`): `boolean`

Defined in: [scenes/NewGameScene.ts:128](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L128)

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Overrides

[`Scene`](Scene.md).[`handleInput`](Scene.md#handleinput)

***

### selectCurrentOption()

> `private` **selectCurrentOption**(): `void`

Defined in: [scenes/NewGameScene.ts:152](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L152)

#### Returns

`void`

***

### autoGenerateParty()

> `private` **autoGenerateParty**(): `void`

Defined in: [scenes/NewGameScene.ts:161](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L161)

#### Returns

`void`

***

### clearGameStateForNewGame()

> `private` **clearGameStateForNewGame**(): `void`

Defined in: [scenes/NewGameScene.ts:210](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L210)

#### Returns

`void`

***

### generateNewDungeon()

> `private` **generateNewDungeon**(): `void`

Defined in: [scenes/NewGameScene.ts:224](https://github.com/the4ofus/drpg2/blob/main/src/scenes/NewGameScene.ts#L224)

#### Returns

`void`
