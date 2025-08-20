[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / MainMenuScene

# Class: MainMenuScene

Defined in: [scenes/MainMenuScene.ts:5](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L5)

## Extends

- [`Scene`](Scene.md)

## Constructors

### Constructor

> **new MainMenuScene**(`_gameState`, `sceneManager`): `MainMenuScene`

Defined in: [scenes/MainMenuScene.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L10)

#### Parameters

##### \_gameState

[`GameState`](../interfaces/GameState.md)

##### sceneManager

[`SceneManager`](SceneManager.md)

#### Returns

`MainMenuScene`

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

### sceneManager

> `private` **sceneManager**: [`SceneManager`](SceneManager.md)

Defined in: [scenes/MainMenuScene.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L6)

***

### selectedOption

> `private` **selectedOption**: `number` = `0`

Defined in: [scenes/MainMenuScene.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L7)

***

### menuOptions

> `private` **menuOptions**: `string`[] = `[]`

Defined in: [scenes/MainMenuScene.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L8)

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

Defined in: [scenes/MainMenuScene.ts:16](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L16)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`enter`](Scene.md#enter)

***

### exit()

> **exit**(): `void`

Defined in: [scenes/MainMenuScene.ts:21](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L21)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`exit`](Scene.md#exit)

***

### update()

> **update**(`_deltaTime`): `void`

Defined in: [scenes/MainMenuScene.ts:23](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L23)

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

Defined in: [scenes/MainMenuScene.ts:25](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L25)

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

Defined in: [scenes/MainMenuScene.ts:34](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L34)

#### Parameters

##### renderContext

[`SceneRenderContext`](../interfaces/SceneRenderContext.md)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`renderLayered`](Scene.md#renderlayered)

***

### renderTitle()

> `private` **renderTitle**(`ctx`): `void`

Defined in: [scenes/MainMenuScene.ts:49](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L49)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderMenu()

> `private` **renderMenu**(`ctx`): `void`

Defined in: [scenes/MainMenuScene.ts:60](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L60)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderFooter()

> `private` **renderFooter**(`ctx`): `void`

Defined in: [scenes/MainMenuScene.ts:80](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L80)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### updateMenuOptions()

> `private` **updateMenuOptions**(): `void`

Defined in: [scenes/MainMenuScene.ts:92](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L92)

#### Returns

`void`

***

### handleInput()

> **handleInput**(`key`): `boolean`

Defined in: [scenes/MainMenuScene.ts:102](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L102)

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

Defined in: [scenes/MainMenuScene.ts:128](https://github.com/the4ofus/drpg2/blob/main/src/scenes/MainMenuScene.ts#L128)

#### Returns

`void`
