// features/reels/engines/ReelRecommendationEngine.js
//
// NEW FILE. Pure interface, per §29 — no scoring logic, no fake AI. The
// UI (ReelFeed's fetchMore, eventually) will call rank() and get back
// whatever it's given; today that's an identity function, since there is
// no backend ranking signal to consume yet. This exists so call sites can
// depend on a stable shape now and swap the implementation later without
// touching UI code.
//
// Deliberately NOT built as engines/ReelNavigationEngine.js — that would
// duplicate what useReelNavigation already does as the single source of
// truth for index math, which §47 explicitly warns against ("do not
// create unnecessary abstractions").

export const ReelRecommendationEngine = {
  /**
   * @param {Array} reels - reels as returned by the feed/pagination layer
   * @param {Object} [signals] - future: completion rate, rewatch, like,
   *   save, share, comment, skip, not_interested, creator affinity, topic
   *   affinity, vibe affinity
   * @returns {Array} ranked reels
   */
  rank(reels, signals = {}) {
    // No ranking model exists yet — pass through unchanged. Swapping this
    // for a real implementation later is the entire point of the seam.
    return reels;
  },

  /** Records a signal for future ranking use. No-op today by design. */
  recordSignal(type, payload) {
    // Intentionally unimplemented — see reelAnalyticsService.trackReelEvent
    // for what's actually being captured today.
  },
};