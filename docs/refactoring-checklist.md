# Refactoring Checklist

**Status as of:** 2025-11-10
**Branch:** refactor/code-review
**Source:** Comprehensive Code Review (ai/logs/comprehensive-code-review.md)

## Progress Overview

- **Critical Issues:** 7 total → 6 completed ✅, 1 remaining ⬜
- **Major Issues:** 9 total → 7 completed ✅, 2 remaining ⬜
- **Minor Issues:** 6 total → 6 completed ✅, 0 remaining ⬜

---

## ✅ COMPLETED ITEMS

### Critical Priority

#### ✅ 1.1 & 1.2: UIRenderingUtils Class
**Status:** COMPLETED
**Files Created:**
- `src/utils/UIRenderingUtils.ts` - Contains `drawPanel()` and `renderHeader()`
- All scenes and renderers now use shared utilities
- Eliminated ~200 lines of duplicated code across 7+ files

**Impact:** Major reduction in code duplication

---

#### ✅ 1.3 & 1.4: ServiceBasedScene Base Class
**Status:** COMPLETED
**Files Created:**
- `src/scenes/base/ServiceBasedScene.ts`

**Files Updated:**
- `src/scenes/ShopScene.ts` - extends ServiceBasedScene
- `src/scenes/TempleScene.ts` - extends ServiceBasedScene
- `src/scenes/InnScene.ts` - extends ServiceBasedScene
- `src/scenes/TavernScene.ts` - extends ServiceBasedScene
- `src/scenes/TrainingGroundsScene.ts` - extends ServiceBasedScene

**Impact:** Eliminated ~100 lines of boilerplate per scene (5 scenes)

---

#### ✅ 1.5: Replace console.* with DebugLogger
**Status:** COMPLETED
**Details:**
- Original: 51 violations across 15 files
- Remaining: Only legitimate uses in DebugLogger.ts itself and DungeonGenerator.old.ts
- All active code now uses DebugLogger consistently

**Impact:** Consistent logging, better debugging

---

#### ✅ 2.1: Refactor CombatScene God Object
**Status:** COMPLETED
**Files Created:**
- `src/scenes/combat/CombatStateManager.ts` - State management
- `src/scenes/combat/CombatUIManager.ts` - UI rendering delegation
- `src/scenes/combat/CombatInputController.ts` - Input handling

**Files Updated:**
- `src/scenes/CombatScene.ts` - Now orchestrates components instead of doing everything

**Impact:** Improved testability, maintainability, SRP compliance

---

#### ✅ 2.3: Convert InventorySystem to Instance-Based Services
**Status:** COMPLETED
**Files Created:**
- `src/systems/inventory/ItemManager.ts` - Add/remove/equip items
- `src/systems/inventory/LootGenerator.ts` - Loot generation
- `src/systems/inventory/ItemIdentifier.ts` - Identification logic
- `src/systems/inventory/EncumbranceCalculator.ts` - Weight calculations
- `src/systems/inventory/ItemDescriptionFormatter.ts` - Item descriptions

**Files Removed:**
- `src/systems/InventorySystem.ts` - Old static class removed

**Registered in ServiceContainer:** Yes, all 5 services registered

**Impact:** Eliminated static class anti-pattern, enabled testability and DI

---

### Major Priority

#### ✅ 2.2: Refactor DungeonScene God Object
**Status:** COMPLETED
**Files Created:**
- `src/systems/dungeon/DungeonStateManager.ts` - Animation, door state
- `src/systems/dungeon/DungeonUIRenderer.ts` - All rendering
- `src/systems/dungeon/DungeonMovementHandler.ts` - Movement logic
- `src/systems/dungeon/DungeonInputHandler.ts` - Input handling
- `src/systems/dungeon/DungeonItemPickupUI.ts` - Item pickup UI

**Files Updated:**
- `src/scenes/DungeonScene.ts` - Now orchestrates components

