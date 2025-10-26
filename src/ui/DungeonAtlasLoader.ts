import { DebugLogger } from '../utils/DebugLogger';

export type ColorSchemeName = 'warm' | 'stone' | 'dark';

export class DungeonAtlasLoader {
  private atlas: Map<string, HTMLImageElement> = new Map();
  private currentScheme: ColorSchemeName = 'warm';
  private loading: boolean = false;
  private loaded: boolean = false;
  private loadError: Error | null = null;

  private readonly WALL_CONFIGS = [
    { L: 0, R: 0, F: 0 },
    { L: 1, R: 0, F: 0 },
    { L: 0, R: 1, F: 0 },
    { L: 1, R: 1, F: 0 },
    { L: 0, R: 0, F: 1 },
    { L: 1, R: 0, F: 1 },
    { L: 0, R: 1, F: 1 },
    { L: 1, R: 1, F: 1 },
  ];

  private readonly MAX_DEPTH = 4;

  public async load(scheme: ColorSchemeName = 'warm'): Promise<void> {
    if (this.loading) {
      DebugLogger.warn('DungeonAtlasLoader', 'Load already in progress');
      return;
    }

    if (this.loaded && this.currentScheme === scheme) {
      DebugLogger.debug('DungeonAtlasLoader', `Atlas already loaded for scheme: ${scheme}`);
      return;
    }

    this.loading = true;
    this.loaded = false;
    this.loadError = null;
    this.currentScheme = scheme;
    this.atlas.clear();

    DebugLogger.info('DungeonAtlasLoader', `Loading atlas for scheme: ${scheme}`);

    const loadPromises: Promise<void>[] = [];

    for (const config of this.WALL_CONFIGS) {
      for (let depth = 0; depth < this.MAX_DEPTH; depth++) {
        const key = `d${depth}_L${config.L}R${config.R}F${config.F}`;
        const path = `assets/dungeon/cells/${scheme}/${key}.png`;

        const promise = this.loadImage(key, path);
        loadPromises.push(promise);
      }
    }

    try {
      await Promise.all(loadPromises);
      this.loaded = true;
      this.loading = false;
      DebugLogger.info('DungeonAtlasLoader', `Successfully loaded ${this.atlas.size} cells`);
    } catch (error) {
      this.loadError = error as Error;
      this.loading = false;
      this.loaded = false;
      DebugLogger.error('DungeonAtlasLoader', 'Failed to load atlas', error);
      throw error;
    }
  }

  private async loadImage(key: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.atlas.set(key, img);
        resolve();
      };

      img.onerror = (error) => {
        DebugLogger.error('DungeonAtlasLoader', `Failed to load image: ${path}`, error);
        reject(new Error(`Failed to load ${path}`));
      };

      img.src = path;
    });
  }

  public getCell(depth: number, hasLeft: boolean, hasRight: boolean, hasFront: boolean): HTMLImageElement | null {
    const L = hasLeft ? 1 : 0;
    const R = hasRight ? 1 : 0;
    const F = hasFront ? 1 : 0;
    const key = `d${depth}_L${L}R${R}F${F}`;

    const cell = this.atlas.get(key);

    if (!cell) {
      DebugLogger.warn('DungeonAtlasLoader', `Cell not found: ${key}`);
    }

    return cell || null;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public getLoadError(): Error | null {
    return this.loadError;
  }

  public getCurrentScheme(): ColorSchemeName {
    return this.currentScheme;
  }

  public async switchScheme(scheme: ColorSchemeName): Promise<void> {
    if (this.currentScheme === scheme && this.loaded) {
      return;
    }

    await this.load(scheme);
  }

  public getLoadedCellCount(): number {
    return this.atlas.size;
  }

  public getExpectedCellCount(): number {
    return this.WALL_CONFIGS.length * this.MAX_DEPTH;
  }
}
