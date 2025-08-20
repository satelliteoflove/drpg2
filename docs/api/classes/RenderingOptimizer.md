[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / RenderingOptimizer

# Class: RenderingOptimizer

Defined in: core/RenderingOptimizer.ts:19

## Constructors

### Constructor

> **new RenderingOptimizer**(`mainCanvas`): `RenderingOptimizer`

Defined in: core/RenderingOptimizer.ts:27

#### Parameters

##### mainCanvas

`HTMLCanvasElement`

#### Returns

`RenderingOptimizer`

## Properties

### layers

> `private` **layers**: `Map`\<`string`, `LayerConfig`\>

Defined in: core/RenderingOptimizer.ts:20

***

### dirtyRegions

> `private` **dirtyRegions**: `Set`\<`DirtyRegion`\>

Defined in: core/RenderingOptimizer.ts:21

***

### lastFrameTime

> `private` **lastFrameTime**: `number` = `0`

Defined in: core/RenderingOptimizer.ts:22

***

### frameCount

> `private` **frameCount**: `number` = `0`

Defined in: core/RenderingOptimizer.ts:23

***

### fps

> `private` **fps**: `number` = `0`

Defined in: core/RenderingOptimizer.ts:24

***

### skipFrameThreshold

> `private` **skipFrameThreshold**: `number`

Defined in: core/RenderingOptimizer.ts:25

***

### mainCanvas

> `private` **mainCanvas**: `HTMLCanvasElement`

Defined in: core/RenderingOptimizer.ts:27

## Methods

### setupMainLayer()

> `private` **setupMainLayer**(): `void`

Defined in: core/RenderingOptimizer.ts:31

#### Returns

`void`

***

### createLayer()

> **createLayer**(`name`, `zIndex`, `persistent`): `LayerConfig`

Defined in: core/RenderingOptimizer.ts:47

#### Parameters

##### name

`string`

##### zIndex

`number` = `0`

##### persistent

`boolean` = `false`

#### Returns

`LayerConfig`

***

### getLayer()

> **getLayer**(`name`): `null` \| `LayerConfig`

Defined in: core/RenderingOptimizer.ts:90

#### Parameters

##### name

`string`

#### Returns

`null` \| `LayerConfig`

***

### markLayerDirty()

> **markLayerDirty**(`name`): `void`

Defined in: core/RenderingOptimizer.ts:94

#### Parameters

##### name

`string`

#### Returns

`void`

***

### markRegionDirty()

> **markRegionDirty**(`x`, `y`, `width`, `height`): `void`

Defined in: core/RenderingOptimizer.ts:101

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

### clearLayer()

> **clearLayer**(`name`): `void`

Defined in: core/RenderingOptimizer.ts:105

#### Parameters

##### name

`string`

#### Returns

`void`

***

### shouldSkipFrame()

> **shouldSkipFrame**(`currentTime`): `boolean`

Defined in: core/RenderingOptimizer.ts:113

#### Parameters

##### currentTime

`number`

#### Returns

`boolean`

***

### startFrame()

> **startFrame**(`currentTime`): `void`

Defined in: core/RenderingOptimizer.ts:118

#### Parameters

##### currentTime

`number`

#### Returns

`void`

***

### renderLayers()

> **renderLayers**(): `void`

Defined in: core/RenderingOptimizer.ts:129

#### Returns

`void`

***

### compositeLayer()

> `private` **compositeLayer**(`sourceLayer`, `targetLayer`): `void`

Defined in: core/RenderingOptimizer.ts:154

#### Parameters

##### sourceLayer

`LayerConfig`

##### targetLayer

`LayerConfig`

#### Returns

`void`

***

### clearDirtyRegions()

> `private` **clearDirtyRegions**(): `void`

Defined in: core/RenderingOptimizer.ts:165

#### Returns

`void`

***

### optimizeImageRendering()

> **optimizeImageRendering**(`context`): `void`

Defined in: core/RenderingOptimizer.ts:169

#### Parameters

##### context

`CanvasRenderingContext2D`

#### Returns

`void`

***

### batchDrawCalls()

> **batchDrawCalls**(`context`, `drawFunction`): `void`

Defined in: core/RenderingOptimizer.ts:177

#### Parameters

##### context

`CanvasRenderingContext2D`

##### drawFunction

(`ctx`) => `void`

#### Returns

`void`

***

### getFPS()

> **getFPS**(): `number`

Defined in: core/RenderingOptimizer.ts:193

#### Returns

`number`

***

### getFrameCount()

> **getFrameCount**(): `number`

Defined in: core/RenderingOptimizer.ts:197

#### Returns

`number`

***

### getDirtyRegionsCount()

> **getDirtyRegionsCount**(): `number`

Defined in: core/RenderingOptimizer.ts:201

#### Returns

`number`

***

### getLayerCount()

> **getLayerCount**(): `number`

Defined in: core/RenderingOptimizer.ts:205

#### Returns

`number`

***

### dispose()

> **dispose**(): `void`

Defined in: core/RenderingOptimizer.ts:209

#### Returns

`void`
