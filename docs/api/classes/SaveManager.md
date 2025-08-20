[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / SaveManager

# Class: SaveManager

Defined in: [utils/SaveManager.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L10)

## Constructors

### Constructor

> **new SaveManager**(): `SaveManager`

#### Returns

`SaveManager`

## Properties

### SAVE\_KEY

> `private` `readonly` `static` **SAVE\_KEY**: `"drpg2_save"` = `'drpg2_save'`

Defined in: [utils/SaveManager.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L11)

***

### VERSION

> `private` `readonly` `static` **VERSION**: `"1.0.0"` = `'1.0.0'`

Defined in: [utils/SaveManager.ts:12](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L12)

***

### MAX\_SAVES

> `private` `readonly` `static` **MAX\_SAVES**: `5` = `5`

Defined in: [utils/SaveManager.ts:13](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L13)

## Methods

### saveGame()

> `static` **saveGame**(`gameState`, `playtimeSeconds`): `boolean`

Defined in: [utils/SaveManager.ts:15](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L15)

#### Parameters

##### gameState

[`GameState`](../interfaces/GameState.md)

##### playtimeSeconds

`number`

#### Returns

`boolean`

***

### loadGame()

> `static` **loadGame**(): `null` \| `SaveData`

Defined in: [utils/SaveManager.ts:35](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L35)

#### Returns

`null` \| `SaveData`

***

### deleteSave()

> `static` **deleteSave**(): `boolean`

Defined in: [utils/SaveManager.ts:54](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L54)

#### Returns

`boolean`

***

### hasSave()

> `static` **hasSave**(): `boolean`

Defined in: [utils/SaveManager.ts:64](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L64)

#### Returns

`boolean`

***

### sanitizeGameState()

> `private` `static` **sanitizeGameState**(`gameState`): [`GameState`](../interfaces/GameState.md)

Defined in: [utils/SaveManager.ts:68](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L68)

#### Parameters

##### gameState

[`GameState`](../interfaces/GameState.md)

#### Returns

[`GameState`](../interfaces/GameState.md)

***

### applyPermadeath()

> `private` `static` **applyPermadeath**(`character`): `void`

Defined in: [utils/SaveManager.ts:80](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L80)

#### Parameters

##### character

`Character`

#### Returns

`void`

***

### isValidSave()

> `private` `static` **isValidSave**(`saveData`): `saveData is SaveData`

Defined in: [utils/SaveManager.ts:98](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L98)

#### Parameters

##### saveData

`any`

#### Returns

`saveData is SaveData`

***

### isValidGameState()

> `private` `static` **isValidGameState**(`gameState`): `gameState is GameState`

Defined in: [utils/SaveManager.ts:109](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L109)

#### Parameters

##### gameState

`any`

#### Returns

`gameState is GameState`

***

### addToSaveHistory()

> `private` `static` **addToSaveHistory**(`saveData`): `void`

Defined in: [utils/SaveManager.ts:123](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L123)

#### Parameters

##### saveData

`SaveData`

#### Returns

`void`

***

### getSaveHistory()

> `static` **getSaveHistory**(): `any`[]

Defined in: [utils/SaveManager.ts:146](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L146)

#### Returns

`any`[]

***

### exportSave()

> `static` **exportSave**(): `null` \| `string`

Defined in: [utils/SaveManager.ts:156](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L156)

#### Returns

`null` \| `string`

***

### importSave()

> `static` **importSave**(`importData`): `boolean`

Defined in: [utils/SaveManager.ts:168](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L168)

#### Parameters

##### importData

`string`

#### Returns

`boolean`

***

### createBackup()

> `static` **createBackup**(): `boolean`

Defined in: [utils/SaveManager.ts:185](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L185)

#### Returns

`boolean`

***

### cleanupOldBackups()

> `private` `static` **cleanupOldBackups**(): `void`

Defined in: [utils/SaveManager.ts:201](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L201)

#### Returns

`void`

***

### getGameStats()

> `static` **getGameStats**(`gameState`): `object`

Defined in: [utils/SaveManager.ts:217](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L217)

#### Parameters

##### gameState

[`GameState`](../interfaces/GameState.md)

#### Returns

`object`

##### totalPlaytime

> **totalPlaytime**: `number`

##### currentFloor

> **currentFloor**: `number`

##### partyLevel

> **partyLevel**: `number`

##### totalGold

> **totalGold**: `number`

##### aliveCharacters

> **aliveCharacters**: `number`

##### totalDeaths

> **totalDeaths**: `number`

##### battlesWon

> **battlesWon**: `number`

***

### handlePermadeath()

> `static` **handlePermadeath**(`character`): `object`

Defined in: [utils/SaveManager.ts:241](https://github.com/the4ofus/drpg2/blob/main/src/utils/SaveManager.ts#L241)

#### Parameters

##### character

`Character`

#### Returns

`object`

##### survived

> **survived**: `boolean`

##### newStatus

> **newStatus**: `string`

##### message

> **message**: `string`
