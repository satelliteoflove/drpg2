[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / ServiceContainer

# Class: ServiceContainer

Defined in: services/ServiceContainer.ts:13

## Constructors

### Constructor

> **new ServiceContainer**(): `ServiceContainer`

#### Returns

`ServiceContainer`

## Properties

### registrations

> `private` **registrations**: `Map`\<`string`, `ServiceRegistration`\<`any`\>\>

Defined in: services/ServiceContainer.ts:14

***

### instances

> `private` **instances**: `Map`\<`string`, `any`\>

Defined in: services/ServiceContainer.ts:15

## Methods

### register()

> **register**\<`T`\>(`identifier`, `factory`, `options`): `void`

Defined in: services/ServiceContainer.ts:17

#### Type Parameters

##### T

`T`

#### Parameters

##### identifier

`ServiceIdentifier`\<`T`\>

##### factory

() => `T`

##### options

###### singleton?

`boolean`

#### Returns

`void`

***

### registerInstance()

> **registerInstance**\<`T`\>(`identifier`, `instance`): `void`

Defined in: services/ServiceContainer.ts:31

#### Type Parameters

##### T

`T`

#### Parameters

##### identifier

`ServiceIdentifier`\<`T`\>

##### instance

`T`

#### Returns

`void`

***

### resolve()

> **resolve**\<`T`\>(`identifier`): `T`

Defined in: services/ServiceContainer.ts:41

#### Type Parameters

##### T

`T`

#### Parameters

##### identifier

`ServiceIdentifier`\<`T`\>

#### Returns

`T`

***

### has()

> **has**\<`T`\>(`identifier`): `boolean`

Defined in: services/ServiceContainer.ts:59

#### Type Parameters

##### T

`T`

#### Parameters

##### identifier

`ServiceIdentifier`\<`T`\>

#### Returns

`boolean`

***

### clear()

> **clear**(): `void`

Defined in: services/ServiceContainer.ts:63

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: services/ServiceContainer.ts:68

#### Returns

`void`
