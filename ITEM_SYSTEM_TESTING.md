# Comprehensive Testing Guide for Item/Inventory/Drop Systems

## Prerequisites
1. Start the game with `npm run dev`
2. Open browser to `http://localhost:8080`
3. Start a new game or load existing save

## Debug Scene Access
- **Open Debug Scene**: Press `Ctrl + D` (Control + D)
- **Scroll Debug Info**: Page Up/Page Down to navigate through information
- **Return to Game**: Press `Escape` to return to previous scene
- This shows comprehensive real-time data for loot calculations, party stats, and combat info

## 1. Basic Movement and Combat Triggering

### Test Steps:
1. **Enable Combat**: Press `C` to ensure combat is enabled (check status in UI)
2. **Move Around Dungeon**: Use arrow keys or WASD to explore
3. **Trigger Combat**: 
   - Move around until random encounter occurs
   - OR press `T` to manually trigger combat

### Expected Results:
- Combat should trigger based on encounter rate
- Debug overlay shows combat system is active
- Turn order displays correctly

## 2. Item Drop System Testing

### A. Dungeon Level Multipliers
1. **Check Current Floor**: Note dungeon level in debug overlay
2. **Enter Combat**: Trigger an encounter
3. **Open Debug Scene** during/after combat (Ctrl+D)
4. **Verify Multipliers**:
   - Dungeon Level: Should match current floor
   - Dungeon Multiplier: Should be 1.0 + (level-1) * 0.5
   - Example: Floor 3 = 2.0x multiplier

### B. Party Luck System
1. **Check Party Stats** in debug scene (Ctrl+D):
   - Total Party Luck (base 60 for 6 characters with 10 luck each)
   - Individual character luck values
   - Luck Multiplier calculation
2. **Formula Verification**:
   - Luck Multiplier = 1.0 + (totalLuck - 60) * 0.005
   - Example: 80 total luck = 1.1x multiplier

### C. Drop Rate Testing
1. **Defeat Monsters** in combat
2. **Check Debug Scene** (Ctrl+D) for:
   - "Recent Rarity Rolls" section
   - Shows last 10 rolls with percentages
   - Format: "Roll X.XXX -> Rarity (XX.X% base, XX.X% modified)"
3. **Verify Drop Rates Scale**:
   - Higher dungeon levels = better chances
   - Higher party luck = better chances
   - Total multiplier shown in debug

## 3. Item Distribution System

### Test Steps:
1. **Win Combat** with multiple monsters
2. **Item Distribution Phase** begins automatically
3. **Select Character** with Up/Down arrows
4. **Assign Item** with Enter/Space
5. **Discard Item** with Escape or L

### Expected Results:
- Each character shown with inventory count (X/20)
- Items properly added to selected character
- Stackable items (potions) combine quantities
- Non-stackable items take separate slots

## 4. Inventory Management

### A. Accessing Inventory
1. **Open Inventory**: Press Tab
2. **Navigate Characters**: Left/Right arrows
3. **Navigate Items**: Up/Down arrows
4. **Item Actions**:
   - **U**: Use item (consumables)
   - **I**: Identify unknown items
   - **D**: Drop item
   - **Escape**: Close inventory

### B. Item Identification
1. **Find Unidentified Item** (shows as "?Sword" or similar)
2. **Select Item** in inventory
3. **Press I** to identify
4. **Verify**:
   - Item name reveals
   - Properties become visible
   - Item remains identified permanently

### C. Item Usage
1. **Select Consumable** (Potion, Scroll)
2. **Press U** to use
3. **Verify Effects**:
   - Healing potions restore HP
   - Mana potions restore MP
   - Scrolls cast spells
   - Quantity decreases by 1

### D. Item Dropping
1. **Select Any Item**
2. **Press D** to drop
3. **Confirm** when prompted
4. **Verify**:
   - Item removed from inventory
   - Inventory count updates

## 5. Equipment System

