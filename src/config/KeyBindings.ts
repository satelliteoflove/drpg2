import keyBindingsData from './KeyBindings.json';

interface KeyBindings {
  movement: {
    up: string;
    down: string;
    left: string;
    right: string;
    alternateUp: string;
    alternateDown: string;
    alternateLeft: string;
    alternateRight: string;
  };
  menu: {
    up: string;
    down: string;
    alternateUp: string;
    alternateDown: string;
  };
  dungeonActions: {
    inventory: string;
    camp: string;
    map: string;
    toggleCombat: string;
    debugOverlay: string;
  };
  combat: {
    selectUp: string;
    selectDown: string;
    selectLeft: string;
    selectRight: string;
    confirm: string;
    cancel: string;
  };
  ui: {
    scrollUp: string;
    scrollDown: string;
    close: string;
  };
  inventory: {
    moveUp: string;
    moveDown: string;
    select: string;
    drop: string;
    identify: string;
    use: string;
    close: string;
  };
  characterSheet: {
    changeColor: string;
    colorPickerUp: string;
    colorPickerDown: string;
    colorPickerLeft: string;
    colorPickerRight: string;
    colorPickerConfirm: string;
    colorPickerCancel: string;
  };
}

export const KEY_BINDINGS: KeyBindings = keyBindingsData;

// Helper functions for common key binding checks
export class KeyBindingHelper {
  static isMovementKey(key: string): 'up' | 'down' | 'left' | 'right' | null {
    const movement = KEY_BINDINGS.movement;
    if (key === movement.up) return 'up';
    if (key === movement.down) return 'down';
    if (key === movement.left) return 'left';
    if (key === movement.right) return 'right';
    return null;
  }

  static isDungeonAction(key: string): keyof typeof KEY_BINDINGS.dungeonActions | null {
    const actions = KEY_BINDINGS.dungeonActions;
    for (const [action, binding] of Object.entries(actions)) {
      if (key === binding) {
        return action as keyof typeof KEY_BINDINGS.dungeonActions;
      }
    }
    return null;
  }

  static isCombatAction(key: string): keyof typeof KEY_BINDINGS.combat | null {
    const combat = KEY_BINDINGS.combat;
    for (const [action, binding] of Object.entries(combat)) {
      if (key === binding) {
        return action as keyof typeof KEY_BINDINGS.combat;
      }
    }
    return null;
  }

  static isUIAction(key: string): keyof typeof KEY_BINDINGS.ui | null {
    const ui = KEY_BINDINGS.ui;
    for (const [action, binding] of Object.entries(ui)) {
      if (key === binding) {
        return action as keyof typeof KEY_BINDINGS.ui;
      }
    }
    return null;
  }

  static isInventoryAction(key: string): keyof typeof KEY_BINDINGS.inventory | null {
    const inventory = KEY_BINDINGS.inventory;
    for (const [action, binding] of Object.entries(inventory)) {
      if (key === binding) {
        return action as keyof typeof KEY_BINDINGS.inventory;
      }
    }
    return null;
  }

  static isCharacterSheetAction(key: string): keyof typeof KEY_BINDINGS.characterSheet | null {
    const characterSheet = KEY_BINDINGS.characterSheet;
    for (const [action, binding] of Object.entries(characterSheet)) {
      if (key === binding) {
        return action as keyof typeof KEY_BINDINGS.characterSheet;
      }
    }
    return null;
  }
}
