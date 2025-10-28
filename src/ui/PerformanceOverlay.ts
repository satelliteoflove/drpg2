import { PerformanceMonitor } from '../utils/PerformanceMonitor';

export class PerformanceOverlay {
  private performanceMonitor: PerformanceMonitor;
  private isVisible: boolean = false;

  private readonly OVERLAY_WIDTH = 280;
  private readonly OVERLAY_HEIGHT = 180;
  private readonly OVERLAY_X = 10;
  private readonly OVERLAY_Y = 580;
  private readonly PADDING = 10;
  private readonly LINE_HEIGHT = 16;

  constructor(_canvas: HTMLCanvasElement) {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.loadVisibility();
  }

  private loadVisibility(): void {
    try {
      const stored = localStorage.getItem('performanceOverlay.visible');
      if (stored !== null) {
        this.isVisible = stored === 'true';
      }
    } catch (error) {
      this.isVisible = false;
    }
  }

  private saveVisibility(): void {
    try {
      localStorage.setItem('performanceOverlay.visible', String(this.isVisible));
    } catch (error) {
      console.error('Failed to save overlay visibility');
    }
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.saveVisibility();
  }

  public show(): void {
    this.isVisible = true;
    this.saveVisibility();
  }

  public hide(): void {
    this.isVisible = false;
    this.saveVisibility();
  }

  public isOpen(): boolean {
    return this.isVisible;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isVisible) return;

    const metrics = this.performanceMonitor.getMetrics();

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(
      this.OVERLAY_X,
      this.OVERLAY_Y,
      this.OVERLAY_WIDTH,
      this.OVERLAY_HEIGHT
    );

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.OVERLAY_X,
      this.OVERLAY_Y,
      this.OVERLAY_WIDTH,
      this.OVERLAY_HEIGHT
    );

    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';

    let y = this.OVERLAY_Y + this.PADDING + this.LINE_HEIGHT;
    const x = this.OVERLAY_X + this.PADDING;

    ctx.fillText('PERFORMANCE', x, y);
    y += this.LINE_HEIGHT + 4;

    ctx.font = '12px monospace';
    ctx.fillStyle = this.getFPSColor(metrics.fps);
    ctx.fillText(`FPS: ${metrics.fps.toFixed(1)}`, x, y);
    y += this.LINE_HEIGHT;

    ctx.fillStyle = '#aaa';
    ctx.fillText(`Frame: ${metrics.frameTime.toFixed(2)}ms`, x, y);
    y += this.LINE_HEIGHT;

    ctx.fillText(`Update: ${metrics.updateTime.toFixed(2)}ms`, x, y);
    y += this.LINE_HEIGHT;

    ctx.fillText(`Render: ${metrics.renderTime.toFixed(2)}ms`, x, y);
    y += this.LINE_HEIGHT;

    ctx.fillText(`Raycast: ${metrics.raycastTime.toFixed(2)}ms`, x, y);
    y += this.LINE_HEIGHT + 4;

    ctx.fillStyle = '#666';
    ctx.fillText(`Avg: ${metrics.avgFrameTime.toFixed(2)}ms`, x, y);
    y += this.LINE_HEIGHT;

    const maxColor = metrics.maxFrameTime > 100 ? '#ff0000' : '#ffa500';
    ctx.fillStyle = maxColor;
    ctx.fillText(`Max: ${metrics.maxFrameTime.toFixed(2)}ms`, x, y);
    y += this.LINE_HEIGHT;

    if (metrics.spikeCount > 0) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`Spikes: ${metrics.spikeCount}`, x, y);
    }

    ctx.restore();
  }

  private getFPSColor(fps: number): string {
    if (fps >= 58) return '#00ff00';
    if (fps >= 45) return '#ffff00';
    if (fps >= 30) return '#ffa500';
    return '#ff0000';
  }
}
