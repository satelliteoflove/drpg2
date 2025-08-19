import { 
    Character as ICharacter, 
    CharacterClass, 
    CharacterRace, 
    CharacterAlignment,
    CharacterStats,
    CharacterStatus,
    Equipment,
    Item,
    Spell
} from '../types/GameTypes';

export class Character implements ICharacter {
    id: string;
    name: string;
    race: CharacterRace;
    class: CharacterClass;
    alignment: CharacterAlignment;
    level: number;
    experience: number;
    stats: CharacterStats;
    baseStats: CharacterStats;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    ac: number;
    status: CharacterStatus;
    age: number;
    gold: number;
    equipment: Equipment;
    inventory: Item[];
    spells: Spell[];
    isDead: boolean;
    deathCount: number;

    constructor(name: string, race: CharacterRace, charClass: CharacterClass, alignment: CharacterAlignment) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.race = race;
        this.class = charClass;
        this.alignment = alignment;
        this.level = 1;
        this.experience = 0;
        this.age = this.getStartingAge();
        this.gold = Math.floor(Math.random() * 100) + 50;
        this.equipment = {};
        this.inventory = [];
        this.spells = [];
        this.isDead = false;
        this.deathCount = 0;
        this.status = 'OK';
        
        this.baseStats = this.rollStats();
        this.stats = { ...this.baseStats };
        this.applyRaceModifiers();
        
        this.maxHp = this.calculateMaxHp();
        this.hp = this.maxHp;
        this.maxMp = this.calculateMaxMp();
        this.mp = this.maxMp;
        this.ac = 10;
        
