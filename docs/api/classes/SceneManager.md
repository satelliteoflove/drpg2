[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / SceneManager

# Class: SceneManager

Defined in: [core/Scene.ts:36](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L36)

## Constructors

### Constructor

> **new SceneManager**(): `SceneManager`

#### Returns

`SceneManager`

## Properties

### scenes

> `private` **scenes**: `Map`\<`string`, [`Scene`](Scene.md)\>

Defined in: [core/Scene.ts:37](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L37)

***

### currentScene

> `private` **currentScene**: `null` \| [`Scene`](Scene.md) = `null`

Defined in: [core/Scene.ts:38](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L38)

***

### nextScene

> `private` **nextScene**: `null` \| `string` = `null`

Defined in: [core/Scene.ts:39](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L39)

***

### renderManager?

> `private` `optional` **renderManager**: [`RenderManager`](RenderManager.md)

Defined in: [core/Scene.ts:40](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L40)

## Methods

### setRenderManager()

> **setRenderManager**(`renderManager`): `void`

Defined in: [core/Scene.ts:42](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L42)

#### Parameters

##### renderManager

[`RenderManager`](RenderManager.md)

#### Returns

`void`

***

### addScene()

> **addScene**(`name`, `scene`): `void`

Defined in: [core/Scene.ts:50](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L50)

#### Parameters

##### name

`string`

##### scene

[`Scene`](Scene.md)

#### Returns

`void`

***

### switchTo()

> **switchTo**(`sceneName`): `void`

Defined in: [core/Scene.ts:58](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L58)

#### Parameters

##### sceneName

`string`

#### Returns

`void`

***

### update()

> **update**(`deltaTime`): `void`

Defined in: [core/Scene.ts:62](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L62)

#### Parameters

##### deltaTime

`number`

#### Returns

`void`

***

### render()

> **render**(`ctx`): `void`

Defined in: [core/Scene.ts:81](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L81)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderLayered()

> **renderLayered**(`ctx`): `void`

Defined in: [core/Scene.ts:87](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L87)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### handleInput()

> **handleInput**(`key`): `boolean`

Defined in: [core/Scene.ts:96](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L96)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### getCurrentScene()

> **getCurrentScene**(): `null` \| [`Scene`](Scene.md)

Defined in: [core/Scene.ts:103](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L103)

#### Returns

`null` \| [`Scene`](Scene.md)
