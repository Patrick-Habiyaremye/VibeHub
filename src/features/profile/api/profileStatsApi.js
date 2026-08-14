// src/features/profile/api/profileStatsApi.js

import { ContentApi } from "../../../api/contentApi";

export const profileStatsApi = {
  getPosts(userId) {
    if (!userId) return Promise.resolve([]);

    return ContentApi.getPosts({ userId });
  },

  getReels(userId) {
    if (!userId) return Promise.resolve([]);

    return ContentApi.getReels({ userId });
  },

  async getSupportersList(userId) {
    if (!userId) return [];

    if (
      typeof ContentApi.getSupporters !==
      "function"
    ) {
      return [];
    }

    return ContentApi.getSupporters({
      userId,
    });
  },

  async getMoments(userId) {
    if (!userId) return [];

    if (
      typeof ContentApi.getMoments !==
      "function"
    ) {
      return [];
    }

    return ContentApi.getMoments({
      userId,
    });
  },
};