[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / CombatSystem

# Class: CombatSystem

Defined in: [systems/CombatSystem.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L6)

## Constructors

### Constructor

> **new CombatSystem**(): `CombatSystem`

#### Returns

`CombatSystem`

## Properties

### encounter

> `private` **encounter**: `null` \| [`Encounter`](../interfaces/Encounter.md) = `null`

Defined in: [systems/CombatSystem.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L7)

***

### onCombatEnd()?

> `private` `optional` **onCombatEnd**: (`victory`, `rewards?`) => `void`

Defined in: [systems/CombatSystem.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L8)

#### Parameters

##### victory

`boolean`

##### rewards?

###### experience

`number`

###### gold

`number`

#### Returns

`void`

***

### recursionDepth

> `private` **recursionDepth**: `number` = `0`

Defined in: [systems/CombatSystem.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L9)

## Methods

### startCombat()

> **startCombat**(`monsters`, `party`, `onCombatEnd`): `void`

Defined in: [systems/CombatSystem.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L11)

#### Parameters

##### monsters

[`Monster`](../interfaces/Monster.md)[]

##### party

[`Character`](Character.md)[]

##### onCombatEnd

(`victory`, `rewards?`) => `void`

#### Returns

`void`

***

### calculateTurnOrder()

> `private` **calculateTurnOrder**(`party`, `monsters`): ([`Monster`](../interfaces/Monster.md) \| [`Character`](Character.md))[]

Defined in: [systems/CombatSystem.ts:32](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L32)

#### Parameters

##### party

[`Character`](Character.md)[]

##### monsters

[`Monster`](../interfaces/Monster.md)[]

#### Returns

([`Monster`](../interfaces/Monster.md) \| [`Character`](Character.md))[]

***

### getCurrentUnit()

> **getCurrentUnit**(): `any`

Defined in: [systems/CombatSystem.ts:42](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L42)

#### Returns

`any`

***

### canPlayerAct()

> **canPlayerAct**(): `boolean`

Defined in: [systems/CombatSystem.ts:47](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L47)

#### Returns

`boolean`

***

### getPlayerOptions()

> **getPlayerOptions**(): `string`[]

Defined in: [systems/CombatSystem.ts:52](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L52)

#### Returns

`string`[]

***

### executePlayerAction()

> **executePlayerAction**(`action`, `targetIndex?`, `spellId?`): `string`

Defined in: [systems/CombatSystem.ts:69](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L69)

#### Parameters

##### action

`string`

##### targetIndex?

`number`

##### spellId?

`string`

#### Returns

`string`

***

### executeAttack()

> `private` **executeAttack**(`attacker`, `targetIndex?`): `string`

Defined in: [systems/CombatSystem.ts:106](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L106)

#### Parameters

##### attacker

[`Character`](Character.md)

##### targetIndex?

`number`

#### Returns

`string`

***

### executeCastSpell()

> `private` **executeCastSpell**(`caster`, `spellId?`, `targetIndex?`): `string`

Defined in: [systems/CombatSystem.ts:129](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L129)

#### Parameters

##### caster

[`Character`](Character.md)

##### spellId?

`string`

##### targetIndex?

`number`

#### Returns

`string`

***

### applySpellEffect()

> `private` **applySpellEffect**(`spell`, `target`): `string`

Defined in: [systems/CombatSystem.ts:163](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L163)

#### Parameters

##### spell

[`Spell`](../interfaces/Spell.md)

##### target

[`Monster`](../interfaces/Monster.md) | [`Character`](Character.md)

#### Returns

`string`

***

### executeMonsterTurn()

> **executeMonsterTurn**(): `string`

Defined in: [systems/CombatSystem.ts:185](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L185)

#### Returns

`string`

***

### calculateDamage()

> `private` **calculateDamage**(`attacker`, `target`): `number`

Defined in: [systems/CombatSystem.ts:216](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L216)

#### Parameters

##### attacker

[`Character`](Character.md)

##### target

[`Monster`](../interfaces/Monster.md)

#### Returns

`number`

***

### rollDamage()

> `private` **rollDamage**(`damageString`): `number`

Defined in: [systems/CombatSystem.ts:222](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L222)

#### Parameters

##### damageString

`string`

#### Returns

`number`

***

### attemptRun()

> `private` **attemptRun**(): `boolean`

Defined in: [systems/CombatSystem.ts:236](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L236)

#### Returns

`boolean`

***

### nextTurn()

> `private` **nextTurn**(): `void`

Defined in: [systems/CombatSystem.ts:249](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L249)

#### Returns

`void`

***

### cleanupDeadUnits()

> `private` **cleanupDeadUnits**(): `void`

Defined in: [systems/CombatSystem.ts:302](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L302)

#### Returns

`void`

***

### checkCombatEnd()

> `private` **checkCombatEnd**(): `boolean`

Defined in: [systems/CombatSystem.ts:318](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L318)

#### Returns

`boolean`

***

### endCombat()

> `private` **endCombat**(`victory`, `rewards?`): `void`

Defined in: [systems/CombatSystem.ts:339](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L339)

#### Parameters

##### victory

`boolean`

##### rewards?

###### experience

`number`

###### gold

`number`

#### Returns

`void`

***

### getEncounter()

> **getEncounter**(): `null` \| [`Encounter`](../interfaces/Encounter.md)

Defined in: [systems/CombatSystem.ts:347](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L347)

#### Returns

`null` \| [`Encounter`](../interfaces/Encounter.md)

***

### getCombatStatus()

> **getCombatStatus**(): `string`

Defined in: [systems/CombatSystem.ts:351](https://github.com/the4ofus/drpg2/blob/main/src/systems/CombatSystem.ts#L351)

#### Returns

`string`
