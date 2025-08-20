[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / ISaveService

# Interface: ISaveService

Defined in: services/interfaces/IGameDataService.ts:4

## Methods

### saveGame()

> **saveGame**(`gameState`, `playtimeSeconds`): `void`

Defined in: services/interfaces/IGameDataService.ts:5

#### Parameters

##### gameState

[`GameState`](GameState.md)

##### playtimeSeconds

`number`

#### Returns

`void`

***

### loadGame()

> **loadGame**(): `null` \| \{ `gameState`: [`GameState`](GameState.md); `playtimeSeconds`: `number`; \}

Defined in: services/interfaces/IGameDataService.ts:6

#### Returns

`null` \| \{ `gameState`: [`GameState`](GameState.md); `playtimeSeconds`: `number`; \}

***

### hasSave()

> **hasSave**(): `boolean`

Defined in: services/interfaces/IGameDataService.ts:7

#### Returns

`boolean`

***

### deleteSave()

> **deleteSave**(): `void`

Defined in: services/interfaces/IGameDataService.ts:8

#### Returns

`void`
