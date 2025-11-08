import { GAME_CONFIG } from '../../config/GameConstants';
import { DebugLogger } from '../../utils/DebugLogger';

export type CardinalDirection = 'north' | 'south' | 'east' | 'west';
export type AnimationType = 'turn' | 'move';

export class TurnAnimationController {
  private isAnimating: boolean = false;
  private animationType: AnimationType = 'turn';

  private startAngle: number = 0;
  private endAngle: number = 0;

  private startPos: { x: number; y: number } = { x: 0, y: 0 };
  private endPos: { x: number; y: number } = { x: 0, y: 0 };

  private currentFrame: number = 0;
  private totalFrames: number = 0;
  private onCompleteCallback: (() => void) | null = null;

  private readonly angleMap: Record<CardinalDirection, number> = {
    north: -90,
    east: 0,
    south: 90,
    west: 180,
  };

  public startTurn(from: CardinalDirection, to: CardinalDirection, onComplete: () => void): void {
    this.animationType = 'turn';
    this.startAngle = this.angleMap[from];
    this.endAngle = this.angleMap[to];
    this.currentFrame = 0;
    this.totalFrames = GAME_CONFIG.DUNGEON.TURN_ANIMATION_FRAMES;
    this.isAnimating = true;
    this.onCompleteCallback = onComplete;

    DebugLogger.debug(
      'TurnAnimationController',
      `Starting turn: ${from} (${this.startAngle}°) → ${to} (${this.endAngle}°), ${this.totalFrames} frames`
    );
  }

  public startMove(fromPos: { x: number; y: number }, toPos: { x: number; y: number }, onComplete: () => void): void {
    this.animationType = 'move';
    this.startPos = { ...fromPos };
    this.endPos = { ...toPos };
    this.currentFrame = 0;
    this.totalFrames = GAME_CONFIG.DUNGEON.MOVE_ANIMATION_FRAMES;
    this.isAnimating = true;
    this.onCompleteCallback = onComplete;

    DebugLogger.debug(
      'TurnAnimationController',
      `Starting move: (${fromPos.x}, ${fromPos.y}) → (${toPos.x}, ${toPos.y}), ${this.totalFrames} frames`
    );
  }

  public getCurrentAngle(): number | null {
    if (!this.isAnimating || this.animationType !== 'turn') {
      return null;
    }

    const t = this.currentFrame / this.totalFrames;
    let angleDiff = this.endAngle - this.startAngle;

    if (angleDiff > 180) {
      angleDiff -= 360;
    } else if (angleDiff < -180) {
      angleDiff += 360;
    }

    const currentAngle = this.startAngle + angleDiff * t;

    DebugLogger.debug(
      'TurnAnimationController',
      `Frame ${this.currentFrame}/${this.totalFrames}: angle=${currentAngle.toFixed(1)}°`
    );

    return currentAngle;
  }

  public getCurrentPositionOffset(): { dx: number; dy: number } {
    if (!this.isAnimating || this.animationType !== 'move') {
      return { dx: 0, dy: 0 };
    }

    const t = this.currentFrame / Math.max(1, this.totalFrames);
    const dx = (this.endPos.x - this.startPos.x) * t;
    const dy = (this.endPos.y - this.startPos.y) * t;

    DebugLogger.debug(
      'TurnAnimationController',
      `Move animation frame ${this.currentFrame}/${this.totalFrames}: t=${t.toFixed(2)}, start=(${this.startPos.x}, ${this.startPos.y}), end=(${this.endPos.x}, ${this.endPos.y}), offset=(${dx.toFixed(2)}, ${dy.toFixed(2)})`
    );

    return { dx, dy };
  }

  public advanceFrame(): boolean {
    if (!this.isAnimating) {
      return false;
    }

    this.currentFrame++;

    if (this.currentFrame >= this.totalFrames) {
      this.completeAnimation();
      return true;
    }

    return false;
  }

  private completeAnimation(): void {
    DebugLogger.debug('TurnAnimationController', `${this.animationType} animation complete`);
    this.isAnimating = false;

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
      this.onCompleteCallback = null;
    }
  }

  public isActive(): boolean {
    return this.isAnimating;
  }

  public reset(): void {
    this.isAnimating = false;
    this.onCompleteCallback = null;
    this.currentFrame = 0;
  }

  public getAnimationType(): AnimationType {
    return this.animationType;
  }
}
