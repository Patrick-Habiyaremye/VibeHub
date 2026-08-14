// features/reels/services/reelFeedbackService.js
//
// NEW FILE. Structured feedback events per §9/§31's exact contract.
// IMPORTANT: `reel_feedback` is NOT a confirmed table — I have no schema
// evidence it exists (unlike e.g. reels.width/height, which
// uploadWorker.js proves). This mirrors reelInteractionsApi.js's own
// pattern: write the call, flag it loudly, never silently assume. Do not
// wire this up to a live insert until the migration in the accompanying
// notes has actually been applied and verified.
//
// Recommendation reasons (§8) are read-only from whatever the reel
// payload already carries — never fabricated here. If
// `reel.recommendationReasons` is absent, getReasons() returns an empty
// array, and the UI is expected to show "not available yet" rather than
// invent reasons.

import { supabase } from "../../../supabaseClient";

const FEEDBACK_TABLE = "reel_feedback"; // ⚠️ unverified — see migration notes

export function getRecommendationReasons(reel) {
  // Contract from §8:
  // { reasons: [{ type: "similar_content", label: "..." }, ...] }
  if (!reel || !Array.isArray(reel.recommendationReasons)) {
    return { reasons: [] };
  }
  return { reasons: reel.recommendationReasons };
}

/**
 * @param {Object} params
 * @param {string} params.reelId
 * @param {string} params.userId
 * @param {"not_interested"|"tune_feed"|"more_like_this"} params.type
 * @param {string} [params.reason] - e.g. "too_repetitive", "already_seen"
 */
export async function submitReelFeedback({ reelId, userId, type, reason = null }) {
  if (!reelId || !userId || !type) {
    console.warn("submitReelFeedback: missing required fields, dropping event.");
    return { success: false };
  }

  const event = { reelId, userId, type, reason, timestamp: Date.now() };

  try {
    const { error } = await supabase.from(FEEDBACK_TABLE).insert({
      reel_id: event.reelId,
      user_id: event.userId,
      type: event.type,
      reason: event.reason,
      created_at: new Date(event.timestamp).toISOString(),
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    // Feedback failures must never break the viewing experience (§38).
    console.warn("submitReelFeedback failed (non-fatal):", err.message);
    return { success: false, error: err.message };
  }
}