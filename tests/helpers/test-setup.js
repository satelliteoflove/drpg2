import { expect } from '@playwright/test';

export class TestSetup {
  static async waitForGameInitialization(page) {
    await page.waitForSelector('#game-canvas', { timeout: 10000 });

    await page.waitForFunction(() => {
      return window.game?.instance?.isGameRunning?.() === true;
    }, { timeout: 10000 });

    const initialized = await page.evaluate(() => {
      return {
        hasGame: !!window.game?.instance,
        hasServices: !!window.game?.services,
        hasSceneManager: !!window.game?.sceneManager,
        hasGameState: !!window.game?.gameState,
        isRunning: window.game?.isRunning?.(),
        currentScene: window.game?.sceneManager?.currentScene?.getName?.()
      };
    });

    return initialized;
  }

  static async bypassMainMenu(page) {
    await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      if (!sceneManager) {
        throw new Error('SceneManager not available');
      }

      const party = window.game?.gameState?.party;
      if (!party || party.characters.length === 0) {
        const { Character, Party } = window;
        const newParty = new Party();

        const fighter = new Character('TestFighter', 'Human', 'Fighter', 'Good');
        const mage = new Character('TestMage', 'Elf', 'Mage', 'Good');
        const priest = new Character('TestPriest', 'Dwarf', 'Priest', 'Good');
        const thief = new Character('TestThief', 'Hobbit', 'Thief', 'Neutral');

        newParty.addCharacter(fighter);
        newParty.addCharacter(mage);
        newParty.addCharacter(priest);
        newParty.addCharacter(thief);

        window.game.gameState.party = newParty;
      }

      window.game.gameState.currentFloor = 1;
      window.game.gameState.inCombat = false;

      sceneManager.switchTo('town');
    });

    await page.waitForTimeout(500);
  }

  static async setupCombat(page, monsterConfig = null) {
    const defaultMonsters = [{
      name: 'TestGoblin',
      hp: 20,
      maxHp: 20,
      currentHp: 20,
      ac: 10,
      attacks: [{ damage: '1d4' }],
      xpValue: 10,
      magicResistance: 0
    }];

    const monsters = monsterConfig || defaultMonsters;

    return await page.evaluate((monsters) => {
      const sceneManager = window.game?.sceneManager;
      const combatScene = sceneManager?.getScene('combat');

      if (!combatScene) {
        throw new Error('Combat scene not available');
      }

      const party = window.game?.gameState?.party;
      if (!party || party.characters.length === 0) {
        throw new Error('No party available for combat');
      }

      window.testMonsters = monsters;

      combatScene.combatSystem.startCombat(
        monsters,
        party.getAliveCharacters(),
        1,
        () => {},
        () => {}
      );

      sceneManager.switchTo('combat');

      return {
        monstersCreated: monsters.length,
        partySize: party.getAliveCharacters().length,
        combatStarted: true
      };
    }, monsters);
  }

  static async createTestParty(page, partyConfig = null) {
    const defaultConfig = [
      { name: 'Warrior', race: 'Human', class: 'Fighter', alignment: 'Good' },
      { name: 'Wizard', race: 'Elf', class: 'Mage', alignment: 'Good' },
      { name: 'Healer', race: 'Dwarf', class: 'Priest', alignment: 'Good' },
      { name: 'Rogue', race: 'Hobbit', class: 'Thief', alignment: 'Neutral' }
    ];

    const config = partyConfig || defaultConfig;

    return await page.evaluate((config) => {
      const { Character, Party } = window;
      const party = new Party();

      config.forEach(charConfig => {
        const character = new Character(
          charConfig.name,
          charConfig.race,
          charConfig.class,
          charConfig.alignment
        );

        if (charConfig.level) character.level = charConfig.level;
        if (charConfig.hp !== undefined) character.hp = charConfig.hp;
        if (charConfig.maxHp !== undefined) character.maxHp = charConfig.maxHp;
        if (charConfig.mp !== undefined) character.mp = charConfig.mp;
        if (charConfig.maxMp !== undefined) character.maxMp = charConfig.maxMp;

        party.addCharacter(character);
      });

      window.game.gameState.party = party;

      return {
        partySize: party.characters.length,
        characters: party.characters.map(c => ({
          name: c.name,
          class: c.class,
          level: c.level,
          hp: c.hp,
          mp: c.mp
        }))
      };
    }, config);
  }

  static async getCombatState(page) {
    return await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      const currentScene = sceneManager?.currentScene;

      if (!currentScene || currentScene.getName() !== 'Combat') {
        return null;
      }

      const combatSystem = currentScene.combatSystem;

      return {
        actionState: currentScene.actionState,
        currentUnit: combatSystem?.getCurrentUnit?.()?.name,
        turnOrder: combatSystem?.turnOrder?.map(u => u.name),
        monsters: combatSystem?.monsters?.map(m => ({
          name: m.name,
          hp: m.hp,
          maxHp: m.maxHp,
          isDead: m.isDead
        })),
        party: window.game?.gameState?.party?.characters?.map(c => ({
          name: c.name,
          hp: c.hp,
          maxHp: c.maxHp,
          mp: c.mp,
          maxMp: c.maxMp,
          isDead: c.isDead
        }))
      };
    });
  }

  static async enableTestMode(page) {
    await page.evaluate(() => {
      window.testMode = true;

      if (window.FeatureFlags) {
        window.FeatureFlags.enable('test_mode');
        window.FeatureFlags.enable('deterministic_random');
        window.FeatureFlags.enable('skip_animations');
        window.FeatureFlags.enable('immediate_transitions');
      }

      Math.random = (() => {
        let seed = 42;
        return () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
      })();
    });
  }

  static async getSceneState(page) {
    return await page.evaluate(() => {
      const sceneManager = window.game?.sceneManager;
      const currentScene = sceneManager?.currentScene;

      if (!currentScene) return null;

      const sceneName = currentScene.getName();

      if (sceneName === 'Combat' && currentScene.getTestState) {
        return currentScene.getTestState();
      }

      return {
        sceneName: sceneName,
        gameState: {
          inCombat: window.game?.gameState?.inCombat,
          currentFloor: window.game?.gameState?.currentFloor,
          partySize: window.game?.gameState?.party?.characters?.length
        }
      };
    });
  }

  static async getMessages(page, count = 5) {
    return await page.evaluate((count) => {
      const messages = window.game?.gameState?.messageLog?.getMessages?.() || [];
      return messages.slice(-count).map(m => m.text || m);
    }, count);
  }

  static async waitForSceneChange(page, targetScene, timeout = 5000) {
    await page.waitForFunction(
      (targetScene) => {
        const currentScene = window.game?.sceneManager?.currentScene;
        return currentScene && currentScene.getName() === targetScene;
      },
      targetScene,
      { timeout }
    );
  }

  static async simulateKeyPress(page, key, delay = 100) {
    await page.keyboard.press(key);
    await page.waitForTimeout(delay);
  }

  static async navigateCombatMenu(page, action) {
    const actions = ['attack', 'cast', 'item', 'parry', 'run'];
    const targetIndex = actions.indexOf(action.toLowerCase());

    if (targetIndex === -1) {
      throw new Error(`Unknown action: ${action}`);
    }

    for (let i = 0; i < targetIndex; i++) {
      await this.simulateKeyPress(page, 'ArrowDown');
    }

    await this.simulateKeyPress(page, 'Enter');
  }
}