**Impact:** Improved maintainability, SRP compliance

---

#### ✅ 1.7: Consolidate Equipment Slot Mapping
**Status:** COMPLETED
**Files Created:**
- `src/utils/ItemUtils.ts` - Shared equipment slot mapping

**Files Updated:**
- Removed duplicate `getEquipSlot()` from InventorySystem and InventoryScene
- All code now uses `ItemUtils.getEquipSlot()`

**Impact:** Single source of truth for equipment slots

---

### Minor Priority

#### ✅ 5.3: Use Existing UIConstants for Magic Numbers
**Status:** COMPLETED
**Details:**
- All renderers now use `UI_CONSTANTS` from `src/config/UIConstants.ts`
- StatusPanel instantiation uses constants for positioning
- Panel colors, borders, and dimensions use constants
- No hardcoded magic numbers remaining in rendering code

**Files Updated:** All UI renderers and scenes

**Impact:** Easier to maintain UI layout, consistent styling

---

#### ✅ 2.7: Interface Segregation for StatusPanel
**Status:** COMPLETED
**Details:**
- `renderCombatStatus()` method removed from base StatusPanel
- Combat-specific rendering handled by CombatUIManager
- StatusPanel is now cleaner with focused responsibility

**Files Updated:**
- `src/ui/StatusPanel.ts` - Combat-specific method removed
- `src/scenes/combat/CombatUIManager.ts` - Handles combat status rendering

**Impact:** Cleaner interfaces, better separation of concerns

---

#### ✅ 4.1: Remove doorPassageState Dead Code
**Status:** COMPLETED
**Files Updated:**
- `src/scenes/DungeonScene.ts` - doorPassageState property and methods removed

**Impact:** Cleaner codebase

---

#### ✅ 4.2: Remove canRun Deprecated Property
**Status:** COMPLETED
**Files Updated:**
- `src/systems/CombatSystem.ts` - canRun property removed from Encounter interface

**Impact:** Cleaner codebase

---

#### ✅ Partial 2.5 & 2.6: Dependency Injection Implementation
**Status:** PARTIALLY COMPLETED
**Details:**
- CombatSystem constructor now accepts optional dependencies
- Falls back to getInstance() if not provided
- Enables testing with mock dependencies
- Still some singletons that use getInstance() directly without DI option

**Files Updated:**
- `src/systems/CombatSystem.ts` - Constructor with optional DI parameters

**Remaining Work:** See Issue 2.6 below for full DI implementation

**Impact:** Improved testability

---

#### ✅ 3.1: Fix Entity Type Checking (Remove 'as any')
**Status:** COMPLETED
**Details:** See detailed entry under Minor Priority section above
**Date Completed:** 2025-11-10

---

#### ✅ 5.1: Standardize Error Handling Across Scenes
**Status:** COMPLETED
**Details:** See detailed entry under Minor Priority section above
**Date Completed:** 2025-11-10

---

## ⬜ REMAINING WORK

### Critical Priority

None remaining!

---

### Major Priority

#### ⬜ 2.4: Implement Command Pattern for Combat Actions
**Status:** NOT STARTED
**Severity:** MAJOR
**Current State:** Switch statement still exists in CombatSystem.executePlayerAction()

**Files Affected:**
- `src/systems/CombatSystem.ts:155-178` - Switch statement for actions

**Recommended Implementation:**
1. Create `CombatAction` interface
2. Implement action classes:
   - `AttackAction.ts`
   - `CastSpellAction.ts`
   - `DefendAction.ts`
   - `UseItemAction.ts`
   - `FleeAction.ts`
3. Create `CombatActionRegistry` to manage actions
4. Replace switch statement with registry lookup

**Benefits:**
- Open/Closed Principle compliance
- Easy to add new actions without modifying CombatSystem
- Each action is independently testable

**Estimated Effort:** 1-2 days

