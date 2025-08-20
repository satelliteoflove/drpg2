[**DRPG2 - Dungeon Crawler Game Engine v1.0.0**](../README.md)

***

[DRPG2 - Dungeon Crawler Game Engine](../globals.md) / GAME\_CONFIG

# Variable: GAME\_CONFIG

> `const` **GAME\_CONFIG**: `object`

Defined in: [config/GameConstants.ts:1](https://github.com/the4ofus/drpg2/blob/main/src/config/GameConstants.ts#L1)

## Type declaration

### CANVAS

> `readonly` **CANVAS**: `object`

#### CANVAS.WIDTH

> `readonly` **WIDTH**: `1024` = `1024`

#### CANVAS.HEIGHT

> `readonly` **HEIGHT**: `768` = `768`

### ENCOUNTER

> `readonly` **ENCOUNTER**: `object`

#### ENCOUNTER.RANDOM\_RATE

> `readonly` **RANDOM\_RATE**: `0.02` = `0.02`

#### ENCOUNTER.BASE\_ZONE\_RATE

> `readonly` **BASE\_ZONE\_RATE**: `0.1` = `0.1`

#### ENCOUNTER.SURPRISE\_CHANCE

> `readonly` **SURPRISE\_CHANCE**: `0.1` = `0.1`

#### ENCOUNTER.LEVEL\_RATE\_MULTIPLIER

> `readonly` **LEVEL\_RATE\_MULTIPLIER**: `0.02` = `0.02`

### CHARACTER

> `readonly` **CHARACTER**: `object`

#### CHARACTER.MAX\_PARTY\_SIZE

> `readonly` **MAX\_PARTY\_SIZE**: `6` = `6`

#### CHARACTER.STARTING\_GOLD\_MIN

> `readonly` **STARTING\_GOLD\_MIN**: `50` = `50`

#### CHARACTER.STARTING\_GOLD\_MAX

> `readonly` **STARTING\_GOLD\_MAX**: `100` = `100`

#### CHARACTER.STARTING\_AGE

> `readonly` **STARTING\_AGE**: `object`

#### CHARACTER.STARTING\_AGE.HUMAN

> `readonly` **HUMAN**: `18` = `18`

#### CHARACTER.STARTING\_AGE.ELF

> `readonly` **ELF**: `75` = `75`

#### CHARACTER.STARTING\_AGE.DWARF

> `readonly` **DWARF**: `50` = `50`

#### CHARACTER.STARTING\_AGE.GNOME

> `readonly` **GNOME**: `60` = `60`

#### CHARACTER.STARTING\_AGE.HOBBIT

> `readonly` **HOBBIT**: `30` = `30`

#### CHARACTER.AGE\_VARIANCE

> `readonly` **AGE\_VARIANCE**: `5` = `5`

#### CHARACTER.STAT\_MIN

> `readonly` **STAT\_MIN**: `3` = `3`

#### CHARACTER.STAT\_MAX

> `readonly` **STAT\_MAX**: `18` = `18`

#### CHARACTER.LEVEL\_UP\_STAT\_CHANCE

> `readonly` **LEVEL\_UP\_STAT\_CHANCE**: `0.3` = `0.3`

### COMBAT

> `readonly` **COMBAT**: `object`

#### COMBAT.MONSTER\_TURN\_DELAY

> `readonly` **MONSTER\_TURN\_DELAY**: `1000` = `1000`

#### COMBAT.MAX\_RECURSION\_DEPTH

> `readonly` **MAX\_RECURSION\_DEPTH**: `100` = `100`

### DEATH\_SYSTEM

> `readonly` **DEATH\_SYSTEM**: `object`

#### DEATH\_SYSTEM.BASE\_SURVIVAL\_CHANCE

> `readonly` **BASE\_SURVIVAL\_CHANCE**: `0.5` = `0.5`

#### DEATH\_SYSTEM.DEATH\_PENALTY\_MULTIPLIER

> `readonly` **DEATH\_PENALTY\_MULTIPLIER**: `0.1` = `0.1`

#### DEATH\_SYSTEM.VITALITY\_BONUS\_DIVISOR

> `readonly` **VITALITY\_BONUS\_DIVISOR**: `2` = `2`

#### DEATH\_SYSTEM.LEVEL\_BONUS\_MULTIPLIER

> `readonly` **LEVEL\_BONUS\_MULTIPLIER**: `0.02` = `0.02`

#### DEATH\_SYSTEM.MIN\_SURVIVAL\_CHANCE

> `readonly` **MIN\_SURVIVAL\_CHANCE**: `0.1` = `0.1`

#### DEATH\_SYSTEM.ASH\_CHANCE\_FROM\_DEATH

> `readonly` **ASH\_CHANCE\_FROM\_DEATH**: `0.5` = `0.5`

#### DEATH\_SYSTEM.ASH\_CHANCE\_MULTIPLIER

> `readonly` **ASH\_CHANCE\_MULTIPLIER**: `0.15` = `0.15`

#### DEATH\_SYSTEM.LOST\_CHANCE\_FROM\_ASH

> `readonly` **LOST\_CHANCE\_FROM\_ASH**: `0.1` = `0.1`

#### DEATH\_SYSTEM.MAX\_DEATHS\_BEFORE\_ASH

> `readonly` **MAX\_DEATHS\_BEFORE\_ASH**: `5` = `5`

#### DEATH\_SYSTEM.VITALITY\_LOSS\_ON\_DEATH

> `readonly` **VITALITY\_LOSS\_ON\_DEATH**: `1` = `1`

#### DEATH\_SYSTEM.VITALITY\_LOSS\_ON\_ASH

> `readonly` **VITALITY\_LOSS\_ON\_ASH**: `2` = `2`

#### DEATH\_SYSTEM.AGE\_INCREASE\_ON\_DEATH

> `readonly` **AGE\_INCREASE\_ON\_DEATH**: `1` = `1`

#### DEATH\_SYSTEM.AGE\_INCREASE\_ON\_ASH

> `readonly` **AGE\_INCREASE\_ON\_ASH**: `5` = `5`

### PARTY

> `readonly` **PARTY**: `object`

#### PARTY.FORMATION\_FRONT\_SIZE

> `readonly` **FORMATION\_FRONT\_SIZE**: `3` = `3`

#### PARTY.FORMATION\_BACK\_SIZE

> `readonly` **FORMATION\_BACK\_SIZE**: `3` = `3`

#### PARTY.REST\_HP\_HEAL\_PERCENT

> `readonly` **REST\_HP\_HEAL\_PERCENT**: `0.1` = `0.1`

#### PARTY.REST\_MP\_HEAL\_PERCENT

> `readonly` **REST\_MP\_HEAL\_PERCENT**: `0.2` = `0.2`

### HP\_BONUSES

> `readonly` **HP\_BONUSES**: `object`

#### HP\_BONUSES.FIGHTER

> `readonly` **FIGHTER**: `10` = `10`

#### HP\_BONUSES.SAMURAI

> `readonly` **SAMURAI**: `8` = `8`

#### HP\_BONUSES.LORD

> `readonly` **LORD**: `8` = `8`

#### HP\_BONUSES.NINJA

> `readonly` **NINJA**: `6` = `6`

#### HP\_BONUSES.PRIEST

> `readonly` **PRIEST**: `6` = `6`

#### HP\_BONUSES.BISHOP

> `readonly` **BISHOP**: `4` = `4`

#### HP\_BONUSES.THIEF

> `readonly` **THIEF**: `4` = `4`

#### HP\_BONUSES.MAGE

> `readonly` **MAGE**: `3` = `3`

### MP\_BASE

> `readonly` **MP\_BASE**: `object`

#### MP\_BASE.MAGE\_PRIEST\_BASE

> `readonly` **MAGE\_PRIEST\_BASE**: `3` = `3`

#### MP\_BASE.HYBRID\_CLASS\_BASE

> `readonly` **HYBRID\_CLASS\_BASE**: `2` = `2`

### SPELLCASTER\_CLASSES

> `readonly` **SPELLCASTER\_CLASSES**: readonly \[`"Mage"`, `"Priest"`, `"Bishop"`, `"Samurai"`, `"Lord"`, `"Ninja"`\]

### DUNGEON

> `readonly` **DUNGEON**: `object`

#### DUNGEON.DEFAULT\_WIDTH

> `readonly` **DEFAULT\_WIDTH**: `20` = `20`

#### DUNGEON.DEFAULT\_HEIGHT

> `readonly` **DEFAULT\_HEIGHT**: `20` = `20`

#### DUNGEON.MIN\_ROOMS

> `readonly` **MIN\_ROOMS**: `5` = `5`

#### DUNGEON.MAX\_EXTRA\_ROOMS

> `readonly` **MAX\_EXTRA\_ROOMS**: `5` = `5`

#### DUNGEON.MIN\_ROOM\_SIZE

> `readonly` **MIN\_ROOM\_SIZE**: `3` = `3`

#### DUNGEON.MAX\_ROOM\_EXTRA\_SIZE

> `readonly` **MAX\_ROOM\_EXTRA\_SIZE**: `5` = `5`

#### DUNGEON.ROOM\_SEPARATION

> `readonly` **ROOM\_SEPARATION**: `1` = `1`

#### DUNGEON.CORRIDOR\_ATTEMPTS

> `readonly` **CORRIDOR\_ATTEMPTS**: `10` = `10`

#### DUNGEON.MIN\_SPECIAL\_TILES

> `readonly` **MIN\_SPECIAL\_TILES**: `3` = `3`

#### DUNGEON.MAX\_EXTRA\_SPECIAL\_TILES

> `readonly` **MAX\_EXTRA\_SPECIAL\_TILES**: `3` = `3`

#### DUNGEON.CHEST\_CHANCE

> `readonly` **CHEST\_CHANCE**: `0.3` = `0.3`

#### DUNGEON.TRAP\_CHANCE

> `readonly` **TRAP\_CHANCE**: `0.5` = `0.5`

#### DUNGEON.DOOR\_CHANCE

> `readonly` **DOOR\_CHANCE**: `0.7` = `0.7`

#### DUNGEON.MIN\_ENCOUNTER\_ZONES

> `readonly` **MIN\_ENCOUNTER\_ZONES**: `3` = `3`

#### DUNGEON.MAX\_EXTRA\_ENCOUNTER\_ZONES

> `readonly` **MAX\_EXTRA\_ENCOUNTER\_ZONES**: `3` = `3`

#### DUNGEON.MIN\_ZONE\_SIZE

> `readonly` **MIN\_ZONE\_SIZE**: `3` = `3`

#### DUNGEON.MAX\_ZONE\_EXTRA\_SIZE

> `readonly` **MAX\_ZONE\_EXTRA\_SIZE**: `5` = `5`

### EVENTS

> `readonly` **EVENTS**: `object`

#### EVENTS.TRAP\_BASE\_DAMAGE

> `readonly` **TRAP\_BASE\_DAMAGE**: `5` = `5`

#### EVENTS.TRAP\_LEVEL\_MULTIPLIER

> `readonly` **TRAP\_LEVEL\_MULTIPLIER**: `2` = `2`

#### EVENTS.TREASURE\_BASE\_GOLD

> `readonly` **TREASURE\_BASE\_GOLD**: `50` = `50`

#### EVENTS.TREASURE\_LEVEL\_MULTIPLIER

> `readonly` **TREASURE\_LEVEL\_MULTIPLIER**: `20` = `20`

#### EVENTS.DARKNESS\_DURATION

> `readonly` **DARKNESS\_DURATION**: `10` = `10`

#### EVENTS.SPINNER\_MIN\_ROTATIONS

> `readonly` **SPINNER\_MIN\_ROTATIONS**: `1` = `1`

#### EVENTS.SPINNER\_MAX\_ROTATIONS

> `readonly` **SPINNER\_MAX\_ROTATIONS**: `3` = `3`

### INVENTORY

> `readonly` **INVENTORY**: `object`

#### INVENTORY.IDENTIFICATION\_CHANCE

> `readonly` **IDENTIFICATION\_CHANCE**: `0.1` = `0.1`

#### INVENTORY.VALUE\_VARIATION

> `readonly` **VALUE\_VARIATION**: `0.1` = `0.1`

### AUTO\_SAVE

> `readonly` **AUTO\_SAVE**: `object`

#### AUTO\_SAVE.INTERVAL\_MS

> `readonly` **INTERVAL\_MS**: `30000` = `30000`

### INPUT

> `readonly` **INPUT**: `object`

#### INPUT.KEY\_REPEAT\_DELAY

> `readonly` **KEY\_REPEAT\_DELAY**: `150` = `150`

### UI

> `readonly` **UI**: `object`

#### UI.MESSAGE\_FADE\_TIME

> `readonly` **MESSAGE\_FADE\_TIME**: `10000` = `10000`

#### UI.DEBUG\_INFO\_OFFSET

> `readonly` **DEBUG\_INFO\_OFFSET**: `10` = `10`

### RENDERING

> `readonly` **RENDERING**: `object`

#### RENDERING.TARGET\_FPS

> `readonly` **TARGET\_FPS**: `60` = `60`

#### RENDERING.MIN\_FPS\_THRESHOLD

> `readonly` **MIN\_FPS\_THRESHOLD**: `30` = `30`

#### RENDERING.SPATIAL\_PARTITION\_CELL\_SIZE

> `readonly` **SPATIAL\_PARTITION\_CELL\_SIZE**: `32` = `32`

#### RENDERING.MAX\_SPRITE\_CACHE\_SIZE

> `readonly` **MAX\_SPRITE\_CACHE\_SIZE**: `100` = `100`

#### RENDERING.ENABLE\_FRUSTUM\_CULLING

> `readonly` **ENABLE\_FRUSTUM\_CULLING**: `true` = `true`

#### RENDERING.ENABLE\_DIRTY\_RECTANGLE\_TRACKING

> `readonly` **ENABLE\_DIRTY\_RECTANGLE\_TRACKING**: `true` = `true`

#### RENDERING.LAYER\_COMPOSITING

> `readonly` **LAYER\_COMPOSITING**: `true` = `true`

#### RENDERING.VSYNC

> `readonly` **VSYNC**: `true` = `true`

### COLORS

> `readonly` **COLORS**: `object`

#### COLORS.BACKGROUND

> `readonly` **BACKGROUND**: `"#000"` = `'#000'`

#### COLORS.DEBUG\_TEXT

> `readonly` **DEBUG\_TEXT**: `"#666"` = `'#666'`

#### COLORS.MAP\_GRID

> `readonly` **MAP\_GRID**: `"rgba(255, 255, 255, 0.1)"` = `'rgba(255, 255, 255, 0.1)'`

#### COLORS.LAYER\_BACKGROUND

> `readonly` **LAYER\_BACKGROUND**: `"#111"` = `'#111'`

#### COLORS.PERFORMANCE\_GOOD

> `readonly` **PERFORMANCE\_GOOD**: `"#0f0"` = `'#0f0'`

#### COLORS.PERFORMANCE\_MODERATE

> `readonly` **PERFORMANCE\_MODERATE**: `"#ff0"` = `'#ff0'`

#### COLORS.PERFORMANCE\_POOR

> `readonly` **PERFORMANCE\_POOR**: `"#f00"` = `'#f00'`

### DEBUG\_MODE

> `readonly` **DEBUG\_MODE**: `false` = `false`
