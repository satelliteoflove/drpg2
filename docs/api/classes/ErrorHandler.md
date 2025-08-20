[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / ErrorHandler

# Class: ErrorHandler

Defined in: [utils/ErrorHandler.ts:16](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L16)

## Constructors

### Constructor

> **new ErrorHandler**(): `ErrorHandler`

#### Returns

`ErrorHandler`

## Properties

### errors

> `private` `static` **errors**: `GameError`[] = `[]`

Defined in: [utils/ErrorHandler.ts:17](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L17)

***

### maxErrors

> `private` `static` **maxErrors**: `number` = `100`

Defined in: [utils/ErrorHandler.ts:18](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L18)

## Methods

### logError()

> `static` **logError**(`message`, `severity`, `context?`, `error?`): `void`

Defined in: [utils/ErrorHandler.ts:20](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L20)

#### Parameters

##### message

`string`

##### severity

[`ErrorSeverity`](../enumerations/ErrorSeverity.md) = `ErrorSeverity.MEDIUM`

##### context?

`string`

##### error?

`Error`

#### Returns

`void`

***

### safeCanvasOperation()

> `static` **safeCanvasOperation**\<`T`\>(`operation`, `fallback`, `context`): `T`

Defined in: [utils/ErrorHandler.ts:53](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L53)

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `T`

##### fallback

`T`

##### context

`string` = `'Canvas Operation'`

#### Returns

`T`

***

### safeLocalStorageOperation()

> `static` **safeLocalStorageOperation**\<`T`\>(`operation`, `fallback`, `context`): `T`

Defined in: [utils/ErrorHandler.ts:71](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L71)

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `T`

##### fallback

`T`

##### context

`string` = `'LocalStorage Operation'`

#### Returns

`T`

***

### safeBrowserOperation()

> `static` **safeBrowserOperation**\<`T`\>(`operation`, `fallback`, `context`): `T`

Defined in: [utils/ErrorHandler.ts:93](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L93)

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `T`

##### fallback

`T`

##### context

`string` = `'Browser Operation'`

#### Returns

`T`

***

### getErrors()

> `static` **getErrors**(): `GameError`[]

Defined in: [utils/ErrorHandler.ts:115](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L115)

#### Returns

`GameError`[]

***

### clearErrors()

> `static` **clearErrors**(): `void`

Defined in: [utils/ErrorHandler.ts:119](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L119)

#### Returns

`void`

***

### getErrorsByContext()

> `static` **getErrorsByContext**(`context`): `GameError`[]

Defined in: [utils/ErrorHandler.ts:123](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L123)

#### Parameters

##### context

`string`

#### Returns

`GameError`[]

***

### getErrorsBySeverity()

> `static` **getErrorsBySeverity**(`severity`): `GameError`[]

Defined in: [utils/ErrorHandler.ts:127](https://github.com/the4ofus/drpg2/blob/main/src/utils/ErrorHandler.ts#L127)

#### Parameters

##### severity

[`ErrorSeverity`](../enumerations/ErrorSeverity.md)

#### Returns

`GameError`[]
