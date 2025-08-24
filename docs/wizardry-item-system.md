# Wizardry Item System Documentation

Based on research from Wizardry V: Heart of the Maelstrom, Wizardry Gaiden IV, and the classic Wizardry series. **Updated with current DRPG2 implementation details.**

## Core Item Categories

### 1. Equipment Types
- **Weapons**: Swords, Daggers, Maces, Staves, Halberds, Katanas
- **Armor**: Robes, Leather, Chain Mail, Plate Mail, Scale Mail
- **Shields**: Bucklers, Small Shields, Large Shields
- **Helmets**: Caps, Sallets, Helms, Cuirass
- **Gloves/Gauntlets**: Leather Gloves, Chain Gloves, Gauntlets
- **Boots**: Leather Boots, Iron Boots
- **Accessories**: Rings, Amulets, Cloaks

### 2. Consumables
- **Potions**: Healing, Mana restoration, Status cures
- **Scrolls**: Single-use spell items
- **Wands/Rods**: Limited-use magical items

### 3. Quest Items (Macguffins)
- Key items required for progression
- Cannot be sold to shops
- If lost, reappear at original location
- Often tied to specific NPCs or puzzles

## Item Properties and States

### Unidentified Items ✅ **IMPLEMENTED**
- Found items initially appear with `unidentifiedName` (e.g., "?Sword", "?Armor")
- Must be identified before true properties and rarity are known
- **Current Identification System**:
  - **Bishop class specialty**: Base 75% chance + 2% per level + INT bonus
  - **Other classes**: Base 50% chance + 1% per level + INT bonus  
  - **Intelligence bonus**: +5% per 2 points of INT above 10
  - **Maximum chance**: 95% (always 5% chance of failure)
  - **Critical failure**: Rolling >95% curses the item instead of identifying it
  - **Keyboard shortcut**: Press 'I' in inventory to attempt identification

### Cursed Items ✅ **IMPLEMENTED**
- **Definition**: Items that cannot be voluntarily unequipped once worn
- **Current Implementation**:
  - Items with `cursed: true` cannot be unequipped using 'U' key
  - Warning message: "Cannot remove [item] - it is cursed!"
  - **Example**: Muramasa sword (powerful but cursed weapon)
  - **Generation**: 10% chance for randomly generated items to be cursed
- **Identification Impact**: Cursed items show "[CURSED]" suffix when identified
- **Future Removal Methods**: Currently permanent (uncurse system planned)

### Blessed/Enchanted Items ✅ **IMPLEMENTED** 
- **Enchantment System**: Items have `enchantment` property (0 to +7)
- **Blessed Items**: 5% generation chance, enhanced properties
- **Current Implementation**:
  - **Enchantment levels** shown in item names (e.g., "Long Sword +2")
  - **Effect enhancement**: Item effects get +enchantment bonus
  - **Rarity-based enchantments**: Higher rarity = higher enchantment range
  - **Value scaling**: Enchanted items worth more gold
- **Invokable Items**: Items with `invokable: true` can cast spells
  - **Examples**: Staff of Mogref, Ring of Healing, Dios Stone
  - **Charges system**: `charges`/`maxCharges` for limited uses
  - **Keyboard shortcut**: Press SPACE to use/invoke items

### Broken Items
- Magic items may become mundane after invoking their power
- Example: "Sword of Fire" becomes regular "Sword" after using fire spell
- Cannot be repaired in most classic Wizardry games

## Class and Alignment Restrictions ✅ **IMPLEMENTED**

### Class-Specific Equipment
- **Current System**: Items have `classRestrictions` array property
- **Implementation**: `canClassEquipItem()` function validates restrictions
- **Enforcement**: Prevents equipping restricted items with error message
- **Visual Feedback**: Restricted items shown in gray in inventory

### Alignment Restrictions ✅ **IMPLEMENTED**  
- **Current System**: Items have `alignmentRestrictions` array property
- **Implementation**: `canAlignmentUseItem()` function validates restrictions
- **Enforcement**: Prevents equipping alignment-locked items
- **Example Use Cases**: Good-only holy items, Evil-only dark artifacts

