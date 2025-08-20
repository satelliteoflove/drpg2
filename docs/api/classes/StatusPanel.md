[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / StatusPanel

# Class: StatusPanel

Defined in: [ui/StatusPanel.ts:4](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L4)

## Constructors

### Constructor

> **new StatusPanel**(`canvas`, `x`, `y`, `width`, `height`): `StatusPanel`

Defined in: [ui/StatusPanel.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L11)

#### Parameters

##### canvas

`HTMLCanvasElement`

##### x

`number`

##### y

`number`

##### width

`number`

##### height

`number`

#### Returns

`StatusPanel`

## Properties

### ctx

> `private` **ctx**: `CanvasRenderingContext2D`

Defined in: [ui/StatusPanel.ts:5](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L5)

***

### x

> `private` **x**: `number`

Defined in: [ui/StatusPanel.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L6)

***

### y

> `private` **y**: `number`

Defined in: [ui/StatusPanel.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L7)

***

### width

> `private` **width**: `number`

Defined in: [ui/StatusPanel.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L8)

***

### height

> `private` **height**: `number`

Defined in: [ui/StatusPanel.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L9)

## Methods

### render()

> **render**(`party`): `void`

Defined in: [ui/StatusPanel.ts:19](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L19)

#### Parameters

##### party

[`Party`](Party.md)

#### Returns

`void`

***

### renderCharacterStatus()

> `private` **renderCharacterStatus**(`char`, `x`, `y`, `width`, `height`): `void`

Defined in: [ui/StatusPanel.ts:44](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L44)

#### Parameters

##### char

[`Character`](Character.md)

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

### renderPartyInfo()

> `private` **renderPartyInfo**(`party`): `void`

Defined in: [ui/StatusPanel.ts:98](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L98)

#### Parameters

##### party

[`Party`](Party.md)

#### Returns

`void`

***

### renderCombatStatus()

> **renderCombatStatus**(`currentTurn`, `turnOrder`): `void`

Defined in: [ui/StatusPanel.ts:130](https://github.com/the4ofus/drpg2/blob/main/src/ui/StatusPanel.ts#L130)

#### Parameters

##### currentTurn

`string`

##### turnOrder

`string`[]

#### Returns

`void`
