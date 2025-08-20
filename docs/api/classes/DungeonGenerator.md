[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / DungeonGenerator

# Class: DungeonGenerator

Defined in: [utils/DungeonGenerator.ts:3](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L3)

## Constructors

### Constructor

> **new DungeonGenerator**(`width`, `height`): `DungeonGenerator`

Defined in: [utils/DungeonGenerator.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L9)

#### Parameters

##### width

`number` = `20`

##### height

`number` = `20`

#### Returns

`DungeonGenerator`

## Properties

### width

> `private` **width**: `number`

Defined in: [utils/DungeonGenerator.ts:4](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L4)

***

### height

> `private` **height**: `number`

Defined in: [utils/DungeonGenerator.ts:5](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L5)

***

### level

> `private` **level**: `number`

Defined in: [utils/DungeonGenerator.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L6)

***

### rooms

> `private` **rooms**: `object`[] = `[]`

Defined in: [utils/DungeonGenerator.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L7)

#### x

> **x**: `number`

#### y

> **y**: `number`

#### width

> **width**: `number`

#### height

> **height**: `number`

## Methods

### generateLevel()

> **generateLevel**(`level`): [`DungeonLevel`](../interfaces/DungeonLevel.md)

Defined in: [utils/DungeonGenerator.ts:15](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L15)

#### Parameters

##### level

`number`

#### Returns

[`DungeonLevel`](../interfaces/DungeonLevel.md)

***

### initializeTiles()

> `private` **initializeTiles**(): [`DungeonTile`](../interfaces/DungeonTile.md)[][]

Defined in: [utils/DungeonGenerator.ts:40](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L40)

#### Returns

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

***

### generateRooms()

> `private` **generateRooms**(`tiles`): `void`

Defined in: [utils/DungeonGenerator.ts:64](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L64)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

#### Returns

`void`

***

### generateCorridors()

> `private` **generateCorridors**(`tiles`): `void`

Defined in: [utils/DungeonGenerator.ts:103](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L103)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

#### Returns

`void`

***

### createCorridor()

> `private` **createCorridor**(`tiles`, `x1`, `y1`, `x2`, `y2`): `void`

Defined in: [utils/DungeonGenerator.ts:124](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L124)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

##### x1

`number`

##### y1

`number`

##### x2

`number`

##### y2

`number`

#### Returns

`void`

***

### placeStairs()

> `private` **placeStairs**(`tiles`): `void`

Defined in: [utils/DungeonGenerator.ts:158](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L158)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

#### Returns

`void`

***

### placeSpecialTiles()

> `private` **placeSpecialTiles**(`tiles`): `void`

Defined in: [utils/DungeonGenerator.ts:172](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L172)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

#### Returns

`void`

***

### calculateWalls()

> `private` **calculateWalls**(`tiles`): `void`

Defined in: [utils/DungeonGenerator.ts:192](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L192)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

#### Returns

`void`

***

### getFloorTiles()

> `private` **getFloorTiles**(`tiles`): [`DungeonTile`](../interfaces/DungeonTile.md)[]

Defined in: [utils/DungeonGenerator.ts:207](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L207)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

#### Returns

[`DungeonTile`](../interfaces/DungeonTile.md)[]

***

### generateEncounterZones()

> `private` **generateEncounterZones**(): [`EncounterZone`](../interfaces/EncounterZone.md)[]

Defined in: [utils/DungeonGenerator.ts:221](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L221)

#### Returns

[`EncounterZone`](../interfaces/EncounterZone.md)[]

***

### getMonsterGroupsForLevel()

> `private` **getMonsterGroupsForLevel**(): `string`[]

Defined in: [utils/DungeonGenerator.ts:244](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L244)

#### Returns

`string`[]

***

### generateEvents()

> `private` **generateEvents**(`tiles`): [`DungeonEvent`](../interfaces/DungeonEvent.md)[]

Defined in: [utils/DungeonGenerator.ts:257](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L257)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

#### Returns

[`DungeonEvent`](../interfaces/DungeonEvent.md)[]

***

### getRandomEventType()

> `private` **getRandomEventType**(): `"trap"` \| `"message"` \| `"treasure"` \| `"teleport"` \| `"spinner"` \| `"darkness"`

Defined in: [utils/DungeonGenerator.ts:283](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L283)

#### Returns

`"trap"` \| `"message"` \| `"treasure"` \| `"teleport"` \| `"spinner"` \| `"darkness"`

***

### getEventData()

> `private` **getEventData**(`type`): `any`

Defined in: [utils/DungeonGenerator.ts:301](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L301)

#### Parameters

##### type

`string`

#### Returns

`any`

***

### findValidStartPosition()

> `private` **findValidStartPosition**(`tiles`): `object`

Defined in: [utils/DungeonGenerator.ts:323](https://github.com/the4ofus/drpg2/blob/main/src/utils/DungeonGenerator.ts#L323)

#### Parameters

##### tiles

[`DungeonTile`](../interfaces/DungeonTile.md)[][]

#### Returns

`object`

##### x

> **x**: `number`

##### y

> **y**: `number`
