[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / TypeValidation

# Class: TypeValidation

Defined in: [utils/TypeValidation.ts:13](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L13)

## Constructors

### Constructor

> **new TypeValidation**(): `TypeValidation`

#### Returns

`TypeValidation`

## Methods

### isCharacterClass()

> `static` **isCharacterClass**(`value`): `value is CharacterClass`

Defined in: [utils/TypeValidation.ts:14](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L14)

#### Parameters

##### value

`any`

#### Returns

`value is CharacterClass`

***

### isCharacterRace()

> `static` **isCharacterRace**(`value`): `value is CharacterRace`

Defined in: [utils/TypeValidation.ts:28](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L28)

#### Parameters

##### value

`any`

#### Returns

`value is CharacterRace`

***

### isCharacterAlignment()

> `static` **isCharacterAlignment**(`value`): `value is CharacterAlignment`

Defined in: [utils/TypeValidation.ts:33](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L33)

#### Parameters

##### value

`any`

#### Returns

`value is CharacterAlignment`

***

### isDirection()

> `static` **isDirection**(`value`): `value is Direction`

Defined in: [utils/TypeValidation.ts:38](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L38)

#### Parameters

##### value

`any`

#### Returns

`value is Direction`

***

### isCharacterStats()

> `static` **isCharacterStats**(`value`): `value is CharacterStats`

Defined in: [utils/TypeValidation.ts:43](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L43)

#### Parameters

##### value

`any`

#### Returns

`value is CharacterStats`

***

### isValidCharacter()

> `static` **isValidCharacter**(`value`): `value is Character`

Defined in: [utils/TypeValidation.ts:52](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L52)

#### Parameters

##### value

`any`

#### Returns

`value is Character`

***

### isValidPartyData()

> `static` **isValidPartyData**(`value`): `value is IParty`

Defined in: [utils/TypeValidation.ts:105](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L105)

#### Parameters

##### value

`any`

#### Returns

`value is IParty`

***

### isValidGameState()

> `static` **isValidGameState**(`value`): `value is GameState`

Defined in: [utils/TypeValidation.ts:123](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L123)

#### Parameters

##### value

`any`

#### Returns

`value is GameState`

***

### safeValidateCharacter()

> `static` **safeValidateCharacter**(`value`, `context`): `null` \| `Character`

Defined in: [utils/TypeValidation.ts:141](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L141)

#### Parameters

##### value

`any`

##### context

`string` = `'Character Validation'`

#### Returns

`null` \| `Character`

***

### safeValidateParty()

> `static` **safeValidateParty**(`value`, `context`): `null` \| [`IParty`](../interfaces/IParty.md)

Defined in: [utils/TypeValidation.ts:162](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L162)

#### Parameters

##### value

`any`

##### context

`string` = `'Party Validation'`

#### Returns

`null` \| [`IParty`](../interfaces/IParty.md)

***

### safeValidateGameState()

> `static` **safeValidateGameState**(`value`, `context`): `null` \| [`GameState`](../interfaces/GameState.md)

Defined in: [utils/TypeValidation.ts:183](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L183)

#### Parameters

##### value

`any`

##### context

`string` = `'GameState Validation'`

#### Returns

`null` \| [`GameState`](../interfaces/GameState.md)

***

### generateSecureId()

> `static` **generateSecureId**(): `string`

Defined in: [utils/TypeValidation.ts:204](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L204)

#### Returns

`string`

***

### sanitizeString()

> `static` **sanitizeString**(`value`, `maxLength`): `string`

Defined in: [utils/TypeValidation.ts:255](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L255)

#### Parameters

##### value

`any`

##### maxLength

`number` = `100`

#### Returns

`string`

***

### clampNumber()

> `static` **clampNumber**(`value`, `min`, `max`): `number`

Defined in: [utils/TypeValidation.ts:263](https://github.com/the4ofus/drpg2/blob/main/src/utils/TypeValidation.ts#L263)

#### Parameters

##### value

`number`

##### min

`number`

##### max

`number`

#### Returns

`number`