## Equipment Slots System ✅ **IMPLEMENTED**

### Current DRPG2 Implementation
- **7 Equipment Slots**:
  - `weapon`: Primary weapon slot
  - `armor`: Body armor slot
  - `shield`: Shield/off-hand slot  
  - `helmet`: Head protection slot
  - `gauntlets`: Hand protection slot
  - `boots`: Foot protection slot
  - `accessory`: Ring/amulet/cloak slot
- **Equipment Management**:
  - Press 'Q' to equip items from inventory
  - Press 'U' to unequip items (if not cursed)
  - Press 'E' to view current equipment
  - Auto-unequip when equipping same slot type

## Inventory Management System ✅ **IMPLEMENTED**

### Party Inventory
- **Access**: Press 'I' key in dungeon to open inventory screen
- **Character Selection**: Navigate party members with UP/DOWN arrows
- **Multi-Modal Interface**:
  - **Character Select**: Choose party member to manage
  - **Inventory View**: Browse and manage individual items
  - **Equipment View**: See currently equipped items
  - **Trading System**: Transfer items between party members

### Inventory Controls
- **Navigation**: UP/DOWN arrows or W/S keys to navigate items
- **Equip Item**: Press 'Q' to equip selected item
- **Unequip Item**: Press 'U' to unequip (blocked if cursed)
- **Use Item**: Press SPACE to use consumables or invoke magic items
- **Identify Item**: Press 'I' to attempt identification
- **Drop Item**: Press 'D' to drop item on floor
- **Trade Items**: Press 'T' to trade items between characters

### Weight and Carrying Capacity ✅ **IMPLEMENTED**
- **Weight System**: Each item has `weight` property
- **Carry Capacity**: Based on character strength and class
- **Overweight Prevention**: Cannot pick up items if over capacity
- **Trade Restrictions**: Cannot trade to overloaded characters

### Floor Items and Pickup
- **Floor Storage**: Items dropped in dungeons stay on floor
- **Pickup System**: Press 'G' to pick up floor items
- **Visual Indicator**: "G: Pick Up Items" shown when items present
- **Combat Drops**: Monster loot appears on floor after victory

## Shop and Trading System 🚧 **PLANNED**

### Future Implementation
- **Identification Service**: Pay to identify unknown items safely  
- **Buying/Selling**: Shop inventory and pricing system
- **Uncurse Service**: Remove cursed items (destroys item)
- **Current Status**: Shop system not yet implemented

## Special Mechanics

### Item Persistence
- Quest items respawn if lost
- Sold items appear in shop inventory
- Dropped items in dungeon may disappear

### Identification Risk/Reward
- Successful identification reveals all properties
- Failed identification may curse the identifier
- Higher level characters have better success rates
- Bishops specialize in identification

### Magic Item Charges
- Wands and some items have limited charges
- Using the item consumes charges
- Most items break when charges depleted
- Cannot be recharged in classic games

## Current Implementation Status

### ✅ **Completed Features**
1. ✅ Unidentified state for found items with custom display names
2. ✅ Cursed item mechanics with equip-lock 
3. ✅ Class-based equipment restrictions with validation
4. ✅ 7-slot equipment system (weapon, armor, shield, helmet, gauntlets, boots, accessory)
5. ✅ Bishop identification specialization (+25% base, +2% per level)
6. ✅ Alignment restrictions for special items
7. ✅ Invokable items with charges system
8. ✅ Straightforward +0 to +7 enchantment system
9. ✅ Hybrid loot system with monster-specific drops
10. ✅ Dynamic rarity assignment with visual feedback
11. ✅ Level-scaled drop requirements
12. ✅ Weight and carrying capacity system
13. ✅ Floor item storage and pickup system
14. ✅ Party inventory management with trading

### 🚧 **Planned Features** 
1. 🚧 Shop identification and uncurse services
2. 🚧 Dual-wielding support 
3. 🚧 Quest item respawning system
4. 🚧 Advanced durability/repair mechanics (if desired)