**Reference:** Full implementation in comprehensive review Issue 2.4

---

#### ⬜ 2.6: Complete Dependency Injection for Remaining Singletons
**Status:** PARTIALLY COMPLETED
**Severity:** MAJOR
**Current State:**
- CombatSystem has optional DI (✅)
- Many other systems still use `.getInstance()` directly without DI option

**Systems Needing DI:**
- ModifierSystem - Used directly via getInstance()
- SpellRegistry - Used directly via getInstance()
- Other singleton systems

**Recommended Implementation:**
1. Add all singletons to ServiceContainer
2. Modify constructors to accept optional dependencies with getInstance() fallback
3. Use GameServices.getX() methods instead of direct getInstance() calls

**Benefits:**
- Better testability across entire codebase
- Consistent dependency management
- Can inject different implementations for testing

**Estimated Effort:** 1-2 days

**Reference:** Comprehensive review Issue 2.6

---

### Minor Priority

#### ✅ 3.1: Fix Entity Type Checking (Remove 'as any')
**Status:** COMPLETED
**Severity:** MINOR → **MEDIUM** (scope is larger than originally thought)
**Original State:** Codebase-wide issue with `as any` casts (288 occurrences across 40 files)
**Final State:** Entity-related type casts eliminated (20 removed), remaining are legitimate browser/global object access

**Changes Made:**

1. **Updated Type Definitions:**
   - Added `knownSpells: string[]` to `ICharacter` interface
   - Confirmed `id: string` exists on both `ICharacter` and `Monster` interfaces

2. **Fixed EntityUtils.ts:**
   - Removed `(entity as any).resistances` - now returns 0 for characters (equipment resistances handled elsewhere)
   - Removed `(entity as any).magicResistance` - now returns 0 for characters
   - Both methods use proper type guards

3. **Fixed Type Casts in Systems:**
   - `CombatSystem.ts`: Changed `(nextUnit as any).id` → `nextUnit.id` (both types have id)
   - `CombatScene.ts`: Changed `(currentUnit as any).knownSpells` → proper type guard with `EntityUtils.isCharacter()`
   - `StatusEffectSystem.ts`: Changed 4 occurrences of `(target as any).id` → `target.id`
   - `CombatStateManager.ts`: Changed `(monster as any).id` → `monster.id`
   - `SpellEffectProcessor.ts`: Changed `saveType as any` → proper `SaveType` type
   - `StatusEffect.ts`: Changed `(target as any).isDead` → `target.isDead`

4. **Verification:**
   - TypeScript compilation passes with no errors
   - Game loads and runs correctly in browser
   - AI Interface functional with no runtime errors

**Impact:**
- 20 entity-related type casts removed
- Type-safe entity property access throughout codebase
- Better IDE support and autocomplete for entity operations
- Compile-time type checking prevents errors
- Remaining 72 'as any' casts in production code are legitimate (window.*, browser APIs, test mode)

**Date Completed:** 2025-11-10

---

#### ✅ 5.1: Standardize Error Handling Across Scenes
**Status:** COMPLETED
**Severity:** MINOR
**Original State:**
- CombatScene had try-catch blocks and error handling
- Most other scenes didn't handle errors consistently
- No standardized error handling pattern

**Changes Made:**

1. **Added Error Handling Methods to Base Scene Class:**
   - `protected handleError(error: Error, context: string, severity?: ErrorSeverity)` - Logs errors with full context
   - `protected safeExecute<T>(fn: () => T, context: string, fallback?: T, severity?: ErrorSeverity)` - Wraps operations with automatic error handling

2. **Enhanced SceneManager with Comprehensive Error Handling:**
   - Wrapped `enter()` calls with try-catch (ErrorSeverity.HIGH)
   - Wrapped `exit()` calls with try-catch (ErrorSeverity.MEDIUM)
   - Wrapped `update()` calls with try-catch (ErrorSeverity.MEDIUM)
   - Wrapped `render()` calls with try-catch (ErrorSeverity.MEDIUM)
   - Wrapped `renderLayered()` calls with try-catch (ErrorSeverity.MEDIUM)
   - Wrapped `handleInput()` calls with try-catch (ErrorSeverity.MEDIUM)
   - All errors logged with scene name and full context

