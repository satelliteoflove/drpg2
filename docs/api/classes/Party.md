[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / Party

# Class: Party

Defined in: [entities/Party.ts:4](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L4)

## Implements

- [`IParty`](../interfaces/IParty.md)

## Constructors

### Constructor

> **new Party**(): `Party`

Defined in: [entities/Party.ts:12](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L12)

#### Returns

`Party`

## Properties

### characters

> **characters**: [`Character`](Character.md)[]

Defined in: [entities/Party.ts:5](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L5)

#### Implementation of

[`IParty`](../interfaces/IParty.md).[`characters`](../interfaces/IParty.md#characters)

***

### formation

> **formation**: [`Formation`](../type-aliases/Formation.md)

Defined in: [entities/Party.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L6)

#### Implementation of

[`IParty`](../interfaces/IParty.md).[`formation`](../interfaces/IParty.md#formation)

***

### x

> **x**: `number`

Defined in: [entities/Party.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L7)

#### Implementation of

[`IParty`](../interfaces/IParty.md).[`x`](../interfaces/IParty.md#x)

***

### y

> **y**: `number`

Defined in: [entities/Party.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L8)

#### Implementation of

[`IParty`](../interfaces/IParty.md).[`y`](../interfaces/IParty.md#y)

***

### facing

> **facing**: [`Direction`](../type-aliases/Direction.md)

Defined in: [entities/Party.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L9)

#### Implementation of

[`IParty`](../interfaces/IParty.md).[`facing`](../interfaces/IParty.md#facing)

***

### floor

> **floor**: `number`

Defined in: [entities/Party.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L10)

#### Implementation of

[`IParty`](../interfaces/IParty.md).[`floor`](../interfaces/IParty.md#floor)

## Methods

### addCharacter()

> **addCharacter**(`character`): `boolean`

Defined in: [entities/Party.ts:21](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L21)

#### Parameters

##### character

[`Character`](Character.md)

#### Returns

`boolean`

***

### removeCharacter()

> **removeCharacter**(`characterId`): `boolean`

Defined in: [entities/Party.ts:29](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L29)

#### Parameters

##### characterId

`string`

#### Returns

`boolean`

***

### swapCharacters()

> **swapCharacters**(`index1`, `index2`): `void`

Defined in: [entities/Party.ts:37](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L37)

#### Parameters

##### index1

`number`

##### index2

`number`

#### Returns

`void`

***

### getFrontRow()

> **getFrontRow**(): [`Character`](Character.md)[]

Defined in: [entities/Party.ts:53](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L53)

#### Returns

[`Character`](Character.md)[]

***

### getBackRow()

> **getBackRow**(): [`Character`](Character.md)[]

Defined in: [entities/Party.ts:57](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L57)

#### Returns

[`Character`](Character.md)[]

***

### getAliveCharacters()

> **getAliveCharacters**(): [`Character`](Character.md)[]

Defined in: [entities/Party.ts:61](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L61)

#### Returns

[`Character`](Character.md)[]

***

### isWiped()

> **isWiped**(): `boolean`

Defined in: [entities/Party.ts:65](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L65)

#### Returns

`boolean`

***

### move()

> **move**(`direction`): `void`

Defined in: [entities/Party.ts:69](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L69)

#### Parameters

##### direction

`"left"` | `"right"` | `"forward"` | `"backward"`

#### Returns

`void`

***

### moveForward()

> `private` **moveForward**(): `void`

Defined in: [entities/Party.ts:86](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L86)

#### Returns

`void`

***

### moveBackward()

> `private` **moveBackward**(): `void`

Defined in: [entities/Party.ts:92](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L92)

#### Returns

`void`

***

### turnLeft()

> `private` **turnLeft**(): `void`

Defined in: [entities/Party.ts:98](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L98)

#### Returns

`void`

***

### turnRight()

> `private` **turnRight**(): `void`

Defined in: [entities/Party.ts:104](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L104)

#### Returns

`void`

***

### getDirectionVector()

> `private` **getDirectionVector**(): \[`number`, `number`\]

Defined in: [entities/Party.ts:110](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L110)

#### Returns

\[`number`, `number`\]

***

### rest()

> **rest**(): `void`

Defined in: [entities/Party.ts:123](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L123)

#### Returns

`void`

***

### getTotalGold()

> **getTotalGold**(): `number`

Defined in: [entities/Party.ts:132](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L132)

#### Returns

`number`

***

### distributeGold()

> **distributeGold**(`amount`): `void`

Defined in: [entities/Party.ts:136](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L136)

#### Parameters

##### amount

`number`

#### Returns

`void`

***

### distributeExperience()

> **distributeExperience**(`amount`): `void`

Defined in: [entities/Party.ts:146](https://github.com/the4ofus/drpg2/blob/main/src/entities/Party.ts#L146)

#### Parameters

##### amount

`number`

#### Returns

`void`
