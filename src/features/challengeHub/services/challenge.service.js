// src/features/challengeHub/services/challenge.service.js

import { supabase } from "../../../supabaseClient";

const CHALLENGES_TABLE = "challenges";
const PROGRESS_TABLE = "challenge_progress";

export default class ChallengeService {
  /* ============================================================
   * INTERNAL HELPERS
   * ========================================================== */

  static _handle(result, operation) {
    if (!result.error) return;

    console.error(`[ChallengeService] ${operation}`, {
      code: result.error.code,
      message: result.error.message,
      details: result.error.details,
      hint: result.error.hint,
    });

    throw result.error;
  }

  static _sanitize(text) {
    if (typeof text !== "string") return "";
    return text.trim().replace(/[%_]/g, "");
  }

  static _applyPagination(query, page = 1, limit = 20) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);

    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;

    return query.range(from, to);
  }

  /* ============================================================
   * CHALLENGES
   * ========================================================== */

  static async getChallenges({
    page = 1,
    limit = 20,
    category,
    subCategory,
    difficulty,
    type,
    featured,
    trending,
    search,
  } = {}) {
    let query = supabase
      .from(CHALLENGES_TABLE)
      .select("*", { count: "exact" })
      .eq("status", "active");

    if (type) {
      query = query.eq("type", type);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (subCategory) {
      query = query.eq("sub_category", subCategory);
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    if (featured === true) {
      query = query.eq("featured", true);
    }

    if (search) {
      const keyword = `%${this._sanitize(search)}%`;

      query = query.or(
        `title.ilike.${keyword},description.ilike.${keyword}`
      );
    }

    query = trending
      ? query.order("participants_count", {
          ascending: false,
          nullsFirst: false,
        })
      : query.order("created_at", {
          ascending: false,
        });

    query = this._applyPagination(query, page, limit);

    const result = await query;

    this._handle(result, "getChallenges");

    return {
      data: result.data ?? [],
      meta: {
        page,
        limit,
        total: result.count ?? 0,
        hasMore:
          page * limit < (result.count ?? 0),
      },
    };
  }

  static async getChallengeById(id) {
    if (!id) {
      throw new Error("Challenge ID is required.");
    }

    const result = await supabase
      .from(CHALLENGES_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    this._handle(result, "getChallengeById");

    return result.data;
  }

  static async getFeaturedChallenges(limit = 10) {
    const result = await supabase
      .from(CHALLENGES_TABLE)
      .select("*")
      .eq("status", "active")
      .eq("featured", true)
      .order("priority", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(limit);

    this._handle(result, "getFeaturedChallenges");

    return result.data ?? [];
  }

  static async getTrendingChallenges(limit = 20) {
    const result = await supabase
      .from(CHALLENGES_TABLE)
      .select("*")
      .eq("status", "active")
      .order("participants_count", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(limit);

    this._handle(result, "getTrendingChallenges");

    return result.data ?? [];
  }

  static async getChallengesByCategory(category) {
    if (!category) {
      throw new Error("Category is required.");
    }

    const result = await supabase
      .from(CHALLENGES_TABLE)
      .select("*")
      .eq("status", "active")
      .eq("category", category)
      .order("created_at", {
        ascending: false,
      });

    this._handle(result, "getChallengesByCategory");

    return result.data ?? [];
  }

  static async searchChallenges(keyword) {
    const search = this._sanitize(keyword);

    if (!search) {
      return [];
    }

    const result = await supabase
      .from(CHALLENGES_TABLE)
      .select("*")
      .eq("status", "active")
      .or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      )
      .limit(50);

    this._handle(result, "searchChallenges");

    return result.data ?? [];
  }

  static async getUserChallenges(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const result = await supabase
      .from(CHALLENGES_TABLE)
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", {
        ascending: false,
      });

    this._handle(result, "getUserChallenges");

    return result.data ?? [];
  }

  static async createChallenge(payload) {
    const result = await supabase
      .from(CHALLENGES_TABLE)
      .insert(payload)
      .select()
      .single();

    this._handle(result, "createChallenge");

    return result.data;
  }

  static async updateChallenge(id, updates) {
    if (!id) {
      throw new Error("Challenge ID is required.");
    }

    const result = await supabase
      .from(CHALLENGES_TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    this._handle(result, "updateChallenge");

    return result.data;
  }

  static async deleteChallenge(id) {
    if (!id) {
      throw new Error("Challenge ID is required.");
    }

    const result = await supabase
      .from(CHALLENGES_TABLE)
      .delete()
      .eq("id", id);

    this._handle(result, "deleteChallenge");

    return true;
  }

  /* ============================================================
   * USER PROGRESS
   * ========================================================== */

  static async getUserProgress(challengeId, userId) {
    if (!challengeId || !userId) {
      throw new Error(
        "Challenge ID and User ID are required."
      );
    }

    const result = await supabase
      .from(PROGRESS_TABLE)
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("user_id", userId)
      .maybeSingle();

    this._handle(result, "getUserProgress");

    return result.data;
  }

  static async createProgress({
    challengeId,
    userId,
  }) {
    const result = await supabase
      .from(PROGRESS_TABLE)
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        progress: 0,
        status: "in_progress",
      })
      .select()
      .single();

    this._handle(result, "createProgress");

    return result.data;
  }

  static async updateProgress({
    id,
    progress,
  }) {
    const result = await supabase
      .from(PROGRESS_TABLE)
      .update({
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    this._handle(result, "updateProgress");

    return result.data;
  }

  static async completeProgress({
    id,
    proof,
  }) {
    const result = await supabase
      .from(PROGRESS_TABLE)
      .update({
        status: "completed",
        progress: 100,
        proof,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    this._handle(result, "completeProgress");

    return result.data;
  }

  static async deleteProgress(id) {
    const result = await supabase
      .from(PROGRESS_TABLE)
      .delete()
      .eq("id", id);

    this._handle(result, "deleteProgress");

    return true;
  }
}