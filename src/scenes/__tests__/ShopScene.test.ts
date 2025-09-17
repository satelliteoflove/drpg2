import { ShopScene } from '../ShopScene';
import { SceneManager } from '../../core/Scene';
import { GameState, Item, ItemType } from '../../types/GameTypes';
import { ShopSystem } from '../../systems/ShopSystem';
import { Character } from '../../entities/Character';

describe('ShopScene', () => {
  let shopScene: ShopScene;
  let mockGameState: GameState;
  let mockSceneManager: SceneManager;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    const mockCharacter1 = new Character('Fighter', 'Fighter');
    mockCharacter1.gold = 50;

    const mockCharacter2 = new Character('Mage', 'Mage');
    mockCharacter2.gold = 30;

    mockGameState = {
      party: [mockCharacter1, mockCharacter2],
      gold: 0,
    } as GameState;

    mockSceneManager = {
      switchTo: jest.fn(),
      currentScene: null,
    } as unknown as SceneManager;

    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    mockContext = mockCanvas.getContext('2d') as CanvasRenderingContext2D;

    shopScene = new ShopScene(mockGameState, mockSceneManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with main menu state', () => {
      expect((shopScene as any).currentState).toBe('main_menu');
      expect((shopScene as any).selectedOption).toBe(0);
    });

    it('should load shop inventory', () => {
      expect((shopScene as any).shopInventory).toBeDefined();
      expect((shopScene as any).shopInventory.categories).toBeDefined();
    });
  });

  describe('Enter/Exit', () => {
    it('should reset to main menu on enter', () => {
      (shopScene as any).currentState = 'buying_items';
      (shopScene as any).selectedOption = 3;
      shopScene.enter();
      expect((shopScene as any).currentState).toBe('main_menu');
      expect((shopScene as any).selectedOption).toBe(0);
    });

    it('should reset state on exit', () => {
      (shopScene as any).currentState = 'buying_items';
      shopScene.exit();
      expect((shopScene as any).currentState).toBe('main_menu');
    });
  });

  describe('Main Menu Navigation', () => {
    it('should navigate up in main menu', () => {
      (shopScene as any).selectedOption = 2;
      shopScene.handleInput('arrowup');
      expect((shopScene as any).selectedOption).toBe(1);
    });

    it('should navigate down in main menu', () => {
      (shopScene as any).selectedOption = 1;
      shopScene.handleInput('arrowdown');
      expect((shopScene as any).selectedOption).toBe(2);
    });

    it('should wrap around at menu boundaries', () => {
      (shopScene as any).selectedOption = 0;
      shopScene.handleInput('arrowup');
      expect((shopScene as any).selectedOption).toBe(0);

      (shopScene as any).selectedOption = 5;
      shopScene.handleInput('arrowdown');
      expect((shopScene as any).selectedOption).toBe(5);
    });

    it('should transition to buying category on Buy Items selection', () => {
      (shopScene as any).selectedOption = 0;
      shopScene.handleInput('enter');
      expect((shopScene as any).currentState).toBe('buying_category');
    });

    it('should transition to selling character select on Sell Items selection', () => {
      (shopScene as any).selectedOption = 1;
      shopScene.handleInput('enter');
      expect((shopScene as any).currentState).toBe('selling_character_select');
    });

    it('should transition to gold pooling on Pool Gold selection', () => {
      (shopScene as any).selectedOption = 3;
      shopScene.handleInput('enter');
      expect((shopScene as any).currentState).toBe('pooling_gold');
    });

    it('should return to town on Leave Shop selection', () => {
      (shopScene as any).selectedOption = 5;
      shopScene.handleInput('enter');
      expect(mockSceneManager.switchTo).toHaveBeenCalledWith('town');
    });

    it('should return to town on escape key', () => {
      shopScene.handleInput('escape');
      expect(mockSceneManager.switchTo).toHaveBeenCalledWith('town');
    });
  });

  describe('Buying Flow', () => {
    beforeEach(() => {
      (shopScene as any).currentState = 'buying_category';
    });

    it('should navigate categories', () => {
      (shopScene as any).selectedOption = 0;
      shopScene.handleInput('arrowdown');
      expect((shopScene as any).selectedOption).toBe(1);
    });

    it('should select category and show items', () => {
      (shopScene as any).selectedOption = 0;
      shopScene.handleInput('enter');
      expect((shopScene as any).currentState).toBe('buying_items');
      expect((shopScene as any).selectedCategory).toBe('weapons');
    });

    it('should return to main menu from category selection', () => {
      shopScene.handleInput('escape');
      expect((shopScene as any).currentState).toBe('main_menu');
    });

    describe('Item Selection', () => {
      beforeEach(() => {
        (shopScene as any).currentState = 'buying_items';
        (shopScene as any).selectedCategory = 'weapons';
      });

      it('should navigate items', () => {
        const itemCount = (shopScene as any).shopInventory.categories.weapons.length;
        if (itemCount > 1) {
          (shopScene as any).selectedOption = 0;
          shopScene.handleInput('arrowdown');
          expect((shopScene as any).selectedOption).toBe(1);
        }
      });

      it('should select item for purchase', () => {
        if ((shopScene as any).shopInventory.categories.weapons.length > 0) {
          (shopScene as any).selectedOption = 0;
          shopScene.handleInput('enter');
          expect((shopScene as any).currentState).toBe('buying_character_select');
          expect((shopScene as any).selectedItem).toBeDefined();
        }
      });

      it('should return to category selection', () => {
        shopScene.handleInput('escape');
        expect((shopScene as any).currentState).toBe('buying_category');
      });
    });

    describe('Character Selection for Purchase', () => {
      beforeEach(() => {
        (shopScene as any).currentState = 'buying_character_select';
        (shopScene as any).selectedItem = {
          name: 'Test Sword',
          type: ItemType.Weapon,
          value: 20,
        } as Item;
      });

      it('should navigate characters', () => {
        (shopScene as any).selectedCharacterIndex = 0;
        shopScene.handleInput('arrowdown');
        expect((shopScene as any).selectedCharacterIndex).toBe(1);
      });

      it('should purchase item for character with sufficient gold', () => {
        const character = mockGameState.party[0];
        const initialGold = character.gold;
        (shopScene as any).selectedCharacterIndex = 0;

        const consoleSpy = jest.spyOn(console, 'log');
        shopScene.handleInput('enter');

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('purchased'));
        expect(character.gold).toBe(initialGold - 20);
      });

      it('should not purchase item with insufficient gold', () => {
        (shopScene as any).selectedItem.value = 100;
        const character = mockGameState.party[0];
        const initialGold = character.gold;
        (shopScene as any).selectedCharacterIndex = 0;

        const consoleSpy = jest.spyOn(console, 'log');
        shopScene.handleInput('enter');

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('afford'));
        expect(character.gold).toBe(initialGold);
      });

      it('should return to item selection', () => {
        shopScene.handleInput('escape');
        expect((shopScene as any).currentState).toBe('buying_items');
      });
    });
  });

  describe('Selling Flow', () => {
    beforeEach(() => {
      const sword: Item = {
        name: 'Iron Sword',
        type: ItemType.Weapon,
        value: 30,
        equipped: false,
      };
      mockGameState.party[0].inventory = [sword];
      (shopScene as any).currentState = 'selling_character_select';
    });

    it('should select character for selling', () => {
      (shopScene as any).selectedCharacterIndex = 0;
      shopScene.handleInput('enter');
      expect((shopScene as any).currentState).toBe('selling_items');
      expect((shopScene as any).selectedSellingCharacter).toBe(mockGameState.party[0]);
    });

    it('should navigate characters for selling', () => {
      (shopScene as any).selectedCharacterIndex = 0;
      shopScene.handleInput('arrowdown');
      expect((shopScene as any).selectedCharacterIndex).toBe(1);
    });

    describe('Item Selling', () => {
      beforeEach(() => {
        (shopScene as any).currentState = 'selling_items';
        (shopScene as any).selectedSellingCharacter = mockGameState.party[0];
      });

      it('should select item for selling', () => {
        (shopScene as any).selectedOption = 0;
        shopScene.handleInput('enter');
        expect((shopScene as any).currentState).toBe('selling_confirmation');
        expect((shopScene as any).selectedItem).toBeDefined();
      });

      it('should confirm sale', () => {
        (shopScene as any).currentState = 'selling_confirmation';
        (shopScene as any).selectedItem = mockGameState.party[0].inventory[0];
        const initialGold = mockGameState.party[0].gold;

        shopScene.handleInput('y');
        expect(mockGameState.party[0].gold).toBeGreaterThan(initialGold);
        expect((shopScene as any).currentState).toBe('main_menu');
      });

      it('should cancel sale', () => {
        (shopScene as any).currentState = 'selling_confirmation';
        (shopScene as any).selectedItem = mockGameState.party[0].inventory[0];
        const initialInventoryLength = mockGameState.party[0].inventory.length;

        shopScene.handleInput('n');
        expect(mockGameState.party[0].inventory.length).toBe(initialInventoryLength);
        expect((shopScene as any).currentState).toBe('selling_items');
      });
    });
  });

  describe('Gold Pooling', () => {
    beforeEach(() => {
      (shopScene as any).currentState = 'pooling_gold';
    });

    it('should pool all party gold', () => {
      const totalGold = mockGameState.party.reduce((sum, char) => sum + char.gold, 0);
      shopScene.handleInput('y');

      expect(mockGameState.gold).toBe(totalGold);
      mockGameState.party.forEach((char) => {
        expect(char.gold).toBe(0);
      });
      expect((shopScene as any).currentState).toBe('main_menu');
    });

    it('should cancel gold pooling', () => {
      const initialPartyGold = mockGameState.party.map((c) => c.gold);
      shopScene.handleInput('n');

      expect(mockGameState.gold).toBe(0);
      mockGameState.party.forEach((char, index) => {
        expect(char.gold).toBe(initialPartyGold[index]);
      });
      expect((shopScene as any).currentState).toBe('main_menu');
    });
  });

  describe('Rendering', () => {
    it('should render without errors', () => {
      expect(() => shopScene.render(mockContext)).not.toThrow();
    });

    it('should render main menu', () => {
      const fillTextSpy = jest.spyOn(mockContext, 'fillText');
      shopScene.render(mockContext);

      expect(fillTextSpy).toHaveBeenCalledWith(
        expect.stringContaining('BOLTAC'),
        expect.any(Number),
        expect.any(Number)
      );
      expect(fillTextSpy).toHaveBeenCalledWith('Buy Items', expect.any(Number), expect.any(Number));
      expect(fillTextSpy).toHaveBeenCalledWith(
        'Sell Items',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should render category selection', () => {
      (shopScene as any).currentState = 'buying_category';
      const fillTextSpy = jest.spyOn(mockContext, 'fillText');
      shopScene.render(mockContext);

      expect(fillTextSpy).toHaveBeenCalledWith('Weapons', expect.any(Number), expect.any(Number));
      expect(fillTextSpy).toHaveBeenCalledWith('Armor', expect.any(Number), expect.any(Number));
    });

    it('should handle rapid renders', () => {
      for (let i = 0; i < 100; i++) {
        expect(() => shopScene.render(mockContext)).not.toThrow();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty inventory gracefully', () => {
      mockGameState.party[0].inventory = [];
      (shopScene as any).currentState = 'selling_character_select';
      (shopScene as any).selectedCharacterIndex = 0;

      shopScene.handleInput('enter');
      expect((shopScene as any).currentState).toBe('selling_items');
    });

    it('should handle empty shop categories', () => {
      (shopScene as any).shopInventory.categories.weapons = [];
      (shopScene as any).currentState = 'buying_items';
      (shopScene as any).selectedCategory = 'weapons';

      expect(() => shopScene.render(mockContext)).not.toThrow();
    });

    it('should return false for unhandled input', () => {
      const handled = shopScene.handleInput('x');
      expect(handled).toBe(false);
    });
  });
});
