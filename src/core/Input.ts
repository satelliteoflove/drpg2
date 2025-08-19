export class InputManager {
    private keys: Set<string> = new Set();
    private keyHandlers: Map<string, () => void> = new Map();
    private onKeyPress?: (key: string) => boolean;

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (event) => {
            this.keys.add(event.key.toLowerCase());
            
            if (this.onKeyPress) {
                const handled = this.onKeyPress(event.key.toLowerCase());
                if (handled) {
                    event.preventDefault();
                }
            }
            
            const handler = this.keyHandlers.get(event.key.toLowerCase());
            if (handler) {
                handler();
                event.preventDefault();
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys.delete(event.key.toLowerCase());
        });

        document.addEventListener('blur', () => {
            this.keys.clear();
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
}