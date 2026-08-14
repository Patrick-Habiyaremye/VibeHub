import { DEFAULT_REPUTATION_LEVEL, DEFAULT_REPUTATION_TITLE } from "../constants/profileReputation.constants";

export function createProfileReputationModel(raw = {}) {
  const progress = Number.isFinite(raw.progress) ? raw.progress : 0;
  return {
    level: raw.level ?? DEFAULT_REPUTATION_LEVEL,
    title: raw.title ?? DEFAULT_REPUTATION_TITLE,
    progress: Math.min(1, Math.max(0, progress)), // clamp 0..1
    unlockedAchievements: Array.isArray(raw.achievements?.unlocked)
      ? raw.achievements.unlocked
      : [],
  };
}