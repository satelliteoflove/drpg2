import { Scene, SceneManager } from '../core/Scene';
import { GameState } from '../types/GameTypes';
import { SaveManager } from '../utils/SaveManager';

export class MainMenuScene extends Scene {
    private sceneManager: SceneManager;
    private selectedOption: number = 0;
    private menuOptions: string[] = [];

    constructor(_gameState: GameState, sceneManager: SceneManager) {
        super('MainMenu');
        this.sceneManager = sceneManager;
        this.updateMenuOptions();
    }

    public enter(): void {
        this.updateMenuOptions();
        this.selectedOption = 0;
    }

    public exit(): void {
    }

    public update(_deltaTime: number): void {
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.renderTitle(ctx);
        this.renderMenu(ctx);
        this.renderFooter(ctx);
    }

    private renderTitle(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DRPG2', ctx.canvas.width / 2, 150);

        ctx.fillStyle = '#aaa';
        ctx.font = '20px monospace';
        ctx.fillText('A Wizardry-like Dungeon Crawler', ctx.canvas.width / 2, 180);
    }

    private renderMenu(ctx: CanvasRenderingContext2D): void {
        const startY = 280;
        const lineHeight = 50;

        ctx.textAlign = 'center';
        ctx.font = '24px monospace';

        this.menuOptions.forEach((option, index) => {
            const y = startY + index * lineHeight;
            
            if (index === this.selectedOption) {
                ctx.fillStyle = '#ffaa00';
                ctx.fillText('> ' + option + ' <', ctx.canvas.width / 2, y);
            } else {
                ctx.fillStyle = '#fff';
                ctx.fillText(option, ctx.canvas.width / 2, y);
            }
        });
    }

    private renderFooter(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#666';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Use UP/DOWN arrows to navigate, ENTER to select', ctx.canvas.width / 2, ctx.canvas.height - 50);
        ctx.fillText('ESC to quit game', ctx.canvas.width / 2, ctx.canvas.height - 30);
    }

    private updateMenuOptions(): void {
        this.menuOptions = ['New Game'];
        
        if (SaveManager.hasSave()) {
            this.menuOptions.push('Continue Game');
        }
        
        this.menuOptions.push('Exit');
    }

    public handleInput(key: string): boolean {
        switch (key) {
            case 'arrowup':
            case 'w':
                this.selectedOption = Math.max(0, this.selectedOption - 1);
                return true;
                
            case 'arrowdown':
            case 's':
                this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
                return true;
                
            case 'enter':
            case ' ':
                this.selectCurrentOption();
                return true;
                
            case 'escape':
                if (confirm('Are you sure you want to quit?')) {
                    window.close();
                }
                return true;
        }
        return false;
    }

    private selectCurrentOption(): void {
        const selectedText = this.menuOptions[this.selectedOption];
        
        switch (selectedText) {
            case 'New Game':
                SaveManager.deleteSave();
                this.sceneManager.switchTo('character_creation');
                break;
                
            case 'Continue Game':
                this.sceneManager.switchTo('dungeon');
                break;
                
            case 'Exit':
                if (confirm('Are you sure you want to quit?')) {
                    window.close();
                }
                break;
        }
    }
}