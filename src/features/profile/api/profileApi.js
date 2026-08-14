// Thin wrapper around the existing ProfileController so the rest of this
// feature never imports it directly - swapping backends means editing one file.
import ProfileController from "../../../controllers/profileController";

export const profileApi = {
  getFullProfile: (userId) => ProfileController.getFullProfile(userId),
};