3. **Applied Error Handling to Critical Scene Operations:**
   - CharacterCreationScene: `generatePreviewStats()` and `createCharacter()` use `safeExecute()`
   - Game.ts: `generateNewDungeon()` wrapped with try-catch (ErrorSeverity.CRITICAL)

4. **Verification:**
   - TypeScript compilation passes with no errors
   - Browser testing confirms error handling works correctly
   - No JavaScript errors in console
   - Error logging system functional (0 errors at startup)

**Impact:**
- Consistent error management across entire application
- Better error reporting and debugging with full context
- Prevents crashes from unhandled errors in scene lifecycle
- All scene errors logged to ErrorHandler for tracking
- Improved user experience - errors don't crash the game

**Date Completed:** 2025-11-10

---

#### ⬜ 5.2: Fix StatusPanel Rendering Context Confusion
**Status:** CONFIRMED
**Severity:** MINOR
**Original Issue:** StatusPanel stores its own render context but also accepts ctx parameter

**Current State:** Issue persists in `src/ui/StatusPanel.ts`
- Line 7: Stores `private ctx: CanvasRenderingContext2D` in constructor
- Line 23: `render()` method accepts optional `ctx?: CanvasRenderingContext2D` parameter
- Line 24: Uses fallback pattern `const renderCtx = ctx || this.ctx`

**Problem:**
This dual-context pattern creates confusion about which context should be used and makes the component less flexible. It's unclear whether StatusPanel "owns" a context or should be purely stateless.

**Recommended Fix:**
Choose one approach:
1. **Option A (Stateless):** Remove stored `ctx`, require it as parameter in all methods
2. **Option B (Stateful):** Remove optional parameter, always use stored context

**Recommended: Option A** for consistency with other UI components and better testability.

**Benefits:**
- Clearer ownership model
- Easier to test with mock contexts
- Consistent with other refactored components

**Estimated Effort:** 1-2 hours

**Reference:** Comprehensive review Issue 5.2

---

#### ⬜ 3.4: Extract Shared Render Logic in DungeonScene
**Status:** CONFIRMED
**Severity:** MINOR
**Original Issue:** renderLayered and renderImperative duplicated logic

**Current State:** Duplication persists in `src/scenes/DungeonScene.ts` despite refactoring

**Duplicated Logic:**
Both `render()` (lines 127-141) and `renderLayered()` (lines 147-171) duplicate:
- `uiRenderer.ensureInitialized(ctx.canvas)`
- `prepareDungeonViewForRendering()` call
- `uiRenderer.renderBackground(ctx)`
- `uiRenderer.renderDungeonView(ctx)`
- `uiRenderer.render(ctx, stateContext)` for UI
- Performance monitoring wrapper (`markRenderStart/markRenderEnd/recordFrame`)

**Recommended Fix:**
Extract common rendering setup into private method:
```typescript
private executeRenderPipeline(ctx: CanvasRenderingContext2D,
                               dungeonRenderer: (ctx) => void,
                               uiRenderer: (ctx) => void): void {
  this.performanceMonitor.markRenderStart();
  this.uiRenderer.ensureInitialized(ctx.canvas);
  this.prepareDungeonViewForRendering();
  dungeonRenderer(ctx);
  uiRenderer(ctx);
  this.performanceMonitor.markRenderEnd();
  this.performanceMonitor.recordFrame();
}
```

**Benefits:**
- Single source of truth for render pipeline
- Easier to modify rendering order
- Less code duplication
- Consistent behavior between render modes

**Estimated Effort:** 2-3 hours

