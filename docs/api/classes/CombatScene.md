[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / CombatScene

# Class: CombatScene

Defined in: [scenes/CombatScene.ts:7](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L7)

## Extends

- [`Scene`](Scene.md)

## Constructors

### Constructor

> **new CombatScene**(`gameState`, `sceneManager`): `CombatScene`

Defined in: [scenes/CombatScene.ts:19](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L19)

#### Parameters

##### gameState

[`GameState`](../interfaces/GameState.md)

##### sceneManager

[`SceneManager`](SceneManager.md)

#### Returns

`CombatScene`

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

Defined in: [scenes/CombatScene.ts:8](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L8)

***

### sceneManager

> `private` **sceneManager**: [`SceneManager`](SceneManager.md)

Defined in: [scenes/CombatScene.ts:9](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L9)

***

### combatSystem

> `private` **combatSystem**: [`CombatSystem`](CombatSystem.md)

Defined in: [scenes/CombatScene.ts:10](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L10)

***

### statusPanel

> `private` **statusPanel**: [`StatusPanel`](StatusPanel.md)

Defined in: [scenes/CombatScene.ts:11](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L11)

***

### messageLog

> `private` **messageLog**: [`MessageLog`](MessageLog.md)

Defined in: [scenes/CombatScene.ts:12](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L12)

***

### selectedAction

> `private` **selectedAction**: `number` = `0`

Defined in: [scenes/CombatScene.ts:13](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L13)

***

### selectedTarget

> `private` **selectedTarget**: `number` = `0`

Defined in: [scenes/CombatScene.ts:14](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L14)

***

### actionState

> `private` **actionState**: `"waiting"` \| `"select_action"` \| `"select_target"` \| `"select_spell"` = `'select_action'`

Defined in: [scenes/CombatScene.ts:15](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L15)

***

### waitingForAnimation

> `private` **waitingForAnimation**: `boolean` = `false`

Defined in: [scenes/CombatScene.ts:17](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L17)

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

Defined in: [scenes/CombatScene.ts:26](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L26)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`enter`](Scene.md#enter)

***

### exit()

> **exit**(): `void`

Defined in: [scenes/CombatScene.ts:33](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L33)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`exit`](Scene.md#exit)

***

### initializeCombat()

> `private` **initializeCombat**(): `void`

Defined in: [scenes/CombatScene.ts:37](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L37)

#### Returns

`void`

***

### generateMonsters()

> `private` **generateMonsters**(): [`Monster`](../interfaces/Monster.md)[]

Defined in: [scenes/CombatScene.ts:46](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L46)

#### Returns

[`Monster`](../interfaces/Monster.md)[]

***

### update()

> **update**(`_deltaTime`): `void`

Defined in: [scenes/CombatScene.ts:103](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L103)

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

Defined in: [scenes/CombatScene.ts:110](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L110)

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

Defined in: [scenes/CombatScene.ts:123](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L123)

#### Parameters

##### renderContext

[`SceneRenderContext`](../interfaces/SceneRenderContext.md)

#### Returns

`void`

#### Overrides

[`Scene`](Scene.md).[`renderLayered`](Scene.md#renderlayered)

***

### initializeUI()

> `private` **initializeUI**(`canvas`): `void`

Defined in: [scenes/CombatScene.ts:145](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L145)

#### Parameters

##### canvas

`HTMLCanvasElement`

#### Returns

`void`

***

### renderCombatArea()

> `private` **renderCombatArea**(`ctx`): `void`

Defined in: [scenes/CombatScene.ts:152](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L152)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderMonsters()

> `private` **renderMonsters**(`ctx`, `monsters`): `void`

Defined in: [scenes/CombatScene.ts:167](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L167)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

##### monsters

[`Monster`](../interfaces/Monster.md)[]

#### Returns

`void`

***

### renderParty()

> `private` **renderParty**(`ctx`): `void`

Defined in: [scenes/CombatScene.ts:208](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L208)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderUI()

> `private` **renderUI**(`ctx`): `void`

Defined in: [scenes/CombatScene.ts:240](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L240)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderActionMenu()

> `private` **renderActionMenu**(`ctx`): `void`

Defined in: [scenes/CombatScene.ts:249](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L249)

#### Parameters

##### ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### renderCombatInfo()

> `private` **renderCombatInfo**(`_ctx`): `void`

Defined in: [scenes/CombatScene.ts:286](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L286)

#### Parameters

##### \_ctx

`CanvasRenderingContext2D`

#### Returns

`void`

***

### processAITurn()

> `private` **processAITurn**(): `void`

Defined in: [scenes/CombatScene.ts:302](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L302)

#### Returns

`void`

***

### handleInput()

> **handleInput**(`key`): `boolean`

Defined in: [scenes/CombatScene.ts:316](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L316)

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Overrides

[`Scene`](Scene.md).[`handleInput`](Scene.md#handleinput)

***

### handleActionSelection()

> `private` **handleActionSelection**(`key`): `boolean`

Defined in: [scenes/CombatScene.ts:328](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L328)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### handleTargetSelection()

> `private` **handleTargetSelection**(`key`): `boolean`

Defined in: [scenes/CombatScene.ts:352](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L352)

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### executeAction()

> `private` **executeAction**(`action`): `void`

Defined in: [scenes/CombatScene.ts:375](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L375)

#### Parameters

##### action

`string`

#### Returns

`void`

***

### endCombat()

> `private` **endCombat**(`victory`, `rewards?`): `void`

Defined in: [scenes/CombatScene.ts:397](https://github.com/the4ofus/drpg2/blob/main/src/scenes/CombatScene.ts#L397)

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
