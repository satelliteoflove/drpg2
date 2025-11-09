import { DebugLogger } from '../utils/DebugLogger';

export interface ServiceIdentifier<T = any> {
  name: string;
  type: new (...args: any[]) => T;
}

export interface ServiceRegistration<T = any> {
  identifier: ServiceIdentifier<T>;
  factory: () => T;
  singleton: boolean;
  instance?: T;
}

export class ServiceContainer {
  private registrations = new Map<string, ServiceRegistration>();
  private instances = new Map<string, any>();

  public register<T>(
    identifier: ServiceIdentifier<T>,
    factory: () => T,
    options: { singleton?: boolean } = {}
  ): void {
    const { singleton = true } = options;

    this.registrations.set(identifier.name, {
      identifier,
      factory,
      singleton,
    });
  }

  public registerInstance<T>(identifier: ServiceIdentifier<T>, instance: T): void {
    this.registrations.set(identifier.name, {
      identifier,
      factory: () => instance,
      singleton: true,
      instance,
    });
    this.instances.set(identifier.name, instance);
  }

  public resolve<T>(identifier: ServiceIdentifier<T>): T {
    const registration = this.registrations.get(identifier.name);
    if (!registration) {
      throw new Error(`Service ${identifier.name} not registered`);
    }

    if (registration.singleton) {
      if (!this.instances.has(identifier.name)) {
        const instance = registration.factory();
        this.instances.set(identifier.name, instance);
        return instance;
      }
      return this.instances.get(identifier.name) as T;
    }

    return registration.factory();
  }

  public has<T>(identifier: ServiceIdentifier<T>): boolean {
    return this.registrations.has(identifier.name);
  }

  public clear(): void {
    this.registrations.clear();
    this.instances.clear();
  }

  public dispose(): void {
    for (const instance of this.instances.values()) {
      if (instance && typeof instance.dispose === 'function') {
        try {
          instance.dispose();
        } catch (error) {
          DebugLogger.warn('ServiceContainer', 'Error disposing service instance', { error });
        }
      }
    }
    this.clear();
  }
}

export const createServiceIdentifier = <T>(
  name: string,
  type: new (...args: any[]) => T
): ServiceIdentifier<T> => ({
  name,
  type,
});

export const serviceContainer = new ServiceContainer();