### ⚙️ **Configuration Files**
- **Core Items**: `src/config/ItemProperties.ts` - 15 test items from Wizardry Gaiden IV
- **Game Balance**: `src/config/GameConstants.ts` - All probability and balance values
- **Type Definitions**: `src/types/GameTypes.ts` - Complete item system interfaces

## Hybrid Loot System ✅ **NEW IMPLEMENTATION**

### Monster-Specific Loot Tables
- **System**: Each monster has custom `lootDrops` configuration
- **Level Scaling**: Items can have `minLevel`/`maxLevel` requirements
- **Backward Compatibility**: Falls back to old `itemDrops` if needed
- **Examples**:
  - **Slime**: Basic potions, early-game swords (levels 1-3)
  - **Goblin**: Leather armor (levels 1-5), sleep scrolls (level 2+ requirement) 
  - **Orc**: Rare items like Muramasa (level 3+), Staff of Power (level 4+)

### Dynamic Rarity Assignment
- **Random Per Drop**: Each dropped item gets random rarity
- **Probability Distribution**:
  - **70% Common** (white text, no enchantment)
  - **25% Uncommon** (green text, +1 to +2 enchantment)
  - **4% Rare** (blue text, +3 to +4 enchantment) 
  - **1% Legendary** (orange text, +5 to +7 enchantment)

### Level-Scaled Drop System
- **Party Level Calculation**: Uses average party level for scaling
- **Min/Max Level Gating**: Prevents inappropriate drops
- **Smart Scaling**: High-level items don't drop for low-level parties
- **Progressive Unlocks**: New items become available as party advances

## Item Rarity Tiers ✅ **IMPLEMENTED**

### Common (70% drop chance)
- Base items with no enchantment
- White text in inventory
- Standard base value

### Uncommon (25% drop chance)  
- **+1 to +2 enchantment** automatically applied
- **Green text** in inventory display
- **2x value multiplier**
- **[UNCOMMON]** tag when identified

### Rare (4% drop chance)
- **+3 to +4 enchantment** automatically applied  
- **Blue text** in inventory display
- **4x value multiplier**
- **[RARE]** tag when identified

### Legendary (1% drop chance)
- **+5 to +7 enchantment** automatically applied
- **Orange text** in inventory display
- **8x value multiplier** 
- **[LEGENDARY]** tag when identified

## Test Items Collection ✅ **IMPLEMENTED**

The system includes 15 diverse test items based on Wizardry Gaiden IV:

### Weapons
- **Short Sword** - Basic starting weapon (+1 damage)
- **Long Sword** - Standard weapon (+3 damage)  
- **Muramasa** - Cursed legendary sword (+5 damage, cannot unequip)

### Armor & Protection
- **Leather Armor** - Basic protection (+2 AC)
- **Chain Mail** - Medium protection (+4 AC)
- **Shadow Cape** - Stealth cloak (+1 AC, special properties)

### Magical Accessories  
- **Ring of Healing** - Invokable healing ring (3 charges of healing spell)
- **Staff of Power** - Powerful mage staff (30 charges of Power Strike spell)

### Consumables
- **Potion** - Basic healing consumable
- **Elixir** - Advanced healing consumable
- **Dios Stone** - Divine healing stone (invokable)

### Scrolls
- **Scroll of Sleep** - Sleep spell scroll (puts enemies to sleep)
- **Scroll of Harm** - Damage spell scroll (planned)
- **Scroll of Heal** - Healing spell scroll (planned)  
- **Scroll of Power Strike** - Powerful attack spell scroll (planned)

Each item demonstrates different aspects of the system: identification states, cursed mechanics, invocation, charges, class restrictions, and rarity effects.

## Notes on Balance

- Cursed items should offer risk/reward decisions
- Identification should be meaningful but not frustrating
- Class restrictions encourage party diversity
- Shop prices should make gold management important
- Magic items should feel special but not mandatory