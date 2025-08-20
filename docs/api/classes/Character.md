[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / Character

# Class: Character

Defined in: [entities/Character.ts:15](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L15)

## Implements

- `Character`

## Constructors

### Constructor

> **new Character**(`name`, `race`, `charClass`, `alignment`): `Character`

Defined in: [entities/Character.ts:39](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L39)

#### Parameters

##### name

`string`

##### race

[`CharacterRace`](../type-aliases/CharacterRace.md)

##### charClass

[`CharacterClass`](../type-aliases/CharacterClass.md)

##### alignment

[`CharacterAlignment`](../type-aliases/CharacterAlignment.md)

#### Returns

`Character`

## Properties

### id

> **id**: `string`

Defined in: [entities/Character.ts:16](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L16)

#### Implementation of

`ICharacter.id`

***

### name

> **name**: `string`

Defined in: [entities/Character.ts:17](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L17)

#### Implementation of

`ICharacter.name`

***

### race

> **race**: [`CharacterRace`](../type-aliases/CharacterRace.md)

Defined in: [entities/Character.ts:18](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L18)

#### Implementation of

`ICharacter.race`

***

### class

> **class**: [`CharacterClass`](../type-aliases/CharacterClass.md)

Defined in: [entities/Character.ts:19](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L19)

#### Implementation of

`ICharacter.class`

***

### alignment

> **alignment**: [`CharacterAlignment`](../type-aliases/CharacterAlignment.md)

Defined in: [entities/Character.ts:20](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L20)

#### Implementation of

`ICharacter.alignment`

***

### level

> **level**: `number`

Defined in: [entities/Character.ts:21](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L21)

#### Implementation of

`ICharacter.level`

***

### experience

> **experience**: `number`

Defined in: [entities/Character.ts:22](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L22)

#### Implementation of

`ICharacter.experience`

***

### stats

> **stats**: [`CharacterStats`](../interfaces/CharacterStats.md)

Defined in: [entities/Character.ts:23](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L23)

#### Implementation of

`ICharacter.stats`

***

### baseStats

> **baseStats**: [`CharacterStats`](../interfaces/CharacterStats.md)

Defined in: [entities/Character.ts:24](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L24)

#### Implementation of

`ICharacter.baseStats`

***

### hp

> **hp**: `number`

Defined in: [entities/Character.ts:25](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L25)

#### Implementation of

`ICharacter.hp`

***

### maxHp

> **maxHp**: `number`

Defined in: [entities/Character.ts:26](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L26)

#### Implementation of

`ICharacter.maxHp`

***

### mp

> **mp**: `number`

Defined in: [entities/Character.ts:27](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L27)

#### Implementation of

`ICharacter.mp`

***

### maxMp

> **maxMp**: `number`

Defined in: [entities/Character.ts:28](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L28)

#### Implementation of

`ICharacter.maxMp`

***

### ac

> **ac**: `number`

Defined in: [entities/Character.ts:29](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L29)

#### Implementation of

`ICharacter.ac`

***

### status

> **status**: [`CharacterStatus`](../type-aliases/CharacterStatus.md)

Defined in: [entities/Character.ts:30](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L30)

#### Implementation of

`ICharacter.status`

***

### age

> **age**: `number`

Defined in: [entities/Character.ts:31](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L31)

#### Implementation of

`ICharacter.age`

***

### gold

> **gold**: `number`

Defined in: [entities/Character.ts:32](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L32)

#### Implementation of

`ICharacter.gold`

***

### equipment

> **equipment**: [`Equipment`](../interfaces/Equipment.md)

Defined in: [entities/Character.ts:33](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L33)

#### Implementation of

`ICharacter.equipment`

***

### inventory

> **inventory**: [`Item`](../interfaces/Item.md)[]

Defined in: [entities/Character.ts:34](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L34)

#### Implementation of

`ICharacter.inventory`

***

### spells

> **spells**: [`Spell`](../interfaces/Spell.md)[]

Defined in: [entities/Character.ts:35](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L35)

#### Implementation of

`ICharacter.spells`

***

### isDead

> **isDead**: `boolean`

Defined in: [entities/Character.ts:36](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L36)

#### Implementation of

`ICharacter.isDead`

***

### deathCount

> **deathCount**: `number`

Defined in: [entities/Character.ts:37](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L37)

#### Implementation of

`ICharacter.deathCount`

## Methods

### rollStats()

> `private` **rollStats**(): [`CharacterStats`](../interfaces/CharacterStats.md)

Defined in: [entities/Character.ts:78](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L78)

#### Returns

[`CharacterStats`](../interfaces/CharacterStats.md)

***

### meetsClassRequirements()

> `private` **meetsClassRequirements**(`stats`): `boolean`

Defined in: [entities/Character.ts:111](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L111)

#### Parameters

##### stats

[`CharacterStats`](../interfaces/CharacterStats.md)

#### Returns

`boolean`

***

### applyRaceModifiers()

> `private` **applyRaceModifiers**(): `void`

Defined in: [entities/Character.ts:154](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L154)

#### Returns

`void`

***

### getStartingAge()

> `private` **getStartingAge**(): `number`

Defined in: [entities/Character.ts:188](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L188)

#### Returns

`number`

***

### calculateMaxHp()

> `private` **calculateMaxHp**(): `number`

Defined in: [entities/Character.ts:196](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L196)

#### Returns

`number`

***

### calculateMaxMp()

> `private` **calculateMaxMp**(): `number`

Defined in: [entities/Character.ts:203](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L203)

#### Returns

`number`

***

### canCastSpells()

> `private` **canCastSpells**(): `boolean`

Defined in: [entities/Character.ts:220](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L220)

#### Returns

`boolean`

***

### learnStartingSpells()

> `private` **learnStartingSpells**(): `void`

Defined in: [entities/Character.ts:224](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L224)

#### Returns

`void`

***

### levelUp()

> **levelUp**(): `void`

Defined in: [entities/Character.ts:256](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L256)

#### Returns

`void`

***

### takeDamage()

> **takeDamage**(`amount`): `void`

Defined in: [entities/Character.ts:274](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L274)

#### Parameters

##### amount

`number`

#### Returns

`void`

***

### heal()

> **heal**(`amount`): `void`

Defined in: [entities/Character.ts:283](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L283)

#### Parameters

##### amount

`number`

#### Returns

`void`

***

### resurrect()

> **resurrect**(): `void`

Defined in: [entities/Character.ts:288](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L288)

#### Returns

`void`

***

### getExperienceForNextLevel()

> **getExperienceForNextLevel**(): `number`

Defined in: [entities/Character.ts:310](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L310)

#### Returns

`number`

***

### addExperience()

> **addExperience**(`amount`): `boolean`

Defined in: [entities/Character.ts:314](https://github.com/the4ofus/drpg2/blob/main/src/entities/Character.ts#L314)

#### Parameters

##### amount

`number`

#### Returns

`boolean`
