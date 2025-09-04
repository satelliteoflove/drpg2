import { Game } from './core/Game';
import './config/FeatureFlags'; // Initialize feature flags and expose to window

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const game = new Game(canvas);
    game.start();
});