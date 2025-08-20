[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / DungeonView

# Class: DungeonView

Defined in: [ui/DungeonView.ts:3](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L3)

## Constructors

### Constructor

> **new DungeonView**(`canvas`): `DungeonView`

Defined in: [ui/DungeonView.ts:13](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L13)

#### Parameters

##### canvas

`HTMLCanvasElement`

#### Returns

`DungeonView`

## Properties

### ctx

> `private` **ctx**: `CanvasRenderingContext2D`

Defined in: [ui/DungeonView.ts:4](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L4)

***

### dungeon

> `private` **dungeon**: `null` \| [`DungeonLevel`](../interfaces/DungeonLevel.md) = `null`

Defined in: [ui/DungeonView.ts:5](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L5)

***

### playerX

> `private` **playerX**: `number` = `0`

Defined in: [ui/DungeonView.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L6)

***

### playerY

> `private` **playerY**: `number` = `0`

Defined in: [ui/DungeonView.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L7)

***

### playerFacing

> `private` **playerFacing**: [`Direction`](../type-aliases/Direction.md) = `'north'`

Defined in: [ui/DungeonView.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L8)

***

### VIEW\_WIDTH

> `private` `readonly` **VIEW\_WIDTH**: `400` = `400`

Defined in: [ui/DungeonView.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L10)

***

### VIEW\_HEIGHT

> `private` `readonly` **VIEW\_HEIGHT**: `300` = `300`

Defined in: [ui/DungeonView.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L11)

## Methods

### setDungeon()

> **setDungeon**(`dungeon`): `void`

Defined in: [ui/DungeonView.ts:17](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L17)

#### Parameters

##### dungeon

[`DungeonLevel`](../interfaces/DungeonLevel.md)

#### Returns

`void`

***

### setPlayerPosition()

> **setPlayerPosition**(`x`, `y`, `facing`): `void`

Defined in: [ui/DungeonView.ts:21](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L21)

#### Parameters

##### x

`number`

##### y

`number`

##### facing

[`Direction`](../type-aliases/Direction.md)

#### Returns

`void`

***

### render()

> **render**(): `void`

Defined in: [ui/DungeonView.ts:27](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L27)

#### Returns

`void`

***

### renderDepth3()

> `private` **renderDepth3**(): `void`

Defined in: [ui/DungeonView.ts:40](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L40)

#### Returns

`void`

***

### renderDepth2()

> `private` **renderDepth2**(): `void`

Defined in: [ui/DungeonView.ts:58](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L58)

#### Returns

`void`

***

### renderDepth1()

> `private` **renderDepth1**(): `void`

Defined in: [ui/DungeonView.ts:77](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L77)

#### Returns

`void`

***

### renderCurrentPosition()

> `private` **renderCurrentPosition**(): `void`

Defined in: [ui/DungeonView.ts:96](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L96)

#### Returns

`void`

***

### getPositionsAtDepth()

> `private` **getPositionsAtDepth**(`depth`): `object`[]

Defined in: [ui/DungeonView.ts:112](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L112)

#### Parameters

##### depth

`number`

#### Returns

`object`[]

***

### getDirectionVector()

> `private` **getDirectionVector**(): \[`number`, `number`\]

Defined in: [ui/DungeonView.ts:143](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L143)

#### Returns

\[`number`, `number`\]

***

### getTileAt()

> `private` **getTileAt**(`x`, `y`): `null` \| [`DungeonTile`](../interfaces/DungeonTile.md)

Defined in: [ui/DungeonView.ts:156](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L156)

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`null` \| [`DungeonTile`](../interfaces/DungeonTile.md)

***

### getTileInFront()

> `private` **getTileInFront**(): `null` \| [`DungeonTile`](../interfaces/DungeonTile.md)

Defined in: [ui/DungeonView.ts:163](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L163)

#### Returns

`null` \| [`DungeonTile`](../interfaces/DungeonTile.md)

***

### canSeeWall()

> `private` **canSeeWall**(`x`, `y`, `side`): `boolean`

Defined in: [ui/DungeonView.ts:168](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L168)

#### Parameters

##### x

`number`

##### y

`number`

##### side

`string`

#### Returns

`boolean`

***

### drawWall()

> `private` **drawWall**(`x`, `y`, `width`, `height`, `color`): `void`

Defined in: [ui/DungeonView.ts:216](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L216)

#### Parameters

##### x

`number`

##### y

`number`

##### width

`number`

##### height

`number`

##### color

`string`

#### Returns

`void`

***

### drawFloor()

> `private` **drawFloor**(`x`, `y`, `width`, `height`, `color`): `void`

Defined in: [ui/DungeonView.ts:228](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L228)

#### Parameters

##### x

`number`

##### y

`number`

##### width

`number`

##### height

`number`

##### color

`string`

#### Returns

`void`

***

### drawSpecialTile()

> `private` **drawSpecialTile**(`tile`, `x`, `y`, `size`): `void`

Defined in: [ui/DungeonView.ts:237](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L237)

#### Parameters

##### tile

[`DungeonTile`](../interfaces/DungeonTile.md)

##### x

`number`

##### y

`number`

##### size

`number`

#### Returns

`void`

***

### renderUI()

> `private` **renderUI**(): `void`

Defined in: [ui/DungeonView.ts:296](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L296)

#### Returns

`void`

***

### getCompassAngle()

> `private` **getCompassAngle**(): `number`

Defined in: [ui/DungeonView.ts:348](https://github.com/the4ofus/drpg2/blob/main/src/ui/DungeonView.ts#L348)

#### Returns

`number`
