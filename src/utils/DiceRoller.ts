export class DiceRoller {
  static roll(notation: string): number {
    const singleDiceMatch = notation.match(/^(\d+)d(\d+)(?:([+-]\d+))?$/);
    if (singleDiceMatch) {
      const [, count, sides, modifier = '0'] = singleDiceMatch;
      const diceCount = parseInt(count);
      const diceSides = parseInt(sides);
      const modifierValue = parseInt(modifier);

      let total = modifierValue;
      for (let i = 0; i < diceCount; i++) {
        total += Math.floor(Math.random() * diceSides) + 1;
      }

      return Math.max(0, total);
    }

    const dicePattern = /(\d+)d(\d+)/g;
    let evaluatedFormula = notation;
    let match;

    while ((match = dicePattern.exec(notation)) !== null) {
      const diceCount = parseInt(match[1]);
      const diceSides = parseInt(match[2]);
      let rollResult = 0;

      for (let i = 0; i < diceCount; i++) {
        rollResult += Math.floor(Math.random() * diceSides) + 1;
      }

      evaluatedFormula = evaluatedFormula.replace(match[0], rollResult.toString());
    }

    const parts = evaluatedFormula.split(/([+\-])/);
    let result = parseInt(parts[0]) || 0;

    for (let i = 1; i < parts.length; i += 2) {
      const operator = parts[i];
      const operand = parseInt(parts[i + 1]) || 0;

      if (operator === '+') {
        result += operand;
      } else if (operator === '-') {
        result -= operand;
      }
    }

    return Math.max(0, result);
  }

  static rollMultiple(notation: string, times: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < times; i++) {
      results.push(this.roll(notation));
    }
    return results;
  }

  static rollWithAdvantage(notation: string): number {
    const roll1 = this.roll(notation);
    const roll2 = this.roll(notation);
    return Math.max(roll1, roll2);
  }

  static rollWithDisadvantage(notation: string): number {
    const roll1 = this.roll(notation);
    const roll2 = this.roll(notation);
    return Math.min(roll1, roll2);
  }

  static rollInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static rollPercentile(): number {
    return this.rollInRange(1, 100);
  }

  static rollD20(): number {
    return this.rollInRange(1, 20);
  }

  static checkSuccess(chance: number): boolean {
    return this.rollPercentile() <= chance;
  }

  static evaluateFormula(formula: string, level: number = 1): number {
    if (!formula) {
      return 0;
    }
    const processed = formula.replace(/level/gi, level.toString());

    const dicePattern = /(\d+d\d+)/g;
    const diceMatches = processed.match(dicePattern);

    let evaluatedFormula = processed;
    if (diceMatches) {
      diceMatches.forEach(diceNotation => {
        const rollResult = this.roll(diceNotation);
        evaluatedFormula = evaluatedFormula.replace(diceNotation, rollResult.toString());
      });
    }

    try {
      const parts = evaluatedFormula.split(/([+\-*\/])/);
      let result = parseInt(parts[0]);

      for (let i = 1; i < parts.length; i += 2) {
        const operator = parts[i];
        const operand = parseInt(parts[i + 1]);

        switch (operator) {
          case '+': result += operand; break;
          case '-': result -= operand; break;
          case '*': result *= operand; break;
          case '/': result = Math.floor(result / operand); break;
        }
      }

      return result;
    } catch {
      return 0;
    }
  }
}