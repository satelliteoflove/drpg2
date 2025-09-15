import { DebugLogger } from '../utils/DebugLogger';

// Feature flag definitions
export interface FeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
  experimental?: boolean;
  rolloutPercentage?: number;  // For gradual rollout
  enabledScenes?: string[];     // Specific scenes where feature is enabled
  metadata?: Record<string, any>;
}

// Feature flag keys
export enum FeatureFlagKey {
  ASCII_RENDERING = 'ascii_rendering',
  ASCII_TOWN_SCENE = 'ascii_town_scene',
  ASCII_SHOP_SCENE = 'ascii_shop_scene',
  ASCII_COMBAT_SCENE = 'ascii_combat_scene',
  ASCII_DUNGEON_SCENE = 'ascii_dungeon_scene',
  ASCII_INVENTORY_SCENE = 'ascii_inventory_scene',
  ASCII_DEBUG_OVERLAY = 'ascii_debug_overlay',
  PERFORMANCE_MONITORING = 'performance_monitoring',
  SAVE_ASCII_STATE = 'save_ascii_state',
  TERMINAL_MODE = 'terminal_mode'
}

// Feature flags configuration
class FeatureFlagsManager {
  private static instance: FeatureFlagsManager;
  private flags: Map<string, FeatureFlag>;
  private overrides: Map<string, boolean>;  // Runtime overrides
  private localStorage: Storage | null;

  private constructor() {
    this.flags = new Map();
    this.overrides = new Map();
    this.localStorage = typeof window !== 'undefined' ? window.localStorage : null;
    
    this.initializeFlags();
    this.loadOverrides();
  }

  public static getInstance(): FeatureFlagsManager {
    if (!FeatureFlagsManager.instance) {
      FeatureFlagsManager.instance = new FeatureFlagsManager();
    }
    return FeatureFlagsManager.instance;
  }

  private initializeFlags(): void {
    // ASCII Rendering System Flags
    this.registerFlag({
      name: FeatureFlagKey.ASCII_RENDERING,
      description: 'Enable ASCII-first rendering system globally',
      enabled: false,
      experimental: true
    });

    this.registerFlag({
      name: FeatureFlagKey.ASCII_TOWN_SCENE,
      description: 'Use ASCII rendering for Town scene',
      enabled: false,
      experimental: true,
      enabledScenes: ['town']
    });

    this.registerFlag({
      name: FeatureFlagKey.ASCII_SHOP_SCENE,
      description: 'Use ASCII rendering for Shop scene',
      enabled: false,
      experimental: true,
      enabledScenes: ['shop']
    });

    this.registerFlag({
      name: FeatureFlagKey.ASCII_COMBAT_SCENE,
      description: 'Use ASCII rendering for Combat scene',
      enabled: false,
      experimental: true,
      enabledScenes: ['combat']
    });

    this.registerFlag({
      name: FeatureFlagKey.ASCII_DUNGEON_SCENE,
      description: 'Use ASCII rendering for Dungeon scene',
      enabled: false,
      experimental: true,
      enabledScenes: ['dungeon']
    });

    this.registerFlag({
      name: FeatureFlagKey.ASCII_INVENTORY_SCENE,
      description: 'Use ASCII rendering for Inventory scene',
      enabled: false,
      experimental: true,
      enabledScenes: ['inventory']
    });

    this.registerFlag({
      name: FeatureFlagKey.ASCII_DEBUG_OVERLAY,
      description: 'Show ASCII state in debug overlay',
      enabled: false,
      experimental: false
    });

    this.registerFlag({
      name: FeatureFlagKey.PERFORMANCE_MONITORING,
      description: 'Enable performance monitoring',
      enabled: true,  // Already implemented and active
      experimental: false
    });

    this.registerFlag({
      name: FeatureFlagKey.SAVE_ASCII_STATE,
      description: 'Include ASCII state in save games',
      enabled: false,
      experimental: true
    });

    this.registerFlag({
      name: FeatureFlagKey.TERMINAL_MODE,
      description: 'Enable terminal/console rendering mode',
      enabled: false,
      experimental: true
    });

    DebugLogger.info('FeatureFlags', `Initialized ${this.flags.size} feature flags`);
  }

  private registerFlag(flag: FeatureFlag): void {
    this.flags.set(flag.name, flag);
  }

