[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / InventorySystem

# Class: InventorySystem

Defined in: [systems/InventorySystem.ts:4](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L4)

## Constructors

### Constructor

> **new InventorySystem**(): `InventorySystem`

#### Returns

`InventorySystem`

## Properties

### items

> `private` `static` **items**: `Map`\<`string`, [`Item`](../interfaces/Item.md)\>

Defined in: [systems/InventorySystem.ts:5](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L5)

## Methods

### initializeItems()

> `private` `static` **initializeItems**(): `void`

Defined in: [systems/InventorySystem.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L11)

#### Returns

`void`

***

### getItem()

> `static` **getItem**(`itemId`): `null` \| [`Item`](../interfaces/Item.md)

Defined in: [systems/InventorySystem.ts:104](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L104)

#### Parameters

##### itemId

`string`

#### Returns

`null` \| [`Item`](../interfaces/Item.md)

***

### addItemToInventory()

> `static` **addItemToInventory**(`character`, `itemId`): `boolean`

Defined in: [systems/InventorySystem.ts:111](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L111)

#### Parameters

##### character

[`Character`](Character.md)

##### itemId

`string`

#### Returns

`boolean`

***

### removeItemFromInventory()

> `static` **removeItemFromInventory**(`character`, `itemId`): `boolean`

Defined in: [systems/InventorySystem.ts:125](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L125)

#### Parameters

##### character

[`Character`](Character.md)

##### itemId

`string`

#### Returns

`boolean`

***

### equipItem()

> `static` **equipItem**(`character`, `itemId`): `boolean`

Defined in: [systems/InventorySystem.ts:139](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L139)

#### Parameters

##### character

[`Character`](Character.md)

##### itemId

`string`

#### Returns

`boolean`

***

### unequipItem()

> `static` **unequipItem**(`character`, `equipSlot`): `boolean`

Defined in: [systems/InventorySystem.ts:164](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L164)

#### Parameters

##### character

[`Character`](Character.md)

##### equipSlot

keyof [`Equipment`](../interfaces/Equipment.md)

#### Returns

`boolean`

***

### getEquipSlot()

> `private` `static` **getEquipSlot**(`itemType`): `null` \| keyof Equipment

Defined in: [systems/InventorySystem.ts:178](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L178)

#### Parameters

##### itemType

`string`

#### Returns

`null` \| keyof Equipment

***

### applyItemEffects()

> `private` `static` **applyItemEffects**(`character`, `item`, `equipping`): `void`

Defined in: [systems/InventorySystem.ts:199](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L199)

#### Parameters

##### character

[`Character`](Character.md)

##### item

[`Item`](../interfaces/Item.md)

##### equipping

`boolean`

#### Returns

`void`

***

### useItem()

> `static` **useItem**(`character`, `itemId`): `string`

Defined in: [systems/InventorySystem.ts:219](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L219)

#### Parameters

##### character

[`Character`](Character.md)

##### itemId

`string`

#### Returns

`string`

***

### recalculateStats()

> `private` `static` **recalculateStats**(`character`): `void`

Defined in: [systems/InventorySystem.ts:251](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L251)

#### Parameters

##### character

[`Character`](Character.md)

#### Returns

`void`

***

### getItemDescription()

> `static` **getItemDescription**(`item`): `string`

Defined in: [systems/InventorySystem.ts:262](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L262)

#### Parameters

##### item

[`Item`](../interfaces/Item.md)

#### Returns

`string`

***

### getInventoryWeight()

> `static` **getInventoryWeight**(`character`): `number`

Defined in: [systems/InventorySystem.ts:295](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L295)

#### Parameters

##### character

[`Character`](Character.md)

#### Returns

`number`

***

### getCarryCapacity()

> `static` **getCarryCapacity**(`character`): `number`

Defined in: [systems/InventorySystem.ts:311](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L311)

#### Parameters

##### character

[`Character`](Character.md)

#### Returns

`number`

***

### isEncumbered()

> `static` **isEncumbered**(`character`): `boolean`

Defined in: [systems/InventorySystem.ts:315](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L315)

#### Parameters

##### character

[`Character`](Character.md)

#### Returns

`boolean`

***

### identifyItem()

> `static` **identifyItem**(`character`, `itemId`): `boolean`

Defined in: [systems/InventorySystem.ts:319](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L319)

#### Parameters

##### character

[`Character`](Character.md)

##### itemId

`string`

#### Returns

`boolean`

***

### generateRandomLoot()

> `static` **generateRandomLoot**(`level`): [`Item`](../interfaces/Item.md)[]

Defined in: [systems/InventorySystem.ts:327](https://github.com/the4ofus/drpg2/blob/main/src/systems/InventorySystem.ts#L327)

#### Parameters

##### level

`number`

#### Returns

[`Item`](../interfaces/Item.md)[]
