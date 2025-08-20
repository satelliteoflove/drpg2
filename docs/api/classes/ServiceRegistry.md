[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / ServiceRegistry

# Class: ServiceRegistry

Defined in: services/ServiceRegistry.ts:3

## Constructors

### Constructor

> `private` **new ServiceRegistry**(): `ServiceRegistry`

Defined in: services/ServiceRegistry.ts:7

#### Returns

`ServiceRegistry`

## Properties

### instance

> `private` `static` **instance**: `ServiceRegistry`

Defined in: services/ServiceRegistry.ts:4

***

### gameServices?

> `private` `optional` **gameServices**: [`GameServices`](GameServices.md)

Defined in: services/ServiceRegistry.ts:5

## Methods

### getInstance()

> `static` **getInstance**(): `ServiceRegistry`

Defined in: services/ServiceRegistry.ts:9

#### Returns

`ServiceRegistry`

***

### initialize()

> **initialize**(`dependencies`): `void`

Defined in: services/ServiceRegistry.ts:16

#### Parameters

##### dependencies

###### canvas

`HTMLCanvasElement`

#### Returns

`void`

***

### getGameServices()

> **getGameServices**(): [`GameServices`](GameServices.md)

Defined in: services/ServiceRegistry.ts:20

#### Returns

[`GameServices`](GameServices.md)

***

### dispose()

> **dispose**(): `void`

Defined in: services/ServiceRegistry.ts:27

#### Returns

`void`

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: services/ServiceRegistry.ts:34

#### Returns

`boolean`
