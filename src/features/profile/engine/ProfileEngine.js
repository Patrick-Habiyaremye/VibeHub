// src/features/profile/engine/ProfileEngine.js

import { ProfileService } from "../services/ProfileService";
import { ProfileStatsService } from "../services/ProfileStatsService";
import { ProfileReputationService } from "../services/ProfileReputationService";
import { normalizeProfile } from "../utils/normalizeProfile";

export const ProfileEngine = {
  async load(userId) {
    if (!userId) {
      throw new Error(
        "[ProfileEngine] userId is required"
      );
    }

    const bundle =
      await ProfileService.getProfileBundle(userId);

    if (!bundle) {
      throw new Error(
        "[ProfileEngine] Empty profile bundle"
      );
    }

    const profile =
      normalizeProfile(bundle.profile);

    const stats =
      ProfileStatsService.computeStats(bundle);

    const reputation =
      ProfileReputationService.normalize(
        bundle.reputation
      );

    return {
      profile,
      stats,
      reputation,
      achievements: bundle.achievements ?? [],
      posts: bundle.posts ?? [],
      reels: bundle.reels ?? [],
    };
  },
};

