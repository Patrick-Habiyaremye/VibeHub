import { ProfileRepository } from "../repository/ProfileRepository";
import { normalizeProfileActivity } from "../utils/normalizeProfileActivity";

export const ProfileActivityService = {
  async getActivity(userId) {
    const raw = await ProfileRepository.fetchActivity(userId);
    return normalizeProfileActivity(raw);
  },
};