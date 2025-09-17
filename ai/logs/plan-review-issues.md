# Plan Review - Issues Found

## Date: 2025-09-04
## Plan: plan-001-ascii-rendering-migration.yaml

## Critical Issues

### 1. Dependency Graph Problems

#### Issue: Renderer Dependency Missing
- **Problem**: `town-scene-migration` can start in parallel with `implement-canvas-renderer` but needs it to be complete
- **Fix**: Remove `town-scene-migration` from `foundation-infrastructure` downstream, add it to `implement-canvas-renderer` downstream
- **Impact**: High - would cause implementation failures

#### Issue: Scene Testing Dependencies
- **Problem**: Scene testing nodes don't explicitly depend on their migrations
- **Fix**: Each test node should have its corresponding migration as an input/dependency
- **Examples**:
  - `town-scene-testing` needs `town-scene-migration` as input
  - `shop-scene-testing` needs `shop-scene-migration` as input

### 2. Missing Components

#### Issue: Base Scene Class Missing
- **Problem**: Migrations mention "extending ASCIIState" but scenes need a common base class
- **Fix**: Add node for creating `BaseASCIIScene` class after foundation
- **Impact**: Medium - would cause code duplication

#### Issue: Input Handler Migration Missing
- **Problem**: No plan for migrating input handling to declarative system
- **Fix**: Add node for creating declarative input system
- **Impact**: High - scenes won't be interactive without this

#### Issue: Debug Logger Integration Missing
- **Problem**: Original plan emphasizes debug output but no implementation node
- **Fix**: Add node for integrating ASCII state with DebugLogger
- **Impact**: Medium - loses key debugging benefit

### 3. Logical Flow Issues

#### Issue: Renderer Tests Too Early
- **Problem**: `renderer-unit-tests` only depends on renderer, not foundation
- **Fix**: Should depend on both foundation and renderer implementation
- **Impact**: Low - tests would be incomplete

#### Issue: Integration Testing Inputs Vague
- **Problem**: Lists "All migrated scenes" as input but not specific
- **Fix**: Should explicitly list all four scene migrations as inputs
- **Impact**: Low - unclear dependencies

### 4. Missing Validation Steps

#### Issue: No Proof of Concept Validation
- **Problem**: Plan continues after TownScene without validation gate
- **Fix**: Add validation node after town-scene-testing before proceeding
- **Impact**: Medium - could waste effort if approach is flawed

#### Issue: No Performance Baseline
- **Problem**: No node for establishing performance metrics before migration
- **Fix**: Add baseline performance measurement node early
- **Impact**: Medium - can't validate "no degradation" requirement

## Recommended Changes

### 1. Restructure Dependency Chain
```
foundation-infrastructure
  └→ implement-canvas-renderer
       ├→ renderer-unit-tests
       └→ create-base-scene-class
            └→ town-scene-migration
                 └→ town-scene-testing
                      └→ validation-checkpoint
                           └→ shop-scene-migration
                                └→ (continue...)
```

### 2. Add Missing Nodes
- `create-base-scene-class` - After renderer, before any scene migration
- `implement-input-system` - Parallel with renderer implementation
- `debug-logger-integration` - After foundation
- `establish-performance-baseline` - Early, parallel with foundation
- `validation-checkpoint` - After TownScene complete

### 3. Fix Dependencies
- Remove `town-scene-migration` from `foundation-infrastructure` downstream
- Add explicit migration dependencies to all test nodes
- Add `SceneDeclaration.ts` as input to renderer tests
- List specific scenes as inputs to integration testing

### 4. Clarify Outputs
- Scene migrations should output both modified scene file AND new ASCII state class
- Test nodes should output actual test files, not just "documentation"
- Performance optimization should output specific optimized files

## Priority Fixes (Must Do)
1. Fix renderer dependency chain
2. Add base scene class node
3. Add input system node
4. Fix test dependencies

## Nice to Have Fixes
1. Add debug logger integration
2. Add performance baseline
3. Add validation checkpoint
4. Clarify outputs and inputs