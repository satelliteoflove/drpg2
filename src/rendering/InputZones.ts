import { InputZone } from './SceneDeclaration';
import { DebugLogger } from '../utils/DebugLogger';

// Common input zone patterns
export class InputZonePatterns {
  // Create zones for a vertical menu
  public static createMenuZones(
    x: number,
    y: number,
    items: Array<{ id: string; label: string; enabled?: boolean }>,
    itemHeight: number = 1
  ): InputZone[] {
    return items.map((item, index) => ({
      id: `menu-item-${item.id}`,
      bounds: {
        x,
        y: y + (index * itemHeight),
        width: item.label.length + 4,
        height: itemHeight
      },
      type: 'menu-item' as const,
      enabled: item.enabled !== false,
      keyBinding: (index + 1).toString()
    }));
  }
  
  // Create zones for a grid (inventory, etc)
  public static createGridZones(
    x: number,
    y: number,
    cols: number,
    rows: number,
    cellWidth: number = 3,
    cellHeight: number = 1
  ): InputZone[] {
    const zones: InputZone[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        zones.push({
          id: `grid-cell-${col}-${row}`,
          bounds: {
            x: x + (col * cellWidth),
            y: y + (row * cellHeight),
            width: cellWidth,
            height: cellHeight
          },
          type: 'grid-cell' as const,
          enabled: true
        });
      }
    }
    
    return zones;
  }
  
  // Create zones for buttons
  public static createButtonZones(
    buttons: Array<{
      id: string;
      label: string;
      x: number;
      y: number;
      keyBinding?: string;
      enabled?: boolean;
    }>
  ): InputZone[] {
    return buttons.map(button => ({
      id: `button-${button.id}`,
      bounds: {
        x: button.x,
        y: button.y,
        width: button.label.length + 2,
        height: 1
      },
      type: 'button' as const,
      enabled: button.enabled !== false,
      keyBinding: button.keyBinding
    }));
  }
  
  // Create zone for entire area (for background clicks)
  public static createAreaZone(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): InputZone {
    return {
      id,
      bounds: { x, y, width, height },
      type: 'custom' as const,
      enabled: true
    };
  }
}

// Zone manager for handling complex interactions
export class InputZoneManager {
  private zones: Map<string, InputZone> = new Map();
  private zoneGroups: Map<string, string[]> = new Map();
  
  // Add a zone
  public addZone(zone: InputZone): void {
    this.zones.set(zone.id, zone);
    DebugLogger.debug('InputZoneManager', `Added zone: ${zone.id}`);
  }
  
  // Add multiple zones
  public addZones(zones: InputZone[]): void {
    zones.forEach(zone => this.addZone(zone));
  }
  
  // Remove a zone
  public removeZone(id: string): void {
    this.zones.delete(id);
    
    // Remove from groups
    this.zoneGroups.forEach(group => {
      const index = group.indexOf(id);
      if (index !== -1) {
        group.splice(index, 1);
      }
    });
  }
  
  // Clear all zones
  public clear(): void {
    this.zones.clear();
    this.zoneGroups.clear();
  }
  
  // Create a zone group (for switching between different sets of zones)
  public createGroup(groupId: string, zoneIds: string[]): void {
    this.zoneGroups.set(groupId, zoneIds);
    DebugLogger.debug('InputZoneManager', `Created group: ${groupId} with ${zoneIds.length} zones`);
  }
  
  // Activate a zone group
  public activateGroup(groupId: string): void {
    // Disable all zones
    this.zones.forEach(zone => zone.enabled = false);
    
    // Enable zones in the group
    const group = this.zoneGroups.get(groupId);
    if (group) {
      group.forEach(zoneId => {
        const zone = this.zones.get(zoneId);
        if (zone) {
          zone.enabled = true;
        }
      });
      DebugLogger.debug('InputZoneManager', `Activated group: ${groupId}`);
    }
  }
  
  // Get all enabled zones
  public getEnabledZones(): InputZone[] {
    return Array.from(this.zones.values()).filter(zone => zone.enabled);
  }
  
  // Get zone by ID
  public getZone(id: string): InputZone | undefined {
    return this.zones.get(id);
  }
  
  // Enable/disable specific zone
  public setZoneEnabled(id: string, enabled: boolean): void {
    const zone = this.zones.get(id);
    if (zone) {
      zone.enabled = enabled;
      DebugLogger.debug('InputZoneManager', `Zone ${id} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
  
  // Find overlapping zones at position
  public findZonesAt(x: number, y: number): InputZone[] {
    const overlapping: InputZone[] = [];
    
    this.zones.forEach(zone => {
      if (!zone.enabled) return;
      
      const bounds = zone.bounds;
      if (x >= bounds.x && x < bounds.x + bounds.width &&
          y >= bounds.y && y < bounds.y + bounds.height) {
        overlapping.push(zone);
      }
    });
    
    return overlapping;
  }
  
  // Get zones in a specific area
  public getZonesInArea(x: number, y: number, width: number, height: number): InputZone[] {
    const zonesInArea: InputZone[] = [];
    
    this.zones.forEach(zone => {
      const bounds = zone.bounds;
      
      // Check if zone overlaps with area
      if (!(bounds.x + bounds.width <= x ||
            bounds.x >= x + width ||
            bounds.y + bounds.height <= y ||
            bounds.y >= y + height)) {
        zonesInArea.push(zone);
      }
    });
    
    return zonesInArea;
  }
  
  // Debug visualization - create ASCII representation of zones
  public visualizeZones(width: number = 80, height: number = 25): string {
    const grid: string[][] = [];
    
    // Initialize grid
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = '.';
      }
    }
    
    // Draw zones
    this.zones.forEach((zone, id) => {
      if (!zone.enabled) return;
      
      const bounds = zone.bounds;
      const char = id[0].toUpperCase();
      
      for (let y = bounds.y; y < bounds.y + bounds.height && y < height; y++) {
        for (let x = bounds.x; x < bounds.x + bounds.width && x < width; x++) {
          if (y >= 0 && x >= 0) {
            grid[y][x] = char;
          }
        }
      }
    });
    
    return grid.map(row => row.join('')).join('\n');
  }
}