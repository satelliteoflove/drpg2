import { RandomSelector } from './RandomSelector';

export class ColorPalette {
  private static cachedPalette: string[] | null = null;

  static getHSLPalette(): string[] {
    if (this.cachedPalette) {
      return this.cachedPalette;
    }

    const palette: string[] = [];
    const saturation = 70;

    for (let l = 0; l < 8; l++) {
      const lightness = 30 + (l * 50) / 7;

      for (let h = 0; h < 32; h++) {
        const hue = (h * 360) / 32;
        const color = `hsl(${Math.round(hue)}, ${saturation}%, ${Math.round(lightness)}%)`;
        palette.push(color);
      }
    }

    this.cachedPalette = palette;
    return palette;
  }

  static getRandomColor(): string {
    const palette = this.getHSLPalette();
    return RandomSelector.selectRandom(palette);
  }
}
