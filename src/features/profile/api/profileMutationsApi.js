// Avatar/cover/profile-edit mutations against ProfileController.
import ProfileController from "../../../controllers/profileController";

export const profileMutationsApi = {
  updateAvatar: (userId, blob, onProgress) =>
    ProfileController.updateAvatar(userId, blob, onProgress),
  updateCover: (userId, blob, onProgress) =>
    ProfileController.updateCover(userId, blob, onProgress),
  deleteAvatar: (userId, currentUrl) =>
    ProfileController.deleteAvatar(userId, currentUrl),
  deleteCover: (userId, currentUrl) =>
    ProfileController.deleteCover(userId, currentUrl),
};