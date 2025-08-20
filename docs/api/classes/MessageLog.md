[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / MessageLog

# Class: MessageLog

Defined in: [ui/MessageLog.ts:1](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L1)

## Constructors

### Constructor

> **new MessageLog**(`canvas`, `x`, `y`, `width`, `height`): `MessageLog`

Defined in: [ui/MessageLog.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L10)

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

`MessageLog`

## Properties

### ctx

> `private` **ctx**: `CanvasRenderingContext2D`

Defined in: [ui/MessageLog.ts:2](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L2)

***

### messages

> `private` **messages**: `object`[] = `[]`

Defined in: [ui/MessageLog.ts:3](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L3)

#### text

> **text**: `string`

#### timestamp

> **timestamp**: `number`

#### color?

> `optional` **color**: `string`

***

### maxMessages

> `private` **maxMessages**: `number` = `20`

Defined in: [ui/MessageLog.ts:4](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L4)

***

### x

> `private` **x**: `number`

Defined in: [ui/MessageLog.ts:5](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L5)

***

### y

> `private` **y**: `number`

Defined in: [ui/MessageLog.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L6)

***

### width

> `private` **width**: `number`

Defined in: [ui/MessageLog.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L7)

***

### height

> `private` **height**: `number`

Defined in: [ui/MessageLog.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L8)

## Methods

### addMessage()

> **addMessage**(`text`, `color`): `void`

Defined in: [ui/MessageLog.ts:18](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L18)

#### Parameters

##### text

`string`

##### color

`string` = `'#fff'`

#### Returns

`void`

***

### render()

> **render**(): `void`

Defined in: [ui/MessageLog.ts:30](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L30)

#### Returns

`void`

***

### wrapText()

> `private` **wrapText**(`text`, `maxWidth`): `string`[]

Defined in: [ui/MessageLog.ts:69](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L69)

#### Parameters

##### text

`string`

##### maxWidth

`number`

#### Returns

`string`[]

***

### renderScrollIndicator()

> `private` **renderScrollIndicator**(): `void`

Defined in: [ui/MessageLog.ts:93](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L93)

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [ui/MessageLog.ts:107](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L107)

#### Returns

`void`

***

### addCombatMessage()

> **addCombatMessage**(`message`): `void`

Defined in: [ui/MessageLog.ts:111](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L111)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### addSystemMessage()

> **addSystemMessage**(`message`): `void`

Defined in: [ui/MessageLog.ts:115](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L115)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### addWarningMessage()

> **addWarningMessage**(`message`): `void`

Defined in: [ui/MessageLog.ts:119](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L119)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### addDeathMessage()

> **addDeathMessage**(`message`): `void`

Defined in: [ui/MessageLog.ts:123](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L123)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### addLevelUpMessage()

> **addLevelUpMessage**(`message`): `void`

Defined in: [ui/MessageLog.ts:127](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L127)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### addItemMessage()

> **addItemMessage**(`message`): `void`

Defined in: [ui/MessageLog.ts:131](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L131)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### addMagicMessage()

> **addMagicMessage**(`message`): `void`

Defined in: [ui/MessageLog.ts:135](https://github.com/the4ofus/drpg2/blob/main/src/ui/MessageLog.ts#L135)

#### Parameters

##### message

`string`

#### Returns

`void`