### A. Equipping Items
1. **Open Inventory** (Tab)
2. **Select Equipment** (weapon, armor, etc.)
3. **Press Enter** to equip
4. **Verify**:
   - Item moves to equipment slot
   - Character stats update (AC, damage)
   - Previous item returns to inventory

### B. Equipment Effects
1. **Check Character Stats** before equipping
2. **Equip Item** with bonuses
3. **Verify Stat Changes**:
   - AC changes with armor
   - Damage increases with weapons
   - Special effects apply

## 6. Advanced Loot Testing

### A. Rarity Distribution
1. **Enable Debug Overlay**
2. **Defeat Many Monsters** (10-20 encounters)
3. **Track Rarity Rolls**:
   - Common: ~70% base
   - Uncommon: ~25% base
   - Rare: ~4.5% base
   - Legendary: ~0.5% base
4. **Verify Luck Affects Rates**:
   - Higher luck = more rare/legendary
   - Lower luck = more common items

### B. Monster-Specific Loot
1. **Fight Different Monster Types**
2. **Note Drop Patterns**:
   - Goblins: Basic equipment, potions
   - Orcs: Better weapons, armor
   - Dragons: Rare items, gold
3. **Verify Level Scaling**:
   - Higher level monsters = better items
   - Boss monsters = guaranteed drops

## 7. Escape Mechanics Testing

### A. Individual Escape Chances
1. **Enter Combat**
2. **Open Debug Overlay**
3. **Check Escape Chances**:
   - Listed per character
   - Based on agility (base 50%)
   - +/- 2% per agility point above/below 10

### B. Escape Attempts
1. **Select Escape** action in combat
2. **Note Which Character** is acting
3. **Check Success Rate**:
   - High agility characters escape more
   - Low agility characters fail more
   - Party escapes together on success

## 8. Inventory Limits

### Test Steps:
1. **Fill Character Inventory** (20 items max)
2. **Attempt to Pick Up More**
3. **Verify**:
   - Warning message appears
   - Cannot exceed 20 items
   - Must drop/use items to make space

## 9. Save/Load Persistence

### Test Steps:
1. **Collect Various Items**
2. **Save Game** (through menu)
3. **Reload Page**
4. **Load Save**
5. **Verify**:
   - All items present
   - Identification status preserved
   - Equipment still equipped
   - Quantities correct

## 10. Edge Cases and Bug Testing

### A. Stack Overflow
1. **Collect Multiple Potions**
2. **Verify Stacking**:
   - Same type combines
   - Quantity displays correctly
   - Using reduces stack

### B. Full Party Distribution
1. **Get Items** with full party alive
2. **Kill Some Characters**
3. **Get More Items**
4. **Verify**:
   - Only living characters shown
   - Dead characters can't receive items

### C. Combat State Persistence
1. **Start Combat**
2. **Open/Close Debug Overlay**
3. **Continue Combat**
4. **Verify**:
   - Combat state maintained
   - Turn order preserved
   - No duplicate turns

## Debug Commands

### Quick Testing Commands:
- **T**: Trigger instant combat
- **C**: Toggle combat on/off
- **Ctrl+K**: (In combat) Instant kill all enemies
- **R**: Rest party (may trigger encounter)

## Common Issues to Watch For

1. **Items Not Appearing**: Check character inventory is not full (20 max)
2. **Stacking Issues**: Only consumables should stack
3. **Lost Items**: Check if accidentally dropped (D key)
4. **Stats Not Updating**: Re-equip item or check debug overlay
5. **Escape Failing**: Check character agility in debug overlay

## Performance Monitoring

While testing, monitor:
1. **Frame Rate**: Should stay smooth during all operations
2. **Memory Usage**: Check browser dev tools
3. **Console Errors**: F12 to open console, watch for red errors
4. **Debug Data Updates**: Should refresh in real-time

## Reporting Issues

When reporting bugs, include:
1. **Debug Overlay Screenshot** (Ctrl+, to open)
2. **Steps to Reproduce**
3. **Expected vs Actual Behavior**
4. **Browser Console Errors** (if any)
5. **Save File** (if applicable)