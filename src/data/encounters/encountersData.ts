export const encountersData = {
  level1: {
    level: 1,
    dropRateMultiplier: 2.0,
    encounters: [
      {
        monsterId: "slime",
        levelRange: [1, 2],
        weight: 40
      },
      {
        monsterId: "goblin", 
        levelRange: [1, 2],
        weight: 35
      }
    ]
  },
  level2: {
    level: 2,
    dropRateMultiplier: 1.8,
    encounters: [
      {
        monsterId: "slime",
        levelRange: [1, 3],
        weight: 20
      },
      {
        monsterId: "goblin",
        levelRange: [2, 3],
        weight: 35
      },
      {
        monsterId: "orc",
        levelRange: [2, 4],
        weight: 25
      }
    ]
  },
  level3: {
    level: 3,
    dropRateMultiplier: 1.5,
    encounters: [
      {
        monsterId: "goblin",
        levelRange: [2, 4],
        weight: 20
      },
      {
        monsterId: "orc",
        levelRange: [3, 5],
        weight: 40
      }
    ]
  }
};