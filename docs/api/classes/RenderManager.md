[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / RenderManager

# Class: RenderManager

Defined in: core/RenderManager.ts:17

## Constructors

### Constructor

> **new RenderManager**(`canvas`): `RenderManager`

Defined in: core/RenderManager.ts:38

#### Parameters

##### canvas

`HTMLCanvasElement`

#### Returns

`RenderManager`

## Properties

### optimizer

> `private` **optimizer**: [`RenderingOptimizer`](RenderingOptimizer.md)

Defined in: core/RenderManager.ts:18

***

### spriteCache

> `private` **spriteCache**: `SpriteCache`

Defined in: core/RenderManager.ts:19

***

### spatialPartition

> `private` **spatialPartition**: `SpatialPartition`

Defined in: core/RenderManager.ts:20

***

### stats

> `private` **stats**: `RenderStats`

Defined in: core/RenderManager.ts:21

***

### frameStartTime

> `private` **frameStartTime**: `number` = `0`

Defined in: core/RenderManager.ts:22

***

### drawnObjects

> `private` **drawnObjects**: `number` = `0`

Defined in: core/RenderManager.ts:23

***

### culledObjects

> `private` **culledObjects**: `number` = `0`

Defined in: core/RenderManager.ts:24

***

### cacheHits

> `private` **cacheHits**: `number` = `0`

Defined in: core/RenderManager.ts:25

***

### cacheMisses

> `private` **cacheMisses**: `number` = `0`

Defined in: core/RenderManager.ts:26

***

### LAYERS

> `private` `readonly` `static` **LAYERS**: `object`

Defined in: core/RenderManager.ts:29

#### BACKGROUND

> **BACKGROUND**: `string` = `'background'`

#### DUNGEON

> **DUNGEON**: `string` = `'dungeon'`

#### ENTITIES

> **ENTITIES**: `string` = `'entities'`

#### EFFECTS

> **EFFECTS**: `string` = `'effects'`

#### UI

> **UI**: `string` = `'ui'`

#### DEBUG

> **DEBUG**: `string` = `'debug'`

***

### canvas

> `private` **canvas**: `HTMLCanvasElement`

Defined in: core/RenderManager.ts:38

## Methods

### setupLayers()

> `private` **setupLayers**(): `void`

Defined in: core/RenderManager.ts:61

#### Returns

`void`

***

### startFrame()

> **startFrame**(`currentTime`): `boolean`

Defined in: core/RenderManager.ts:71

#### Parameters

##### currentTime

`number`

#### Returns

`boolean`

***

### endFrame()

> **endFrame**(): `void`

Defined in: core/RenderManager.ts:84

#### Returns

`void`

***

### resetFrameStats()

> `private` **resetFrameStats**(): `void`

Defined in: core/RenderManager.ts:92

#### Returns

`void`

***

### updateStats()

> `private` **updateStats**(`frameTime`): `void`

Defined in: core/RenderManager.ts:99

#### Parameters

##### frameTime

`number`

#### Returns

`void`

***

### renderScene()

> **renderScene**(`scene`): `void`

Defined in: core/RenderManager.ts:112

#### Parameters

##### scene

[`Scene`](Scene.md)

#### Returns

`void`

***

### clearDynamicLayers()

> `private` **clearDynamicLayers**(): `void`

Defined in: core/RenderManager.ts:132

#### Returns

`void`

***

### renderBackground()

> **renderBackground**(`renderFn`): `void`

Defined in: core/RenderManager.ts:140

#### Parameters

##### renderFn

(`ctx`) => `void`

#### Returns

`void`

***

### renderDungeon()

> **renderDungeon**(`renderFn`): `void`

Defined in: core/RenderManager.ts:148

#### Parameters

##### renderFn

(`ctx`) => `void`

#### Returns

`void`

***

### renderEntities()

> **renderEntities**(`renderFn`): `void`

Defined in: core/RenderManager.ts:157

#### Parameters

##### renderFn

(`ctx`) => `void`

#### Returns

`void`

***

### renderEffects()

> **renderEffects**(`renderFn`): `void`

Defined in: core/RenderManager.ts:165

#### Parameters

##### renderFn

(`ctx`) => `void`

#### Returns

`void`

***

### renderUI()

> **renderUI**(`renderFn`): `void`

Defined in: core/RenderManager.ts:173

#### Parameters

##### renderFn

(`ctx`) => `void`

#### Returns

`void`

***

### renderDebugInfo()

> **renderDebugInfo**(`renderFn`): `void`

Defined in: core/RenderManager.ts:181

#### Parameters

##### renderFn

(`ctx`) => `void`

#### Returns

`void`

***

### drawSprite()

> **drawSprite**(`layerName`, `spriteKey`, `x`, `y`, `width?`, `height?`): `void`

Defined in: core/RenderManager.ts:191

#### Parameters

##### layerName

`string`

##### spriteKey

`string`

##### x

`number`

##### y

`number`

##### width?

`number`

##### height?

`number`

#### Returns

`void`

***

### isInViewport()

> `private` **isInViewport**(`x`, `y`, `width`, `height`): `boolean`

Defined in: core/RenderManager.ts:224

#### Parameters

##### x

`number`

##### y

`number`

##### width

`number`

##### height

`number`

#### Returns

`boolean`

***

### markRegionDirty()

> **markRegionDirty**(`x`, `y`, `width`, `height`): `void`

Defined in: core/RenderManager.ts:233

#### Parameters

##### x

`number`

##### y

`number`

##### width

`number`

##### height

`number`

#### Returns

`void`

***

### markBackgroundDirty()

> **markBackgroundDirty**(): `void`

Defined in: core/RenderManager.ts:237

#### Returns

`void`

***

### markDungeonDirty()

> **markDungeonDirty**(): `void`

Defined in: core/RenderManager.ts:241

#### Returns

`void`

***

### addSpriteToCache()

> **addSpriteToCache**(`key`, `sprite`): `void`

Defined in: core/RenderManager.ts:245

#### Parameters

##### key

`string`

##### sprite

`HTMLCanvasElement` | `HTMLImageElement`

#### Returns

`void`

***

### preloadSprites()

> **preloadSprites**(`sprites`): `Promise`\<`void`\>

Defined in: core/RenderManager.ts:249

#### Parameters

##### sprites

`object`[]

#### Returns

`Promise`\<`void`\>

***

### getStats()

> **getStats**(): `RenderStats`

Defined in: core/RenderManager.ts:272

#### Returns

`RenderStats`

***

### getLayer()

> **getLayer**(`name`): `null` \| `LayerConfig`

Defined in: core/RenderManager.ts:276

#### Parameters

##### name

`string`

#### Returns

`null` \| `LayerConfig`

***

### resize()

> **resize**(`width`, `height`): `void`

Defined in: core/RenderManager.ts:280

#### Parameters

##### width

`number`

##### height

`number`

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: core/RenderManager.ts:298

#### Returns

`void`
