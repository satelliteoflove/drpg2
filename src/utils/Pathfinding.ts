import { PriorityQueue } from './PriorityQueue';
import { DungeonTile } from '../types/GameTypes';

export interface Point {
  x: number;
  y: number;
}

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class Pathfinding {
  public static findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    grid: DungeonTile[][],
    options: {
      preferStraightLines?: boolean;
      preferExistingCorridors?: boolean;
      avoidRooms?: boolean;
    } = {}
  ): Point[] | null {
    const {
      preferStraightLines = true,
      preferExistingCorridors = true,
      avoidRooms = true
    } = options;

    const openSet = new PriorityQueue<PathNode>();
    const closedSet = new Set<string>();
    const openSetMap = new Map<string, PathNode>();

    const startNode: PathNode = {
      x: startX,
      y: startY,
      g: 0,
      h: this.heuristic(startX, startY, endX, endY),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.insert(startNode, startNode.f);
    openSetMap.set(this.coordKey(startX, startY), startNode);

    while (!openSet.isEmpty()) {
      const current = openSet.extractMin();
      if (!current) break;

      const currentKey = this.coordKey(current.x, current.y);
      openSetMap.delete(currentKey);

      if (current.x === endX && current.y === endY) {
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      const neighbors = [
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y }
      ];

      for (const neighbor of neighbors) {
        if (neighbor.x < 1 || neighbor.x >= grid[0].length - 1) continue;
        if (neighbor.y < 1 || neighbor.y >= grid.length - 1) continue;

        const key = this.coordKey(neighbor.x, neighbor.y);
        if (closedSet.has(key)) continue;

        let moveCost = 1;

        if (preferStraightLines && current.parent) {
          const prevDx = current.x - current.parent.x;
          const prevDy = current.y - current.parent.y;
          const newDx = neighbor.x - current.x;
          const newDy = neighbor.y - current.y;
          if (prevDx !== newDx || prevDy !== newDy) {
            moveCost += 0.5;
          }
        }

        const tile = grid[neighbor.y][neighbor.x];
        if (preferExistingCorridors && tile.type === 'floor') {
          moveCost -= 0.3;
        }

        if (avoidRooms && tile.type === 'floor') {
          moveCost += 2.0;
        }

        const g = current.g + moveCost;
        const h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
        const f = g + h;

        const existingNode = openSetMap.get(key);
        if (existingNode && g >= existingNode.g) continue;

        const neighborNode: PathNode = {
          x: neighbor.x,
          y: neighbor.y,
          g: g,
          h: h,
          f: f,
          parent: current
        };

        openSet.insert(neighborNode, f);
        openSetMap.set(key, neighborNode);
      }
    }

    return null;
  }

  private static heuristic(x1: number, y1: number, x2: number, y2: number): number {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    return dx + dy + 0.001 * Math.min(dx, dy);
  }

  private static reconstructPath(node: PathNode): Point[] {
    const path: Point[] = [];
    let current: PathNode | null = node;
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }

  private static coordKey(x: number, y: number): string {
    return `${x},${y}`;
  }
}
