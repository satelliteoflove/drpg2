[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / Scene

# Abstract Class: Scene

Defined in: [core/Scene.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L8)

## Extended by

- [`MainMenuScene`](MainMenuScene.md)
- [`NewGameScene`](NewGameScene.md)
- [`CharacterCreationScene`](CharacterCreationScene.md)
- [`DungeonScene`](DungeonScene.md)
- [`CombatScene`](CombatScene.md)

## Constructors

### Constructor

> **new Scene**(`name`): `Scene`

Defined in: [core/Scene.ts:12](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L12)

#### Parameters

##### name

`string`

#### Returns

`Scene`

## Properties

### name

> `protected` **name**: `string`

Defined in: [core/Scene.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L9)

***

### renderManager?

> `protected` `optional` **renderManager**: [`RenderManager`](RenderManager.md)

Defined in: [core/Scene.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L10)

## Methods

### getName()

> **getName**(): `string`

Defined in: [core/Scene.ts:16](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L16)

#### Returns

`string`

***

### setRenderManager()

> **setRenderManager**(`renderManager`): `void`

Defined in: [core/Scene.ts:20](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L20)

#### Parameters

##### renderManager

[`RenderManager`](RenderManager.md)

#### Returns

`void`

***

### enter()

> `abstract` **enter**(): `void`

Defined in: [core/Scene.ts:24](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L24)

#### Returns

`void`

***

### exit()

> `abstract` **exit**(): `void`

Defined in: [core/Scene.ts:25](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L25)

#### Returns

`void`

***

### update()

> `abstract` **update**(`deltaTime`): `void`

Defined in: [core/Scene.ts:26](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L26)

#### Parameters

##### deltaTime

`number`

#### Returns

`void`

***

### render()

> `abstract` **render**(`ctx`): `void`

Defined in: [core/Scene.ts:27](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L27)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderLayered()

> `abstract` **renderLayered**(`renderContext`): `void`

Defined in: [core/Scene.ts:28](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L28)

#### Parameters

##### renderContext

[`SceneRenderContext`](../interfaces/SceneRenderContext.md)

#### Returns

`void`

***

### handleInput()

> `abstract` **handleInput**(`key`): `boolean`

Defined in: [core/Scene.ts:29](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L29)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### hasLayeredRendering()

> **hasLayeredRendering**(): `boolean`

Defined in: [core/Scene.ts:31](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L31)

#### Returns

`boolean`
