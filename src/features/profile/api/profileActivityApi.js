// No activity-feed endpoint exists yet (the original page showed a
// "coming soon" placeholder). This wrapper feature-detects an optional
// ContentApi.getActivity so the UI lights up automatically once the
// backend adds it, without another refactor.
import { ContentApi } from "../../../api/contentApi";

export const profileActivityApi = {
  async getActivity(userId) {
    if (typeof ContentApi.getActivity !== "function") {
      return [];
    }
    return ContentApi.getActivity({ userId });
  },
};