  private loadOverrides(): void {
    if (!this.localStorage) return;

    const stored = this.localStorage.getItem('featureFlags');
    if (stored) {
      try {
        const overrides = JSON.parse(stored);
        Object.entries(overrides).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            this.overrides.set(key, value);
            DebugLogger.info('FeatureFlags', `Loaded override: ${key} = ${value}`);
          }
        });
      } catch (error) {
        DebugLogger.error('FeatureFlags', 'Failed to load overrides', error);
      }
    }

    // Check URL parameters for overrides
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      params.forEach((value, key) => {
        if (key.startsWith('ff_')) {
          const flagKey = key.substring(3);
          const enabled = value === 'true' || value === '1';
          this.overrides.set(flagKey, enabled);
          DebugLogger.info('FeatureFlags', `URL override: ${flagKey} = ${enabled}`);
        }
      });
    }
  }

  private saveOverrides(): void {
    if (!this.localStorage) return;

    const overrides: Record<string, boolean> = {};
    this.overrides.forEach((value, key) => {
      overrides[key] = value;
    });

    this.localStorage.setItem('featureFlags', JSON.stringify(overrides));
  }

  // Check if a feature flag is enabled
  public isEnabled(key: string, sceneName?: string): boolean {
    // Check runtime override first
    if (this.overrides.has(key)) {
      return this.overrides.get(key)!;
    }

    const flag = this.flags.get(key);
    if (!flag) {
      DebugLogger.warn('FeatureFlags', `Unknown feature flag: ${key}`);
      return false;
    }

    // Check if flag is enabled for specific scene
    if (sceneName && flag.enabledScenes) {
      if (!flag.enabledScenes.includes(sceneName)) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      // Use a stable hash of some user identifier for consistent rollout
      // For now, just use a random check
      return Math.random() * 100 < flag.rolloutPercentage;
    }

    return flag.enabled;
  }

  // Set a runtime override for a flag
  public setOverride(key: string, enabled: boolean): void {
    this.overrides.set(key, enabled);
    this.saveOverrides();
    DebugLogger.info('FeatureFlags', `Set override: ${key} = ${enabled}`);
  }

  // Clear a runtime override
  public clearOverride(key: string): void {
    this.overrides.delete(key);
    this.saveOverrides();
    DebugLogger.info('FeatureFlags', `Cleared override: ${key}`);
  }

  // Clear all overrides
  public clearAllOverrides(): void {
    this.overrides.clear();
    this.saveOverrides();
    DebugLogger.info('FeatureFlags', 'Cleared all overrides');
  }

  // Get flag information
  public getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  // Get all flags
  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  // Get status of all flags
  public getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.flags.forEach((_flag, key) => {
      status[key] = this.isEnabled(key);
    });
    return status;
  }

  // Export configuration for debugging
  public exportConfig(): string {
    const config = {
      flags: Array.from(this.flags.entries()),
      overrides: Array.from(this.overrides.entries()),
      status: this.getStatus()
    };
    return JSON.stringify(config, null, 2);
  }
}

// Singleton instance export
export const FeatureFlags = FeatureFlagsManager.getInstance();

// Convenience functions
export function isFeatureEnabled(key: string, sceneName?: string): boolean {
  return FeatureFlags.isEnabled(key, sceneName);
}

export function setFeatureOverride(key: string, enabled: boolean): void {
  FeatureFlags.setOverride(key, enabled);
}

export function getFeatureStatus(): Record<string, boolean> {
  return FeatureFlags.getStatus();
}

// Console helper for debugging (accessible via browser console)
if (typeof window !== 'undefined') {
  (window as any).FeatureFlags = {
    enable: (key: string) => FeatureFlags.setOverride(key, true),
    disable: (key: string) => FeatureFlags.setOverride(key, false),
    clear: (key: string) => FeatureFlags.clearOverride(key),
    clearAll: () => FeatureFlags.clearAllOverrides(),
    isEnabled: (key: string) => FeatureFlags.isEnabled(key),
    status: () => console.table(FeatureFlags.getStatus()),
    export: () => console.log(FeatureFlags.exportConfig())
  };
  
  DebugLogger.info('FeatureFlags', 'Console helpers available: window.FeatureFlags');
}