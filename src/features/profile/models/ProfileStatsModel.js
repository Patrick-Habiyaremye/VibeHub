export function createProfileStatsModel({ postsCount = 0, reelsCount = 0, supportersCount = 0, supportingCount = 0, streakCount = 0 } = {}) {
  return { postsCount, reelsCount, supportersCount, supportingCount, streakCount };
}