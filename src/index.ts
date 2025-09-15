import { Game } from './core/Game';
import './config/FeatureFlags'; // Initialize feature flags and expose to window
// import './utils/ASCIIDebugger'; // Temporarily disabled - needs refactoring

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const game = new Game(canvas);
    game.start();

    // Expose game and feature flags to window for testing
    if (typeof window !== 'undefined') {
        (window as any).drpg = {
            game: game,
            featureFlags: (window as any).featureFlags
        };
        // Also keep direct reference for backward compatibility
        (window as any).game = game;
    }
});