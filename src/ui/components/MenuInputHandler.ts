import { GameUtilities } from '../../utils/GameUtilities';
import { KEY_BINDINGS } from '../../config/KeyBindings';

export interface MenuState {
  selectedIndex: number;
  maxIndex: number;
  wrapAround?: boolean;
}

export interface MenuAction {
  type: 'navigate' | 'confirm' | 'cancel' | 'none';
  newIndex?: number;
}

export class MenuInputHandler {
  private static readonly UP_KEYS = [KEY_BINDINGS.menu.up, KEY_BINDINGS.menu.alternateUp];
  private static readonly DOWN_KEYS = [KEY_BINDINGS.menu.down, KEY_BINDINGS.menu.alternateDown];
  private static readonly LEFT_KEYS = [KEY_BINDINGS.movement.left, KEY_BINDINGS.movement.alternateLeft];
  private static readonly RIGHT_KEYS = [KEY_BINDINGS.movement.right, KEY_BINDINGS.movement.alternateRight];

  static handleMenuInput(
    key: string,
    menuState: MenuState,
    options: {
      allowHorizontal?: boolean;
      onConfirm?: () => void;
      onCancel?: () => void;
      onNavigate?: (newIndex: number) => void;
    } = {}
  ): MenuAction {
    const { selectedIndex, maxIndex, wrapAround = false } = menuState;
    const { allowHorizontal = false, onConfirm, onCancel, onNavigate } = options;

    const actionType = GameUtilities.isActionKey(key);
    if (actionType === 'confirm') {
      onConfirm?.();
      return { type: 'confirm' };
    }

    if (actionType === 'cancel') {
      onCancel?.();
      return { type: 'cancel' };
    }

    const navigationResult = GameUtilities.handleMenuNavigation(
      key,
      selectedIndex,
      maxIndex,
      { wrapAround }
    );

    if (navigationResult.handled) {
      onNavigate?.(navigationResult.newIndex);
      return { type: 'navigate', newIndex: navigationResult.newIndex };
    }

    if (allowHorizontal) {
      if (this.LEFT_KEYS.includes(key)) {
        const newIndex = wrapAround && selectedIndex === 0 ? maxIndex : Math.max(0, selectedIndex - 1);
        onNavigate?.(newIndex);
        return { type: 'navigate', newIndex };
      }
      if (this.RIGHT_KEYS.includes(key)) {
        const newIndex = wrapAround && selectedIndex === maxIndex ? 0 : Math.min(maxIndex, selectedIndex + 1);
        onNavigate?.(newIndex);
        return { type: 'navigate', newIndex };
      }
    }

    return { type: 'none' };
  }

  static handleGridMenuInput(
    key: string,
    currentIndex: number,
    gridDimensions: { columns: number; rows: number; totalItems: number },
    options: {
      wrapAround?: boolean;
      onConfirm?: () => void;
      onCancel?: () => void;
      onNavigate?: (newIndex: number) => void;
    } = {}
  ): MenuAction {
    const { columns, totalItems } = gridDimensions;
    const { wrapAround = false, onConfirm, onCancel, onNavigate } = options;

    const actionType = GameUtilities.isActionKey(key);
    if (actionType === 'confirm') {
      onConfirm?.();
      return { type: 'confirm' };
    }

    if (actionType === 'cancel') {
      onCancel?.();
      return { type: 'cancel' };
    }

    const currentRow = Math.floor(currentIndex / columns);
    const currentCol = currentIndex % columns;
    let newIndex = currentIndex;

    if (this.UP_KEYS.includes(key)) {
      if (currentRow > 0) {
        newIndex = currentIndex - columns;
      } else if (wrapAround) {
        const lastRow = Math.floor((totalItems - 1) / columns);
        newIndex = Math.min(lastRow * columns + currentCol, totalItems - 1);
      }
    } else if (this.DOWN_KEYS.includes(key)) {
      if (currentIndex + columns < totalItems) {
        newIndex = currentIndex + columns;
      } else if (wrapAround) {
        newIndex = currentCol < totalItems ? currentCol : 0;
      }
    } else if (this.LEFT_KEYS.includes(key)) {
      if (currentCol > 0) {
        newIndex = currentIndex - 1;
      } else if (wrapAround) {
        newIndex = currentRow * columns + columns - 1;
        if (newIndex >= totalItems) {
          newIndex = totalItems - 1;
        }
      }
    } else if (this.RIGHT_KEYS.includes(key)) {
      if (currentCol < columns - 1 && currentIndex + 1 < totalItems) {
        newIndex = currentIndex + 1;
      } else if (wrapAround) {
        newIndex = currentRow * columns;
      }
    }

    if (newIndex !== currentIndex) {
      onNavigate?.(newIndex);
      return { type: 'navigate', newIndex };
    }

    return { type: 'none' };
  }

  static handlePagedMenuInput(
    key: string,
    menuState: MenuState & { currentPage: number; totalPages: number; itemsPerPage: number },
    options: {
      onConfirm?: () => void;
      onCancel?: () => void;
      onNavigate?: (newIndex: number) => void;
      onPageChange?: (newPage: number) => void;
    } = {}
  ): MenuAction {
    const basicAction = this.handleMenuInput(key, menuState, options);

    if (key === 'pageup' || key === 'q') {
      if (menuState.currentPage > 0) {
        options.onPageChange?.(menuState.currentPage - 1);
        return { type: 'navigate', newIndex: 0 };
      }
    } else if (key === 'pagedown' || key === 'e') {
      if (menuState.currentPage < menuState.totalPages - 1) {
        options.onPageChange?.(menuState.currentPage + 1);
        return { type: 'navigate', newIndex: 0 };
      }
    }

    return basicAction;
  }

  static createMenuState(
    itemCount: number,
    initialIndex: number = 0,
    wrapAround: boolean = false
  ): MenuState {
    return {
      selectedIndex: Math.min(initialIndex, Math.max(0, itemCount - 1)),
      maxIndex: Math.max(0, itemCount - 1),
      wrapAround
    };
  }
}