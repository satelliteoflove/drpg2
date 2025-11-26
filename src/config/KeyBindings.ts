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

  static formatKeyForDisplay(key: string): string {
    const lower = key.toLowerCase();
    const specialKeys: Record<string, string> = {
      'arrowup': '\u2191',
      'arrowdown': '\u2193',
      'arrowleft': '\u2190',
      'arrowright': '\u2192',
      'enter': 'ENTER',
      'escape': 'ESC',
      'tab': 'TAB',
      'space': 'SPACE',
      'pageup': 'PgUp',
      'pagedown': 'PgDn',
      'backspace': 'BKSP',
      'delete': 'DEL',
      'home': 'HOME',
      'end': 'END',
      'insert': 'INS',
    };
    if (specialKeys[lower]) {
      return specialKeys[lower];
    }
    if (lower.includes('+')) {
      const parts = lower.split('+');
      const modifier = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const mainKey = this.formatKeyForDisplay(parts.slice(1).join('+'));
      return `${modifier}+${mainKey}`;
    }
    return key.toUpperCase();
  }

  static getMovementKeysDisplay(): string {
    const m = KEY_BINDINGS.movement;
    const primary = `${this.formatKeyForDisplay(m.up)}${this.formatKeyForDisplay(m.left)}${this.formatKeyForDisplay(m.down)}${this.formatKeyForDisplay(m.right)}`;
    const alternate = `${this.formatKeyForDisplay(m.alternateUp)}${this.formatKeyForDisplay(m.alternateLeft)}${this.formatKeyForDisplay(m.alternateDown)}${this.formatKeyForDisplay(m.alternateRight)}`;
    return `${primary}/${alternate}`;
  }

  static getDungeonControlsDisplay(): string {
    const actions = KEY_BINDINGS.dungeonActions;
    const movement = this.getMovementKeysDisplay();
    const map = this.formatKeyForDisplay(actions.map);
    const camp = this.formatKeyForDisplay(actions.camp);
    return `${movement}: Move | ENTER: Interact | ${map}: Map | ${camp}: Camp`;
  }
}
