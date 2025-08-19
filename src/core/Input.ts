export class InputManager {
    private keys: Set<string> = new Set();
    private keyHandlers: Map<string, () => void> = new Map();
    private onKeyPress?: (key: string) => boolean;
    private lastKeyPressTime: Map<string, number> = new Map();
    private keyRepeatDelay: number = 150; // milliseconds

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            this.keys.add(key);
            
            // Check if enough time has passed since the last press of this key
            const now = Date.now();
            const lastPress = this.lastKeyPressTime.get(key) || 0;
            
            if (now - lastPress < this.keyRepeatDelay) {
                event.preventDefault();
                return;
            }
            
            this.lastKeyPressTime.set(key, now);
            
            if (this.onKeyPress) {
                const handled = this.onKeyPress(key);
                if (handled) {
                    event.preventDefault();
                }
            }
            
            const handler = this.keyHandlers.get(key);
            if (handler) {
                handler();
                event.preventDefault();
            }
        });

        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            this.keys.delete(key);
            this.lastKeyPressTime.delete(key);
        });

        document.addEventListener('blur', () => {
            this.keys.clear();
            this.lastKeyPressTime.clear();
        });
    }

    public isKeyPressed(key: string): boolean {
        return this.keys.has(key.toLowerCase());
    }

    public setKeyHandler(key: string, handler: () => void): void {
        this.keyHandlers.set(key.toLowerCase(), handler);
    }

    public removeKeyHandler(key: string): void {
        this.keyHandlers.delete(key.toLowerCase());
    }

    public setKeyPressCallback(callback: (key: string) => boolean): void {
        this.onKeyPress = callback;
    }

    public clearHandlers(): void {
        this.keyHandlers.clear();
    }

    public getMovementInput(): { forward: boolean; backward: boolean; left: boolean; right: boolean } {
        return {
            forward: this.isKeyPressed('arrowup') || this.isKeyPressed('w'),
            backward: this.isKeyPressed('arrowdown') || this.isKeyPressed('s'),
            left: this.isKeyPressed('arrowleft') || this.isKeyPressed('a'),
            right: this.isKeyPressed('arrowright') || this.isKeyPressed('d')
        };
    }

    public getActionKeys(): { action: boolean; cancel: boolean; menu: boolean } {
        return {
            action: this.isKeyPressed('enter') || this.isKeyPressed(' '),
            cancel: this.isKeyPressed('escape'),
            menu: this.isKeyPressed('m') || this.isKeyPressed('tab')
        };
    }

    public setKeyRepeatDelay(delay: number): void {
        this.keyRepeatDelay = delay;
    }

    public getKeyRepeatDelay(): number {
        return this.keyRepeatDelay;
    }
}