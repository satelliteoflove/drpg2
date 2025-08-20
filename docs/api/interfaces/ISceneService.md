[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / ISceneService

# Interface: ISceneService

Defined in: services/interfaces/ISceneService.ts:3

## Methods

### getSceneManager()

> **getSceneManager**(): [`SceneManager`](../classes/SceneManager.md)

Defined in: services/interfaces/ISceneService.ts:4

#### Returns

[`SceneManager`](../classes/SceneManager.md)

***

### addScene()

> **addScene**(`name`, `scene`): `void`

Defined in: services/interfaces/ISceneService.ts:5

#### Parameters

##### name

`string`

##### scene

[`Scene`](../classes/Scene.md)

#### Returns

`void`

***

### switchTo()

> **switchTo**(`sceneName`): `void`

Defined in: services/interfaces/ISceneService.ts:6

#### Parameters

##### sceneName

`string`

#### Returns

`void`

***

### getCurrentScene()

> **getCurrentScene**(): `null` \| [`Scene`](../classes/Scene.md)

Defined in: services/interfaces/ISceneService.ts:7

#### Returns

`null` \| [`Scene`](../classes/Scene.md)

***

### update()

> **update**(`deltaTime`): `void`

Defined in: services/interfaces/ISceneService.ts:8

#### Parameters

##### deltaTime

`number`

#### Returns

`void`

***

### render()

> **render**(`ctx`): `void`

Defined in: services/interfaces/ISceneService.ts:9

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderLayered()

> **renderLayered**(`ctx`): `void`

Defined in: services/interfaces/ISceneService.ts:10

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### handleInput()

> **handleInput**(`key`): `boolean`

Defined in: services/interfaces/ISceneService.ts:11

#### Parameters

##### key

`string`

#### Returns

`boolean`
