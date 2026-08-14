// Business-logic layer: talks to the repository, returns normalized models.
// Components/hooks never see raw API payloads.
// import { ProfileRepository } from "../repository/ProfileRepository";
// import { normalizeProfile } from "../utils/normalizeProfile";
// import { normalizeProfileReputation } from "../utils/normalizeProfileReputation";

// export const ProfileService = {
//   async getProfileBundle(userId) {
//     const bundle = await ProfileRepository.fetchProfileBundle(userId);
//     return {
//       profile: normalizeProfile(bundle.profile),
//       reputation: normalizeProfileReputation(bundle.reputation),
//       posts: bundle.posts,
//       reels: bundle.reels,
//     };
//   },
// };

// C:\code\KeshApp\VibeHub\src\features\profile\services\ProfileService.js
import { ProfileRepository } from "../repository/ProfileRepository";

export const ProfileService = {
  getProfileBundle(userId) {
    return ProfileRepository.fetchProfileBundle(userId);
  },
};