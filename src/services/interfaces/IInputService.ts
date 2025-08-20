import { InputManager } from '../../core/Input';

export interface IInputService {
  getInputManager(): InputManager;
  setKeyPressCallback(callback: (key: string) => boolean): void;
  cleanup(): void;
}

export interface IMovementInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}