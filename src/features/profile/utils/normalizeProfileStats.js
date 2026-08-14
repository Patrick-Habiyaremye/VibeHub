import { createProfileStatsModel } from "../models/ProfileStatsModel";

export function normalizeProfileStats({ profile, posts = [], reels = [] } = {}) {
  return createProfileStatsModel({
    postsCount: posts.length,
    reelsCount: reels.length,
    supportersCount: profile?.supportersCount ?? 0,
    supportingCount: profile?.supportingCount ?? 0,
    streakCount: profile?.streakCount ?? 0,
  });
}