// Derived, presentation-ready stat cards. Kept separate from the raw
// ProfileStatsModel so adding/reordering cards doesn't touch the model.
export function buildImpactCards(stats) {
  if (!stats) return [];
  return [
    { key: "posts", title: "Posts", value: stats.postsCount },
    { key: "supporters", title: "Supporters", value: stats.supportersCount },
    { key: "supporting", title: "Supporting", value: stats.supportingCount },
    { key: "streaks", title: "Streaks", value: stats.streakCount },
  ];
}