// src/features/comments/services/CommentAnalyticsService.js
//
// HONEST SCOPE NOTE: this does NOT persist anywhere yet. Your schema has
// `interaction_history` and `score_events` tables, but both show "no
// policies created yet" in your RLS dump — meaning the Data API blocks
// all access to them right now, authenticated or not. Writing real
// events needs either policies added to one of those tables (tell me
// which is the intended one) or a new table built for this. Until then,
// this is a structured console.debug so the call sites are already
// correct and this file is a one-line swap once a real destination exists.

export default class CommentAnalyticsService {
  static track(event, payload = {}) {
    console.debug(`[CommentAnalytics] ${event}`, payload);
  }
}