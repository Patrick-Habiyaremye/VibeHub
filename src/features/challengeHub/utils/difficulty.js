// utils/difficulty.js

export const DifficultyLevels = Object.freeze({
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
  EXTREME: "EXTREME",
});

export const DifficultyConfig = {
  EASY: {
    multiplier: 1,
    xp: 50,
    timeEstimate: 5, // minutes
  },
  MEDIUM: {
    multiplier: 1.5,
    xp: 100,
    timeEstimate: 15,
  },
  HARD: {
    multiplier: 2.5,
    xp: 250,
    timeEstimate: 30,
  },
  EXTREME: {
    multiplier: 5,
    xp: 500,
    timeEstimate: 60,
  },
};

export const getDifficultyConfig = (difficulty) => {
  const config = DifficultyConfig[difficulty];

  if (!config) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }

  return config;
};