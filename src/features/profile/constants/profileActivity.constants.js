// Known activity event types and how to present them.
// ProfileActivityEngine falls back to ACTIVITY_TYPES.default for unknown types,
// so new backend event types never crash the UI - they just render generically.
export const ACTIVITY_TYPES = {
  post_created: { icon: "📝", label: "created a post" },
  reel_created: { icon: "🎬", label: "shared a reel" },
  supporter_gained: { icon: "🤝", label: "gained a new supporter" },
  achievement_unlocked: { icon: "🏆", label: "unlocked an achievement" },
  streak_milestone: { icon: "🔥", label: "hit a streak milestone" },
  default: { icon: "•", label: "did something" },
};

export const ACTIVITY_PAGE_SIZE = 20;