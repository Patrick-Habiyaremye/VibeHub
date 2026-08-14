// src/features/profile/repository/ProfileRepository.js

import { profileApi } from "../api/profileApi";
import { profileStatsApi } from "../api/profileStatsApi";
import { profileActivityApi } from "../api/profileActivityApi";
import { profileMutationsApi } from "../api/profileMutationsApi";

/**
 * ProfileRepository
 *
 * Responsibilities:
 * - Fetch profile-related data
 * - Combine independent API responses
 * - Provide predictable raw data to ProfileEngine
 *
 * NOT responsible for:
 * - UI formatting
 * - camelCase normalization
 * - stats computation
 * - reputation computation
 * - profile business rules
 */
export const ProfileRepository = {
  /**
   * Fetch everything required for the profile page.
   */
  async fetchProfileBundle(userId) {
    if (!userId) {
      throw new Error(
        "[ProfileRepository] userId is required"
      );
    }

    const [
      fullProfileResult,
      postsResult,
      reelsResult,
    ] = await Promise.all([
      profileApi.getFullProfile(userId),
      profileStatsApi.getPosts(userId),
      profileStatsApi.getReels(userId),
    ]);

    return {
      profile:
        fullProfileResult?.profile ?? null,

      stats:
        fullProfileResult?.stats ?? null,

      achievements:
        fullProfileResult?.achievements ?? [],

      reputation:
        fullProfileResult?.reputation ?? null,

      posts:
        Array.isArray(postsResult)
          ? postsResult
          : [],

      reels:
        Array.isArray(reelsResult)
          ? reelsResult
          : [],
    };
  },

  /**
   * Fetch profile activity separately.
   *
   * Kept separate because activity is usually
   * loaded independently/paginated.
   */
  async fetchActivity(userId) {
    if (!userId) {
      throw new Error(
        "[ProfileRepository] userId is required"
      );
    }

    return profileActivityApi.getActivity(userId);
  },

  /**
   * Profile mutations are exposed through the
   * repository boundary.
   */
  mutations: profileMutationsApi,
};