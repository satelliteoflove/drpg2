import { Scene, SceneManager } from '../core/Scene';
import { GameState, Monster } from '../types/GameTypes';
import { CombatSystem } from '../systems/CombatSystem';
import { StatusPanel } from '../ui/StatusPanel';
import { MessageLog } from '../ui/MessageLog';

export class CombatScene extends Scene {
    private gameState: GameState;
    private sceneManager: SceneManager;
    private combatSystem: CombatSystem;
    private statusPanel!: StatusPanel;
    private messageLog!: MessageLog;
    private selectedAction: number = 0;
    private selectedTarget: number = 0;
    private actionState: 'select_action' | 'select_target' | 'select_spell' | 'waiting' = 'select_action';
    private waitingForAnimation: boolean = false;

    constructor(gameState: GameState, sceneManager: SceneManager) {
        super('Combat');
        this.gameState = gameState;
        this.sceneManager = sceneManager;
        this.combatSystem = new CombatSystem();
    }

    public enter(): void {
        this.initializeCombat();
        this.actionState = 'select_action';
        this.selectedAction = 0;
        this.selectedTarget = 0;
    }

    public exit(): void {
        this.gameState.inCombat = false;
    }

    private initializeCombat(): void {
        const monsters = this.generateMonsters();
        const aliveCharacters = this.gameState.party.getAliveCharacters();
        
        this.combatSystem.startCombat(monsters, aliveCharacters, (victory: boolean, rewards) => {
            this.endCombat(victory, rewards);
        });
    }

    private generateMonsters(): Monster[] {
        const monsterTypes: Monster[] = [
            {
                id: 'slime',
                name: 'Slime',
                hp: 15,
                maxHp: 15,
                ac: 8,
                attacks: [{ name: 'Slime Attack', damage: '1d4+1', effect: '', chance: 0.8 }],
                experience: 10,
                gold: 5,
                itemDrops: [],
                resistances: [],
                weaknesses: ['fire']
            },
            {
                id: 'goblin',
                name: 'Goblin',
                hp: 20,
                maxHp: 20,
                ac: 6,
                attacks: [{ name: 'Club', damage: '1d6+1', effect: '', chance: 0.9 }],
                experience: 15,
                gold: 8,
                itemDrops: [],
                resistances: [],
                weaknesses: []
            },
            {
                id: 'orc',
                name: 'Orc',
                hp: 35,
                maxHp: 35,
                ac: 4,
                attacks: [
                    { name: 'Sword', damage: '1d8+2', effect: '', chance: 0.8 },
                    { name: 'Bash', damage: '1d6+3', effect: '', chance: 0.6 }
                ],
                experience: 25,
                gold: 15,
                itemDrops: [],
                resistances: [],
                weaknesses: []
            }
        ];

        const numMonsters = 1 + Math.floor(Math.random() * 3);
        const monsters: Monster[] = [];

        for (let i = 0; i < numMonsters; i++) {
            const template = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
            monsters.push({ ...template, name: `${template.name} ${i + 1}` });
        }

        return monsters;
    }

    public update(_deltaTime: number): void {
        if (this.waitingForAnimation) {
            this.waitingForAnimation = false;
            this.processAITurn();
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.statusPanel) {
            this.initializeUI(ctx.canvas);
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.renderCombatArea(ctx);
        this.renderUI(ctx);
        this.renderCombatInfo(ctx);
    }

    private initializeUI(canvas: HTMLCanvasElement): void {
        this.statusPanel = new StatusPanel(canvas, 624, 0, 400, 400);
        this.messageLog = new MessageLog(canvas, 624, 400, 400, 368);
        
        this.messageLog.addCombatMessage('Combat begins!');
    }

    private renderCombatArea(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#1a0000';
        ctx.fillRect(0, 0, 624, 400);
        
        ctx.strokeStyle = '#600000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 624, 400);

        const encounter = this.combatSystem.getEncounter();
        if (!encounter) return;

        this.renderMonsters(ctx, encounter.monsters);
        this.renderParty(ctx);
    }

    private renderMonsters(ctx: CanvasRenderingContext2D, monsters: Monster[]): void {
        monsters.forEach((monster, index) => {
            if (monster.hp <= 0) return;

            const x = 100 + (index % 3) * 150;
            const y = 80 + Math.floor(index / 3) * 120;

            if (this.actionState === 'select_target' && index === this.selectedTarget) {
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(x - 5, y - 5, 110, 110);
            }

            ctx.fillStyle = '#800000';
            ctx.fillRect(x, y, 100, 100);
            
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, 100, 100);

            ctx.fillStyle = '#fff';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(monster.name, x + 50, y + 20);
            
            const hpPercent = monster.hp / monster.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(x + 10, y + 30, 80, 8);
            
            ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
            ctx.fillRect(x + 10, y + 30, 80 * hpPercent, 8);
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.fillText(`${monster.hp}/${monster.maxHp}`, x + 50, y + 50);

            ctx.fillStyle = '#fff';
            ctx.font = '36px monospace';
            ctx.fillText('👹', x + 50, y + 85);
        });
    }

    private renderParty(ctx: CanvasRenderingContext2D): void {
        const aliveCharacters = this.gameState.party.getAliveCharacters();
        
        aliveCharacters.forEach((character: any, index: number) => {
            const x = 50 + index * 80;
            const y = 280;

            ctx.fillStyle = '#000080';
            ctx.fillRect(x, y, 70, 80);
            
            ctx.strokeStyle = '#0000ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, 70, 80);

            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(character.name, x + 35, y + 15);
            
            const hpPercent = character.hp / character.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(x + 5, y + 20, 60, 6);
            
            ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
            ctx.fillRect(x + 5, y + 20, 60 * hpPercent, 6);

            ctx.fillStyle = '#fff';
            ctx.font = '24px monospace';
            ctx.fillText('🛡️', x + 35, y + 55);
        });
    }