export class TestAssertions {
  static async assertSceneIs(page, expectedScene) {
    const currentScene = await page.evaluate(() => {
      return window.game?.sceneManager?.currentScene?.getName();
    });
    expect(currentScene).toBe(expectedScene);
  }

  static async assertPartyExists(page) {
    const party = await page.evaluate(() => {
      const party = window.game?.gameState?.party;
      return {
        exists: !!party,
        size: party?.characters?.length || 0,
        hasAliveMembers: party?.getAliveCharacters?.().length > 0
      };
    });

    expect(party.exists).toBe(true);
    expect(party.size).toBeGreaterThan(0);
    expect(party.hasAliveMembers).toBe(true);
  }

  static async assertCombatStarted(page) {
    const combatState = await TestSetup.getCombatState(page);
    expect(combatState).not.toBeNull();
    expect(combatState.monsters).toBeDefined();
    expect(combatState.party).toBeDefined();
    expect(combatState.turnOrder).toBeDefined();
  }

  static async assertSpellCast(page, spellName) {
    const messages = await TestSetup.getMessages(page);
    const spellMessage = messages.find(m =>
      m.includes(spellName) || m.includes('casts') || m.includes('damage') || m.includes('heals')
    );
    expect(spellMessage).toBeDefined();
  }

  static async assertHPChanged(page, targetName, expectDecrease = true) {
    const combatState = await TestSetup.getCombatState(page);
    const allUnits = [...(combatState.monsters || []), ...(combatState.party || [])];
    const target = allUnits.find(u => u.name === targetName);

    expect(target).toBeDefined();
    if (expectDecrease) {
      expect(target.hp).toBeLessThan(target.maxHp);
    } else {
      expect(target.hp).toBeGreaterThan(0);
    }
  }
}

export default { TestSetup, TestAssertions };