**Reference:** Comprehensive review Issue 3.4

---

## 📊 SUMMARY BY EFFORT

### Quick Wins (1-3 hours each)
- ⬜ 5.2: StatusPanel rendering context (1-2 hours) ✅ CONFIRMED
- ⬜ 3.4: DungeonScene render duplication (2-3 hours) ✅ CONFIRMED

### Medium Effort (4-8 hours each)
None remaining!

### Large Effort (1-2 days each)
- ⬜ 2.4: Implement Command pattern for combat actions (1-2 days)
- ⬜ 2.6: Complete dependency injection for remaining singletons (1-2 days)

---

## 📈 METRICS

**Original Issues Identified:** 22
**Issues Completed:** 14 ✅
**Issues Remaining:** 4 ⬜
**Issues N/A:** 4 (InventoryScene doesn't exist, some issues already resolved)

**Completion Rate:** 14/18 = 78%

**Lines of Code Impact:**
- Eliminated: ~500+ lines of duplicated/dead code
- Refactored: ~3000+ lines into focused classes
- Created: ~2000 lines of new, well-structured code

---

## 🎯 RECOMMENDED NEXT STEPS

### If you have 1-2 hours:
Start with **Issue 5.2** (StatusPanel rendering context) - simple architectural cleanup ✅ CONFIRMED

### If you have 2-3 hours:
Work on **Issue 3.4** (DungeonScene render duplication) - extract common render pipeline ✅ CONFIRMED

### If you have 1-2 days:
Choose one:
- **Issue 2.4** (Command pattern) - Makes combat system extensible
- **Issue 2.6** (Complete DI) - Improves testability across codebase

### Recent Completions (2025-11-10):
✅ **Issue 3.1** (Entity Type Checking) - Removed 20 entity-related 'as any' casts, improved type safety
✅ **Issue 5.1** (Standardize Error Handling) - Added consistent error handling to all scenes and SceneManager

### Verification Status:
✅ All remaining issues have been analyzed and verified
✅ Issues 5.2 and 3.4 confirmed - ready to work on
✅ Issues 3.1 and 5.1 **COMPLETED** 2025-11-10
✅ Issues 2.4 and 2.6 remain as originally documented

---

## 📚 REFERENCES

- **Full Review:** `ai/logs/comprehensive-code-review.md`
- **SOLID Principles:** https://en.wikipedia.org/wiki/SOLID
- **Command Pattern:** https://refactoring.guru/design-patterns/command
- **Project Guidelines:** `CLAUDE.md`

---

**Last Updated:** 2025-11-10 (Issues 3.1 and 5.1 completed)
**Next Review:** After completing remaining issues or discovering new refactoring opportunities

**Recent Work Notes (2025-11-10):**

- **Issue 3.1 COMPLETED**: Fixed entity type checking - removed 20 'as any' casts
  - Updated ICharacter interface to include knownSpells
  - Fixed EntityUtils resistance methods to be type-safe
  - Eliminated type casts in CombatSystem, CombatScene, StatusEffectSystem, CombatStateManager, SpellEffectProcessor, StatusEffect
  - All changes verified with TypeScript compilation and runtime testing
  - Remaining 72 'as any' in production code are legitimate (window.*, browser APIs, test mode)

- **Issue 5.1 COMPLETED**: Standardized error handling across scenes
  - Added handleError() and safeExecute() methods to base Scene class
  - Enhanced SceneManager with comprehensive try-catch for all lifecycle methods (enter, exit, update, render, renderLayered, handleInput)
  - Applied error handling to critical operations (character creation, dungeon generation)
  - All errors logged with proper context and severity levels
  - Prevents game crashes from unhandled errors

**Previous Verification Notes:**
- All remaining issues analyzed and current state documented
- Issues 5.2 and 3.4 confirmed and ready for implementation
- Issues 2.4 and 2.6 remain accurate as originally documented
