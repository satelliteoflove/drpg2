[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / CharacterCreationScene

# Class: CharacterCreationScene

Defined in: [scenes/CharacterCreationScene.ts:6](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L6)

## Extends

- [`Scene`](Scene.md)

## Constructors

### Constructor

> **new CharacterCreationScene**(`gameState`, `sceneManager`): `CharacterCreationScene`

Defined in: [scenes/CharacterCreationScene.ts:27](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L27)

#### Parameters

##### gameState

[`GameState`](../interfaces/GameState.md)

##### sceneManager

[`SceneManager`](SceneManager.md)

#### Returns

`CharacterCreationScene`

#### Overrides

[`Scene`](Scene.md).[`constructor`](Scene.md#constructor)

## Properties

### name

> `protected` **name**: `string`

Defined in: [core/Scene.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L9)

#### Inherited from

[`Scene`](Scene.md).[`name`](Scene.md#name)

***

### renderManager?

> `protected` `optional` **renderManager**: [`RenderManager`](RenderManager.md)

Defined in: [core/Scene.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L10)

#### Inherited from

[`Scene`](Scene.md).[`renderManager`](Scene.md#rendermanager)

***

### gameState

> `private` **gameState**: [`GameState`](../interfaces/GameState.md)

Defined in: [scenes/CharacterCreationScene.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L7)

***

### sceneManager

> `private` **sceneManager**: [`SceneManager`](SceneManager.md)

Defined in: [scenes/CharacterCreationScene.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L8)

***

### currentStep

> `private` **currentStep**: `"name"` \| `"race"` \| `"class"` \| `"alignment"` \| `"party"` \| `"confirm"`

Defined in: [scenes/CharacterCreationScene.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L9)

***

### currentCharacter

> `private` **currentCharacter**: `Partial`\<[`Character`](Character.md)\> = `{}`

Defined in: [scenes/CharacterCreationScene.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L10)

***

### selectedIndex

> `private` **selectedIndex**: `number` = `0`

Defined in: [scenes/CharacterCreationScene.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L11)

***

### nameInput

> `private` **nameInput**: `string` = `''`

Defined in: [scenes/CharacterCreationScene.ts:12](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L12)

***

### races

> `private` **races**: [`CharacterRace`](../type-aliases/CharacterRace.md)[]

Defined in: [scenes/CharacterCreationScene.ts:14](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L14)

***

### classes

> `private` **classes**: [`CharacterClass`](../type-aliases/CharacterClass.md)[]

Defined in: [scenes/CharacterCreationScene.ts:15](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L15)

***

### alignments

> `private` **alignments**: [`CharacterAlignment`](../type-aliases/CharacterAlignment.md)[]

Defined in: [scenes/CharacterCreationScene.ts:25](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L25)

## Methods

### getName()

> **getName**(): `string`

Defined in: [core/Scene.ts:16](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L16)

#### Returns

`string`

#### Inherited from

[`Scene`](Scene.md).[`getName`](Scene.md#getname)

***

### setRenderManager()

> **setRenderManager**(`renderManager`): `void`

Defined in: [core/Scene.ts:20](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L20)

#### Parameters

##### renderManager

[`RenderManager`](RenderManager.md)

#### Returns

`void`

#### Inherited from

[`Scene`](Scene.md).[`setRenderManager`](Scene.md#setrendermanager)

***

### hasLayeredRendering()

> **hasLayeredRendering**(): `boolean`

Defined in: [core/Scene.ts:31](https://github.com/the4ofus/drpg2/blob/main/src/core/Scene.ts#L31)

#### Returns

`boolean`

#### Inherited from

[`Scene`](Scene.md).[`hasLayeredRendering`](Scene.md#haslayeredrendering)

***

### enter()

> **enter**(): `void`

Defined in: [scenes/CharacterCreationScene.ts:34](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L34)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`enter`](Scene.md#enter)

***

### exit()

> **exit**(): `void`

Defined in: [scenes/CharacterCreationScene.ts:41](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L41)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`exit`](Scene.md#exit)

***

### update()

> **update**(`_deltaTime`): `void`

Defined in: [scenes/CharacterCreationScene.ts:43](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L43)

#### Parameters

##### \_deltaTime

`number`

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`update`](Scene.md#update)

***

### render()

> **render**(`ctx`): `void`

Defined in: [scenes/CharacterCreationScene.ts:45](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L45)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`render`](Scene.md#render)

***

### renderLayered()

> **renderLayered**(`renderContext`): `void`

Defined in: [scenes/CharacterCreationScene.ts:81](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L81)

#### Parameters

##### renderContext

[`SceneRenderContext`](../interfaces/SceneRenderContext.md)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`renderLayered`](Scene.md#renderlayered)

***

### renderNameStep()

> `private` **renderNameStep**(`ctx`): `void`

Defined in: [scenes/CharacterCreationScene.ts:123](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L123)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderRaceStep()

> `private` **renderRaceStep**(`ctx`): `void`

Defined in: [scenes/CharacterCreationScene.ts:138](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L138)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderClassStep()

> `private` **renderClassStep**(`ctx`): `void`

Defined in: [scenes/CharacterCreationScene.ts:160](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L160)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderAlignmentStep()

> `private` **renderAlignmentStep**(`ctx`): `void`

Defined in: [scenes/CharacterCreationScene.ts:183](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L183)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderConfirmStep()

> `private` **renderConfirmStep**(`ctx`): `void`

Defined in: [scenes/CharacterCreationScene.ts:200](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L200)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderPartyStep()

> `private` **renderPartyStep**(`ctx`): `void`

Defined in: [scenes/CharacterCreationScene.ts:230](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L230)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderInstructions()

> `private` **renderInstructions**(`ctx`): `void`

Defined in: [scenes/CharacterCreationScene.ts:250](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L250)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### getRaceDescription()

> `private` **getRaceDescription**(`race`): `string`

Defined in: [scenes/CharacterCreationScene.ts:275](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L275)

#### Parameters

##### race

[`CharacterRace`](../type-aliases/CharacterRace.md)

#### Returns

`string`

***

### canSelectClass()

> `private` **canSelectClass**(`charClass`): `boolean`

Defined in: [scenes/CharacterCreationScene.ts:292](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L292)

#### Parameters

##### charClass

[`CharacterClass`](../type-aliases/CharacterClass.md)

#### Returns

`boolean`

***

### handleInput()

> **handleInput**(`key`): `boolean`

Defined in: [scenes/CharacterCreationScene.ts:339](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L339)

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Overrides

[`Scene`](Scene.md).[`handleInput`](Scene.md#handleinput)

***

### handleNameInput()

> `private` **handleNameInput**(`key`): `boolean`

Defined in: [scenes/CharacterCreationScene.ts:357](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L357)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### handleSelectionInput()

> `private` **handleSelectionInput**(`key`, `maxOptions`): `boolean`

Defined in: [scenes/CharacterCreationScene.ts:378](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L378)

#### Parameters

##### key

`string`

##### maxOptions

`number`

#### Returns

`boolean`

***

### selectCurrentOption()

> `private` **selectCurrentOption**(): `void`

Defined in: [scenes/CharacterCreationScene.ts:395](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L395)

#### Returns

`void`

***

### generatePreviewStats()

> `private` **generatePreviewStats**(): `void`

Defined in: [scenes/CharacterCreationScene.ts:418](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L418)

#### Returns

`void`

***

### handleConfirmInput()

> `private` **handleConfirmInput**(`key`): `boolean`

Defined in: [scenes/CharacterCreationScene.ts:425](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L425)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### handlePartyInput()

> `private` **handlePartyInput**(`key`): `boolean`

Defined in: [scenes/CharacterCreationScene.ts:447](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L447)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### createCharacter()

> `private` **createCharacter**(): `void`

Defined in: [scenes/CharacterCreationScene.ts:476](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L476)

#### Returns

`void`

***

### startOver()

> `private` **startOver**(): `void`

Defined in: [scenes/CharacterCreationScene.ts:495](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L495)

#### Returns

`void`

***

### goBack()

> `private` **goBack**(): `void`

Defined in: [scenes/CharacterCreationScene.ts:502](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L502)

#### Returns

`void`

***

### generateNewDungeon()

> `private` **generateNewDungeon**(): `void`

Defined in: [scenes/CharacterCreationScene.ts:517](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CharacterCreationScene.ts#L517)

#### Returns

`void`
