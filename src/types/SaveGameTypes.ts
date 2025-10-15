import { GameState } from './GameTypes';

export type SaveGameVersion = '0.0.4';

export interface VersionedSaveGame extends GameState {
  version: SaveGameVersion;
}