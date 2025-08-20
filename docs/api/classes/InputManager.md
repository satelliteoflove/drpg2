[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / InputManager

# Class: InputManager

Defined in: [core/Input.ts:3](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L3)

## Constructors

### Constructor

> **new InputManager**(): `InputManager`

Defined in: [core/Input.ts:13](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L13)

#### Returns

`InputManager`

## Properties

### keys

> `private` **keys**: `Set`\<`string`\>

Defined in: [core/Input.ts:4](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L4)

***

### keyHandlers

> `private` **keyHandlers**: `Map`\<`string`, () => `void`\>

Defined in: [core/Input.ts:5](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L5)

***

### onKeyPress()?

> `private` `optional` **onKeyPress**: (`key`) => `boolean`

Defined in: [core/Input.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L6)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### lastKeyPressTime

> `private` **lastKeyPressTime**: `Map`\<`string`, `number`\>

Defined in: [core/Input.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L7)

***

### keyRepeatDelay

> `private` **keyRepeatDelay**: `number` = `GAME_CONFIG.INPUT.KEY_REPEAT_DELAY`

Defined in: [core/Input.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L8)

***

### keyDownHandler()?

> `private` `optional` **keyDownHandler**: (`event`) => `void`

Defined in: [core/Input.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L9)

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`void`

***

### keyUpHandler()?

> `private` `optional` **keyUpHandler**: (`event`) => `void`

Defined in: [core/Input.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L10)

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`void`

***

### blurHandler()?

> `private` `optional` **blurHandler**: () => `void`

Defined in: [core/Input.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L11)

#### Returns

`void`

## Methods

### setupEventListeners()

> `private` **setupEventListeners**(): `void`

Defined in: [core/Input.ts:17](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L17)

#### Returns

`void`

***

### isKeyPressed()

> **isKeyPressed**(`key`): `boolean`

Defined in: [core/Input.ts:63](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L63)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### setKeyHandler()

> **setKeyHandler**(`key`, `handler`): `void`

Defined in: [core/Input.ts:67](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L67)

#### Parameters

##### key

`string`

##### handler

() => `void`

#### Returns

`void`

***

### removeKeyHandler()

> **removeKeyHandler**(`key`): `void`

Defined in: [core/Input.ts:71](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L71)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### setKeyPressCallback()

> **setKeyPressCallback**(`callback`): `void`

Defined in: [core/Input.ts:75](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L75)

#### Parameters

##### callback

(`key`) => `boolean`

#### Returns

`void`

***

### clearHandlers()

> **clearHandlers**(): `void`

Defined in: [core/Input.ts:79](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L79)

#### Returns

`void`

***

### getMovementInput()

> **getMovementInput**(): `object`

Defined in: [core/Input.ts:83](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L83)

#### Returns

`object`

##### forward

> **forward**: `boolean`

##### backward

> **backward**: `boolean`

##### left

> **left**: `boolean`

##### right

> **right**: `boolean`

***

### getActionKeys()

> **getActionKeys**(): `object`

Defined in: [core/Input.ts:97](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L97)

#### Returns

`object`

##### action

> **action**: `boolean`

##### cancel

> **cancel**: `boolean`

##### menu

> **menu**: `boolean`

***

### setKeyRepeatDelay()

> **setKeyRepeatDelay**(`delay`): `void`

Defined in: [core/Input.ts:105](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L105)

#### Parameters

##### delay

`number`

#### Returns

`void`

***

### getKeyRepeatDelay()

> **getKeyRepeatDelay**(): `number`

Defined in: [core/Input.ts:109](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L109)

#### Returns

`number`

***

### cleanup()

> **cleanup**(): `void`

Defined in: [core/Input.ts:113](https://github.com/the4ofus/drpg2/blob/main/src/core/Input.ts#L113)

#### Returns

`void`
