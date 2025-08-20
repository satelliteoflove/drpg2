import { GameServices } from './GameServices';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private gameServices?: GameServices;
  
  private constructor() {}

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public initialize(dependencies: { canvas: HTMLCanvasElement }): void {
    this.gameServices = new GameServices(dependencies);
  }

  public getGameServices(): GameServices {
    if (!this.gameServices) {
      throw new Error('ServiceRegistry not initialized. Call initialize() first.');
    }
    return this.gameServices;
  }

  public dispose(): void {
    if (this.gameServices) {
      this.gameServices.dispose();
      this.gameServices = undefined;
    }
  }

  public isInitialized(): boolean {
    return this.gameServices !== undefined;
  }
}

export const serviceRegistry = ServiceRegistry.getInstance();