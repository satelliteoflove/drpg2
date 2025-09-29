// Magic System Test - Run this in browser console at http://localhost:8080

async function testMagicSystem() {
    console.log('=== MAGIC SYSTEM TEST ===');

    // 1. Check if spell system is loaded
    if (!window.SpellRegistry || !window.SpellCaster) {
        console.error('❌ Spell system not loaded');
        return;
    }
    console.log('✅ Spell system loaded');

    // 2. Check spell registry
    const registry = SpellRegistry.getInstance();
    const allSpells = registry.getAllSpells();
    console.log(`✅ Total spells: ${allSpells.length}`);

    const damageSpells = allSpells.filter(s => s.effects?.some(e => e.type === 'damage'));
    const healingSpells = allSpells.filter(s => s.effects?.some(e => e.type === 'heal' || e.type === 'healing'));
    console.log(`  - Damage spells: ${damageSpells.length}`);
    console.log(`  - Healing spells: ${healingSpells.length}`);

    // 3. Navigate to game and check party
    const scene = AI.getScene();
    console.log(`Current scene: ${scene}`);

    if (scene === 'MainMenu') {
        console.log('Starting new game...');
        AI.sendKey('Enter');
        await sleep(500);
        AI.sendKey('ArrowDown'); // Select auto-generate
        await sleep(200);
        AI.sendKey('Enter');
        await sleep(500);
        AI.sendKey('Enter'); // Confirm
        await sleep(1000);
    }

    // 4. Check party spells
    const party = AI.getParty();
    if (!party?.characters) {
        console.error('❌ No party available');
        return;
    }

    console.log('\n=== PARTY SPELLS ===');
    party.characters.forEach(char => {
        const spells = char.knownSpells || [];
        console.log(`${char.name} (${char.class}): ${spells.length} spells`);
        if (spells.length > 0) {
            console.log(`  Known: ${spells.join(', ')}`);
            console.log(`  MP: ${char.mp.current}/${char.mp.max}`);
        }
    });

    // 5. Try to trigger combat
    if (AI.getScene() === 'Dungeon' || AI.getScene()?.toLowerCase() === 'dungeon') {
        console.log('\n=== TRIGGERING COMBAT ===');
        for (let i = 0; i < 10; i++) {
            AI.sendKey('ArrowUp');
            await sleep(100);
            if (AI.getScene() === 'Combat') {
                console.log('✅ Combat triggered!');
                break;
            }
        }
    }

    // 6. Test spell casting in combat
    if (AI.getScene() === 'Combat') {
        console.log('\n=== TESTING SPELL CAST ===');
        const combat = AI.getCombat();
        const party = AI.getParty();

        console.log(`Enemies: ${combat.enemies?.length || 0}`);
        console.log(`Current turn: Character ${combat.currentCharacter}`);

        const currentChar = party.characters[combat.currentCharacter || 0];
        if (currentChar?.knownSpells?.length > 0) {
            console.log(`${currentChar.name} has spells, attempting to cast...`);

            const mpBefore = currentChar.mp.current;
            const enemyHpBefore = combat.enemies?.[0]?.hp;

            // Open spell menu
            AI.sendKey('m');
            await sleep(500);

            if (AI.getCombat().spellMenuOpen) {
                console.log('✅ Spell menu opened');

                // Select first spell
                AI.sendKey('1');
                await sleep(500);

                // If target selection, confirm
                if (AI.getCombat().targetSelectionActive) {
                    console.log('✅ Target selection active');
                    AI.sendKey('Enter');
                    await sleep(1000);
                }

                // Check results
                const newParty = AI.getParty();
                const newCombat = AI.getCombat();
                const newChar = newParty.characters[combat.currentCharacter || 0];
                const mpAfter = newChar.mp.current;
                const enemyHpAfter = newCombat.enemies?.[0]?.hp;

                if (mpAfter < mpBefore) {
                    console.log(`✅ MP consumed: ${mpBefore - mpAfter}`);

                    if (enemyHpBefore && enemyHpAfter && enemyHpAfter < enemyHpBefore) {
                        console.log(`✅ Damage dealt: ${enemyHpBefore - enemyHpAfter}`);
                    } else if (currentChar.knownSpells[0].includes('heal')) {
                        console.log('✅ Healing spell cast (check party HP)');
                    }
                } else {
                    console.log('❌ No MP consumed - spell may have failed');
                }
            } else {
                console.log('❌ Spell menu did not open');
            }
        } else {
            console.log('Current character has no spells');
        }
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('Summary:');
    console.log(`- Spell Registry: ${allSpells.length > 0 ? '✅' : '❌'}`);
    console.log(`- Character Spells: ${party.characters.some(c => c.knownSpells?.length > 0) ? '✅' : '❌'}`);
    console.log(`- Combat Integration: ${AI.getScene() === 'Combat' ? '✅' : '⚠️ (not tested)'}`);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run the test
console.log('To test magic system, run: testMagicSystem()');
console.log('Or copy/paste this entire script into the console.');