    private renderUI(ctx: CanvasRenderingContext2D): void {
        this.statusPanel.render(this.gameState.party);
        this.messageLog.render();

        if (this.combatSystem.canPlayerAct()) {
            this.renderActionMenu(ctx);
        }
    }

    private renderActionMenu(ctx: CanvasRenderingContext2D): void {
        const menuX = 50;
        const menuY = 400;
        const menuWidth = 500;
        const menuHeight = 200;

        ctx.fillStyle = '#222';
        ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';

        if (this.actionState === 'select_action') {
            const actions = this.combatSystem.getPlayerOptions();
            
            ctx.fillText('Select Action:', menuX + 10, menuY + 25);
            
            actions.forEach((action, index) => {
                const y = menuY + 50 + index * 25;
                
                ctx.fillStyle = index === this.selectedAction ? '#ffff00' : '#fff';
                ctx.fillText(`${index + 1}. ${action}`, menuX + 20, y);
            });
        } else if (this.actionState === 'select_target') {
            ctx.fillText('Select Target:', menuX + 10, menuY + 25);
            ctx.fillText('Use LEFT/RIGHT arrows to select target', menuX + 10, menuY + 50);
            ctx.fillText('Press ENTER to attack', menuX + 10, menuY + 75);
        } else if (this.actionState === 'waiting') {
            ctx.fillText('Processing turn...', menuX + 10, menuY + 25);
        }
    }

    private renderCombatInfo(_ctx: CanvasRenderingContext2D): void {
        const encounter = this.combatSystem.getEncounter();
        if (!encounter) return;

        const currentUnit = this.combatSystem.getCurrentUnit();

        if (currentUnit) {
            const turnOrder = encounter.turnOrder.map(unit => 
                'class' in unit ? unit.name : unit.name
            );
            
            this.statusPanel.renderCombatStatus(
                'class' in currentUnit ? currentUnit.name : currentUnit.name,
                turnOrder
            );
        }
    }

    private processAITurn(): void {
        if (!this.combatSystem.canPlayerAct()) {
            setTimeout(() => {
                const result = this.combatSystem.executeMonsterTurn();
                this.messageLog.addCombatMessage(result);
                
                if (this.gameState.party.isWiped()) {
                    this.messageLog.addDeathMessage('Party defeated!');
                    setTimeout(() => this.endCombat(false), 2000);
                }
            }, 1000);
        }
    }

    public handleInput(key: string): boolean {
        if (this.actionState === 'waiting') return true;

        if (this.actionState === 'select_action') {
            return this.handleActionSelection(key);
        } else if (this.actionState === 'select_target') {
            return this.handleTargetSelection(key);
        }

        return false;
    }

    private handleActionSelection(key: string): boolean {
        const actions = this.combatSystem.getPlayerOptions();
        
        if (key === 'arrowup' || key === 'w') {
            this.selectedAction = Math.max(0, this.selectedAction - 1);
            return true;
        } else if (key === 'arrowdown' || key === 's') {
            this.selectedAction = Math.min(actions.length - 1, this.selectedAction + 1);
            return true;
        } else if (key === 'enter') {
            const selectedActionText = actions[this.selectedAction];
            
            if (selectedActionText === 'Attack') {
                this.actionState = 'select_target';
                this.selectedTarget = 0;
            } else {
                this.executeAction(selectedActionText);
            }
            return true;
        }

        return false;
    }

    private handleTargetSelection(key: string): boolean {
        const encounter = this.combatSystem.getEncounter();
        if (!encounter) return false;

        const aliveMonsters = encounter.monsters.filter(m => m.hp > 0);
        
        if (key === 'arrowleft' || key === 'a') {
            this.selectedTarget = Math.max(0, this.selectedTarget - 1);
            return true;
        } else if (key === 'arrowright' || key === 'd') {
            this.selectedTarget = Math.min(aliveMonsters.length - 1, this.selectedTarget + 1);
            return true;
        } else if (key === 'enter') {
            this.executeAction('Attack');
            return true;
        } else if (key === 'escape') {
            this.actionState = 'select_action';
            return true;
        }

        return false;
    }

    private executeAction(action: string): void {
        this.actionState = 'waiting';
        
        let result = '';
        if (action === 'Attack') {
            result = this.combatSystem.executePlayerAction(action, this.selectedTarget);
        } else {
            result = this.combatSystem.executePlayerAction(action);
        }

        this.messageLog.addCombatMessage(result);
        
        setTimeout(() => {
            this.actionState = this.combatSystem.canPlayerAct() ? 'select_action' : 'waiting';
            this.selectedAction = 0;
            
            if (!this.combatSystem.canPlayerAct()) {
                this.waitingForAnimation = true;
            }
        }, 1000);
    }

    private endCombat(victory: boolean, rewards?: { experience: number; gold: number }): void {
        if (victory && rewards) {
            this.messageLog.addSystemMessage(`Victory! Gained ${rewards.experience} experience and ${rewards.gold} gold!`);
            this.gameState.party.distributeExperience(rewards.experience);
            this.gameState.party.distributeGold(rewards.gold);
        } else {
            this.messageLog.addDeathMessage('Defeated...');
        }

        setTimeout(() => {
            this.sceneManager.switchTo('dungeon');
        }, 3000);
    }
}