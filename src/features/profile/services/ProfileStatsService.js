import { normalizeProfileStats } from "../utils/normalizeProfileStats";

export const ProfileStatsService = {
  computeStats({ profile, posts, reels }) {
    return normalizeProfileStats({ profile, posts, reels });
  },
};