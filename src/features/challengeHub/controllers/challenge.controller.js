// controllers/challenge.controller.js

// src/features/challengeHub/controllers/challenge.controller.js
//
// Frontend orchestration layer that sits between React hooks and
// ChallengeService — the direct replacement for the old Express
// controller. It does NOT touch req/res/next; every method returns a
// plain, consistent result object instead:
//
//   success case:  { success: true, data, meta? }
//   failure case:  { success: false, message, code? }
//
// This mirrors the shape the old Express routes sent over the wire
// (res.json({ success, data })), so hooks consuming this can treat it
// almost identically to how a fetch() call to the old API would have
// been consumed — just synchronous-feeling and same-process instead of
// over HTTP.
//
// Scope note: progress/session state (getUserProgress, createProgress,
// updateProgress, completeProgress on ChallengeService) is intentionally
// NOT orchestrated here — that belongs in SessionController, which owns
// the play/start/progress/submit/complete lifecycle. This file only
// covers challenge discovery + CRUD, matching the method list you asked
// for.
//
// Caching: intentionally omitted for this pass per your call — every
// method hits ChallengeService fresh. Straightforward to layer an
// in-memory or persisted cache in later (getChallenges/getFeatured/
// getTrending are the obvious candidates) without changing this file's
// public shape.

import ChallengeService from "../services/challenge.service";
import { normalizeChallenge } from "../utils/ChallengeNormalizer";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export default class ChallengeController {
  /* ============================================================
   * INTERNAL HELPERS
   * ========================================================== */

  /**
   * Turns any thrown error (Supabase PostgrestError shape, a plain
   * Error, or a manually-thrown validation Error) into the controller's
   * one consistent failure shape, so callers never have to branch on
   * "what kind of error is this."
   */
  static _fail(error, fallbackMessage = "Something went wrong.") {
    const message =
      error?.message && typeof error.message === "string"
        ? error.message
        : fallbackMessage;

    const code = error?.code ?? null;

    return { success: false, message, code };
  }

  static _ok(data, meta) {
    return meta !== undefined
      ? { success: true, data, meta }
      : { success: true, data };
  }

  /**
   * Clamps page/limit into sane, always-valid integers. A caller passing
   * page: -5 or limit: 100000 (typo, malicious query param, whatever)
   * should degrade gracefully, not blow up the query or hammer the DB.
   */
  static _normalizePagination(page, limit) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(
      Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    return { page: safePage, limit: safeLimit };
  }

  /** Trims a string filter and converts "" back to undefined, so an
   * empty text field from a form doesn't accidentally become a literal
   * `.eq(column, "")` filter in the service layer. */
  static _cleanString(value) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  static _normalizeFilters(filters = {}) {
    const { page, limit } = this._normalizePagination(
      filters.page,
      filters.limit
    );

    return {
      page,
      limit,
      category: this._cleanString(filters.category),
      subCategory: this._cleanString(filters.subCategory),
      difficulty: this._cleanString(filters.difficulty),
      type: this._cleanString(filters.type),
      featured: filters.featured === true ? true : undefined,
      trending: !!filters.trending,
      search: this._cleanString(filters.search),
    };
  }

  /* ============================================================
   * DISCOVERY
   * ========================================================== */

  static async getChallenges(filters = {}) {
    try {
      const normalizedFilters = this._normalizeFilters(filters);

      const { data, meta } = await ChallengeService.getChallenges(
        normalizedFilters
      );

      return this._ok(data.map(normalizeChallenge), meta);
    } catch (error) {
      return this._fail(error, "Failed to load challenges.");
    }
  }

  static async getChallengeById(id) {
    if (!id) {
      return this._fail(
        new Error("Challenge ID is required."),
        "Challenge ID is required."
      );
    }

    try {
      const challenge = await ChallengeService.getChallengeById(id);

      if (!challenge) {
        return {
          success: false,
          message: "Challenge not found.",
          code: "NOT_FOUND",
        };
      }

      return this._ok(normalizeChallenge(challenge));
    } catch (error) {
      return this._fail(error, "Failed to load challenge.");
    }
  }

  static async getFeaturedChallenges(limit = 10) {
    try {
      const safeLimit = Math.min(
        Math.max(parseInt(limit, 10) || 10, 1),
        MAX_LIMIT
      );

      const data = await ChallengeService.getFeaturedChallenges(safeLimit);

      return this._ok(data.map(normalizeChallenge));
    } catch (error) {
      return this._fail(error, "Failed to load featured challenges.");
    }
  }

  static async getTrendingChallenges(limit = 20) {
    try {
      const safeLimit = Math.min(
        Math.max(parseInt(limit, 10) || 20, 1),
        MAX_LIMIT
      );

      const data = await ChallengeService.getTrendingChallenges(safeLimit);

      return this._ok(data.map(normalizeChallenge));
    } catch (error) {
      return this._fail(error, "Failed to load trending challenges.");
    }
  }

  static async getChallengesByCategory(category) {
    const safeCategory = this._cleanString(category);

    if (!safeCategory) {
      return this._fail(
        new Error("Category is required."),
        "Category is required."
      );
    }

    try {
      const data = await ChallengeService.getChallengesByCategory(
        safeCategory
      );

      return this._ok(data.map(normalizeChallenge));
    } catch (error) {
      return this._fail(error, "Failed to load challenges for category.");
    }
  }

  static async searchChallenges(keyword) {
    const safeKeyword = this._cleanString(keyword);

    // Mirrors ChallengeService.searchChallenges' own early return for an
    // empty/whitespace keyword — no point round-tripping to Supabase for
    // a query that's guaranteed to be meaningless.
    if (!safeKeyword) {
      return this._ok([]);
    }

    try {
      const data = await ChallengeService.searchChallenges(safeKeyword);

      return this._ok(data.map(normalizeChallenge));
    } catch (error) {
      return this._fail(error, "Search failed.");
    }
  }

  static async getUserChallenges(userId) {
    if (!userId) {
      return this._fail(
        new Error("User ID is required."),
        "User ID is required."
      );
    }

    try {
      const data = await ChallengeService.getUserChallenges(userId);

      return this._ok(data.map(normalizeChallenge));
    } catch (error) {
      return this._fail(error, "Failed to load your challenges.");
    }
  }

  /* ============================================================
   * CRUD (creator-facing)
   * ========================================================== */

  static async createChallenge(payload = {}) {
    const title = this._cleanString(payload.title);

    if (!title) {
      return this._fail(
        new Error("A challenge title is required."),
        "A challenge title is required."
      );
    }

    try {
      const created = await ChallengeService.createChallenge({
        ...payload,
        title,
      });

      return this._ok(normalizeChallenge(created));
    } catch (error) {
      return this._fail(error, "Failed to create challenge.");
    }
  }

  static async updateChallenge(id, updates = {}) {
    if (!id) {
      return this._fail(
        new Error("Challenge ID is required."),
        "Challenge ID is required."
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return this._fail(
        new Error("No updates provided."),
        "No updates provided."
      );
    }

    try {
      const updated = await ChallengeService.updateChallenge(id, updates);

      return this._ok(normalizeChallenge(updated));
    } catch (error) {
      return this._fail(error, "Failed to update challenge.");
    }
  }

  static async deleteChallenge(id) {
    if (!id) {
      return this._fail(
        new Error("Challenge ID is required."),
        "Challenge ID is required."
      );
    }

    try {
      await ChallengeService.deleteChallenge(id);

      return this._ok(true);
    } catch (error) {
      return this._fail(error, "Failed to delete challenge.");
    }
  }
}