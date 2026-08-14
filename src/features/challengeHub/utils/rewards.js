// utils/rewards.js

import { getDifficultyConfig } from "./difficulty.js";

const MAX_XP_PER_CHALLENGE = 1000;
const MIN_CONFIDENCE = 0.3;

export const calculateReward = ({
  difficulty,
  confidence = 1,
}) => {
  if (confidence < MIN_CONFIDENCE) {
    return {
      xp: 0,
      coins: 0,
      reputation: -5, // penalty
    };
  }

  const { xp: baseXP, multiplier } =
    getDifficultyConfig(difficulty);

  let xp = baseXP * multiplier * confidence;

  xp = Math.min(Math.floor(xp), MAX_XP_PER_CHALLENGE);

  return {
    xp,
    coins: Math.floor(xp / 10),
    reputation: Math.floor(xp * 0.5),
  };
};