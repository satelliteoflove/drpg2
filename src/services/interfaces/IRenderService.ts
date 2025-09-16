import { RenderManager } from '../../core/RenderManager';

export interface IRenderService {
  getRenderManager(): RenderManager;
  startFrame(currentTime: number): boolean;
  endFrame(): void;
  dispose(): void;
}

export interface IRenderStats {
  fps: number;
  frameTime: number;
  drawnObjects: number;
  culledObjects: number;
  layerCount: number;
  dirtyRegions: number;
}
