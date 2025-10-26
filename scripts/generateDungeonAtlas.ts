import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { SegmentImageGenerator } from '../src/ui/SegmentImageGenerator';
import { SegmentBasedDungeonRenderer } from '../src/ui/SegmentBasedDungeonRenderer';

(global as any).document = {
  createElement: (type: string) => {
    if (type === 'canvas') {
      return createCanvas(0, 0);
    }
    throw new Error(`createElement('${type}') not supported in Node.js context`);
  },
};

interface ColorScheme {
  wall: string;
  mortar: string;
  floor: string;
  ceiling: string;
}

interface WallConfig {
  L: number;
  R: number;
  F: number;
  hasLeftWall: boolean;
  hasRightWall: boolean;
  hasFrontWall: boolean;
}

const COLOR_SCHEMES: Record<string, ColorScheme> = {
  warm: {
    wall: '#C87533',
    mortar: '#8B5A2B',
    floor: '#A0522D',
    ceiling: '#654321',
  },
  stone: {
    wall: '#708090',
    mortar: '#4A5568',
    floor: '#556B2F',
    ceiling: '#2F4F4F',
  },
  dark: {
    wall: '#3A3A3A',
    mortar: '#1A1A1A',
    floor: '#2A2A2A',
    ceiling: '#0A0A0A',
  },
};

const WALL_CONFIGS: WallConfig[] = [
  { L: 0, R: 0, F: 0, hasLeftWall: false, hasRightWall: false, hasFrontWall: false },
  { L: 1, R: 0, F: 0, hasLeftWall: true, hasRightWall: false, hasFrontWall: false },
  { L: 0, R: 1, F: 0, hasLeftWall: false, hasRightWall: true, hasFrontWall: false },
  { L: 1, R: 1, F: 0, hasLeftWall: true, hasRightWall: true, hasFrontWall: false },
  { L: 0, R: 0, F: 1, hasLeftWall: false, hasRightWall: false, hasFrontWall: true },
  { L: 1, R: 0, F: 1, hasLeftWall: true, hasRightWall: false, hasFrontWall: true },
  { L: 0, R: 1, F: 1, hasLeftWall: false, hasRightWall: true, hasFrontWall: true },
  { L: 1, R: 1, F: 1, hasLeftWall: true, hasRightWall: true, hasFrontWall: true },
];

const VIEWPORT_WIDTH = 460;
const VIEWPORT_HEIGHT = 310;
const MAX_DEPTH = 4;

function generateCellAtlas() {
  console.log('Starting dungeon cell atlas generation...');

  const generator = new SegmentImageGenerator(VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MAX_DEPTH);
  const segments = generator.generateAllSegments();

  let totalGenerated = 0;

  for (const [schemeName] of Object.entries(COLOR_SCHEMES)) {
    console.log(`\nGenerating ${schemeName} color scheme...`);

    const renderer = new SegmentBasedDungeonRenderer(segments);
    const outputDir = path.join(__dirname, '..', 'src', 'assets', 'dungeon', 'cells', schemeName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const config of WALL_CONFIGS) {
      for (let depth = 0; depth < MAX_DEPTH; depth++) {
        const canvas = createCanvas(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        const ctx = canvas.getContext('2d');

        const corridorSegment = {
          depth,
          hasLeftWall: config.hasLeftWall,
          hasRightWall: config.hasRightWall,
          hasFrontWall: config.hasFrontWall,
          hasLeftCorridorFarWall: false,
          hasRightCorridorFarWall: false,
        };

        renderer.drawCorridor(ctx as any, [corridorSegment], MAX_DEPTH - 1);

        const filename = `d${depth}_L${config.L}R${config.R}F${config.F}.png`;
        const filepath = path.join(outputDir, filename);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filepath, buffer);

        totalGenerated++;

        if (totalGenerated % 8 === 0) {
          console.log(`  Generated ${totalGenerated} cells...`);
        }
      }
    }

    console.log(`  ✓ Completed ${schemeName} scheme (32 cells)`);
  }

  console.log(`\n✓ Atlas generation complete! Generated ${totalGenerated} total cells.`);
  console.log(`  Output: src/assets/dungeon/cells/{warm,stone,dark}/`);
}

try {
  generateCellAtlas();
} catch (error) {
  console.error('Error generating atlas:', error);
  process.exit(1);
}