        this.learnStartingSpells();
    }

    private rollStats(): CharacterStats {
        const roll3d6 = () => {
            return Math.floor(Math.random() * 6) + 1 +
                   Math.floor(Math.random() * 6) + 1 +
                   Math.floor(Math.random() * 6) + 1;
        };

        const stats: CharacterStats = {
            strength: roll3d6(),
            intelligence: roll3d6(),
            piety: roll3d6(),
            vitality: roll3d6(),
            agility: roll3d6(),
            luck: roll3d6()
        };

        while (!this.meetsClassRequirements(stats)) {
            stats.strength = roll3d6();
            stats.intelligence = roll3d6();
            stats.piety = roll3d6();
            stats.vitality = roll3d6();
            stats.agility = roll3d6();
            stats.luck = roll3d6();
        }

        return stats;
    }

    private meetsClassRequirements(stats: CharacterStats): boolean {
        switch (this.class) {
            case 'Fighter':
                return stats.strength >= 11;
            case 'Mage':
                return stats.intelligence >= 11;
            case 'Priest':
                return stats.piety >= 11;
            case 'Thief':
                return stats.agility >= 11;
            case 'Bishop':
                return stats.intelligence >= 12 && stats.piety >= 12;
            case 'Samurai':
                return stats.strength >= 15 && stats.intelligence >= 11 && 
                       stats.piety >= 10 && stats.vitality >= 14 && stats.agility >= 10;
            case 'Lord':
                return stats.strength >= 15 && stats.intelligence >= 12 && 
                       stats.piety >= 12 && stats.vitality >= 15 && 
                       stats.agility >= 14 && stats.luck >= 15;
            case 'Ninja':
                return stats.strength >= 15 && stats.intelligence >= 15 && 
                       stats.piety >= 15 && stats.vitality >= 15 && 
                       stats.agility >= 15 && stats.luck >= 15;
            default:
                return true;
        }
    }

    private applyRaceModifiers(): void {
        switch (this.race) {
            case 'Elf':
                this.stats.intelligence += 2;
                this.stats.agility += 1;
                this.stats.vitality -= 2;
                break;
            case 'Dwarf':
                this.stats.strength += 2;
                this.stats.vitality += 3;
                this.stats.agility -= 2;
                break;
            case 'Gnome':
                this.stats.intelligence += 1;
                this.stats.piety += 2;
                this.stats.strength -= 2;
                break;
            case 'Hobbit':
                this.stats.agility += 3;
                this.stats.luck += 2;
                this.stats.strength -= 3;
                break;
        }

        Object.keys(this.stats).forEach(key => {
            const statKey = key as keyof CharacterStats;
            this.stats[statKey] = Math.max(3, Math.min(18, this.stats[statKey]));
        });
    }

    private getStartingAge(): number {
        const baseAge = this.race === 'Elf' ? 75 : 
                       this.race === 'Dwarf' ? 50 :
                       this.race === 'Gnome' ? 60 :
                       this.race === 'Hobbit' ? 30 : 18;
        return baseAge + Math.floor(Math.random() * 5);
    }

    private calculateMaxHp(): number {
        const classHpBonus = {
            'Fighter': 10, 'Samurai': 8, 'Lord': 8, 'Ninja': 6,
            'Priest': 6, 'Bishop': 4, 'Thief': 4, 'Mage': 3
        };
        
        const base = classHpBonus[this.class] || 4;
        const vitBonus = Math.floor((this.stats.vitality - 10) / 2);
        return Math.max(1, base + vitBonus) * this.level;
    }

    private calculateMaxMp(): number {
        if (!this.canCastSpells()) return 0;
        
        const intBonus = Math.floor((this.stats.intelligence - 10) / 2);
        const pietyBonus = Math.floor((this.stats.piety - 10) / 2);
        
        let base = 0;
        if (this.class === 'Mage' || this.class === 'Bishop') base += 3 + intBonus;
        if (this.class === 'Priest' || this.class === 'Bishop') base += 3 + pietyBonus;
        if (this.class === 'Samurai' || this.class === 'Lord' || this.class === 'Ninja') base += 2;
        
        return Math.max(0, base * this.level);
    }

    private canCastSpells(): boolean {
        return ['Mage', 'Priest', 'Bishop', 'Samurai', 'Lord', 'Ninja'].includes(this.class);
    }

    private learnStartingSpells(): void {
        if (!this.canCastSpells()) return;
        
        if (this.class === 'Mage' || this.class === 'Bishop') {
            this.spells.push({
                id: 'halito',
                name: 'Halito',
                level: 1,
                type: 'mage',
                mpCost: 1,
                effect: { type: 'damage', element: 'fire', power: 8 },
                targetType: 'enemy',
                inCombat: true,
                outOfCombat: false
            });
        }
        
        if (this.class === 'Priest' || this.class === 'Bishop') {
            this.spells.push({
                id: 'dios',
                name: 'Dios',
                level: 1,
                type: 'priest',
                mpCost: 1,
                effect: { type: 'heal', power: 8 },
                targetType: 'ally',
                inCombat: true,
                outOfCombat: true
            });
        }
    }

    public levelUp(): void {
        this.level++;
        const oldMaxHp = this.maxHp;
        const oldMaxMp = this.maxMp;
        
        this.maxHp = this.calculateMaxHp();
        this.maxMp = this.calculateMaxMp();
        
        this.hp += this.maxHp - oldMaxHp;
        this.mp += this.maxMp - oldMaxMp;
        
        if (Math.random() < 0.3) {
            const stats = Object.keys(this.stats) as (keyof CharacterStats)[];
            const randomStat = stats[Math.floor(Math.random() * stats.length)];
            this.stats[randomStat]++;
        }
    }

    public takeDamage(amount: number): void {
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp === 0 && !this.isDead) {
            this.status = 'Dead';
            this.isDead = true;
            this.deathCount++;
        }
    }

    public heal(amount: number): void {
        if (this.isDead) return;
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    public resurrect(): void {
        if (!this.isDead) return;
        
        if (Math.random() < 0.5 + (this.deathCount * 0.1)) {
            this.status = 'Ashed';
            return;
        }
        
        this.isDead = false;
        this.status = 'OK';
        this.hp = 1;
        this.stats.vitality = Math.max(3, this.stats.vitality - 1);
        this.age += 1;
    }

    public getExperienceForNextLevel(): number {
        return Math.floor(1000 * Math.pow(1.5, this.level - 1));
    }

    public addExperience(amount: number): boolean {
        this.experience += amount;
        const requiredExp = this.getExperienceForNextLevel();
        
        if (this.experience >= requiredExp) {
            this.experience -= requiredExp;
            this.levelUp();
            return true;
        }
        return false;
    }
}