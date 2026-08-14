// src\controllers\profileController.js
// import { supabase } from "../supabaseClient"; // <-- adjust to your actual Supabase client path
// import { getProfile } from "../services/profileService";
// import { getProfileStats } from "../services/profileStatsService";
// import { getActivityStreak } from "../services/profileActivityService";
// import ProfileAchievements from "../services/profileAchievements";
// import { computeReputation } from "../services/profileReputation";

// class ProfileController {
//   /* ----------------------------------------
//      FULL PROFILE
//   ---------------------------------------- */
//   static async getFullProfile(userId) {
//     try {
//       const [profile, stats, streak] = await Promise.all([
//         getProfile(userId),
//         getProfileStats(userId),
//         getActivityStreak(userId),
//       ]);

//       const achievements = await ProfileAchievements.getUserAchievements(
//         userId,
//         { stats, streak }
//       );

//       const reputation = computeReputation({
//         stats,
//         achievements: achievements.unlocked,
//         streak,
//       });

//       return { profile, stats, achievements, reputation };
//     } catch (err) {
//       console.error("getFullProfile error:", err);
//       throw err;
//     }
//   }

//   /* ----------------------------------------
//      REFRESH STATE
//   ---------------------------------------- */
//   static async refreshUserState(userId) {
//     const stats = await getProfileStats(userId);
//     const streak = await getActivityStreak(userId);

//     const achievements = await ProfileAchievements.evaluate(userId, {
//       stats,
//       streak,
//     });

//     const reputation = computeReputation({
//       stats,
//       achievements: achievements.unlocked,
//       streak,
//     });

//     return { stats, achievements, reputation };
//   }

//   /* ----------------------------------------
//      UPDATE AVATAR
//   ---------------------------------------- */
//   static async updateAvatar(userId, file, onProgress) {
//     return ProfileController._uploadImage({
//       userId,
//       file,
//       bucket: "avatars",
//       column: "avatar_url",
//       onProgress,
//     });
//   }

//   /* ----------------------------------------
//      UPDATE COVER
//   ---------------------------------------- */
//   static async updateCover(userId, file, onProgress) {
//     return ProfileController._uploadImage({
//       userId,
//       file,
//       bucket: "covers",
//       column: "cover_image",
//       onProgress,
//     });
//   }

//   /* ----------------------------------------
//      DELETE / RESET AVATAR
//   ---------------------------------------- */
//   static async deleteAvatar(userId, currentAvatarUrl) {
//     return ProfileController._deleteImage({
//       userId,
//       currentUrl: currentAvatarUrl,
//       bucket: "avatars",
//       column: "avatar_url",
//     });
//   }

//   /* ----------------------------------------
//      DELETE / RESET COVER
//   ---------------------------------------- */
//   static async deleteCover(userId, currentCoverUrl) {
//     return ProfileController._deleteImage({
//       userId,
//       currentUrl: currentCoverUrl,
//       bucket: "covers",
//       column: "cover_image",
//     });
//   }

//   /* ----------------------------------------
//      SHARED DELETE HELPER
//   ---------------------------------------- */
//   static async _deleteImage({ userId, currentUrl, bucket, column }) {
//     try {
//       // Best-effort storage cleanup — don't block the DB update if this fails
//       if (currentUrl) {
//         const path = ProfileController._extractStoragePath(currentUrl, bucket);
//         if (path) {
//           await supabase.storage
//             .from(bucket)
//             .remove([path])
//             .catch((err) => console.warn("Storage cleanup failed:", err));
//         }
//       }

//       const { error } = await supabase
//         .from("profiles")
//         .update({ [column]: null })
//         .eq("id", userId);

//       if (error) throw error;

//       return { [column]: null };
//     } catch (err) {
//       console.error(`${column} delete error:`, err);
//       throw err;
//     }
//   }

//   static _extractStoragePath(url, bucket) {
//     try {
//       const marker = `/object/public/${bucket}/`;
//       const idx = url.indexOf(marker);
//       if (idx === -1) return null;
//       return url.substring(idx + marker.length).split("?")[0];
//     } catch {
//       return null;
//     }
//   }

//   /* ----------------------------------------
//      SHARED UPLOAD HELPER
//      (single source of truth so avatar/cover
//      never diverge or silently overwrite each other)
//   ---------------------------------------- */
//   static async _uploadImage({ userId, file, bucket, column, onProgress }) {
//     let progressInterval;

//     try {
//       const ext = file.type === "image/png" ? "png" : "jpg";
//       const filePath = `${userId}-${Date.now()}.${ext}`;

//       // Supabase JS v2 doesn't expose real upload progress, so we
//       // simulate it up to 90% and jump to 100% once it actually resolves.
//       if (onProgress) {
//         let p = 0;
//         progressInterval = setInterval(() => {
//           p += 20;
//           onProgress(Math.min(p, 90));
//         }, 100);
//       }

//       const { error: uploadError } = await supabase.storage
//         .from(bucket)
//         .upload(filePath, file, {
//           upsert: true,
//           contentType: file.type,
//         });

//       if (uploadError) throw uploadError;

//       const { data: publicUrlData } = supabase.storage
//         .from(bucket)
//         .getPublicUrl(filePath);

//       const url = publicUrlData.publicUrl;

//       const { error: dbError } = await supabase
//         .from("profiles")
//         .update({ [column]: url })
//         .eq("id", userId);

//       if (dbError) throw dbError;

//       if (onProgress) onProgress(100);

//       return { [column]: url };
//     } catch (err) {
//       console.error(`${column} upload error:`, err);
//       throw err;
//     } finally {
//       if (progressInterval) clearInterval(progressInterval);
//     }
//   }
// }

// export default ProfileController;

// // src/controllers/profileController.js

// import { supabase } from "../supabaseClient";

// import { getProfile } from "../services/profileService";
// import { getProfileStats } from "../services/profileStatsService";
// import { getActivityStreak } from "../services/profileActivityService";
// import ProfileAchievements from "../services/profileAchievements";
// import { computeReputation } from "../services/profileReputation";

// class ProfileController {
//   /* ----------------------------------------
//      FULL PROFILE
//   ---------------------------------------- */

//   static async getFullProfile(userId) {
//     if (!userId) {
//       throw new Error("getFullProfile requires a userId");
//     }

//     try {
//       const [profile, stats, streak] = await Promise.all([
//         getProfile(userId),
//         getProfileStats(userId),
//         getActivityStreak(userId),
//       ]);

//       const achievements =
//         await ProfileAchievements.getUserAchievements(
//           userId,
//           {
//             stats,
//             streak,
//           }
//         );

//       const reputation = computeReputation({
//         stats,
//         achievements: achievements.unlocked,
//         streak,
//       });

//       return {
//         profile,
//         stats,
//         streak,
//         achievements,
//         reputation,
//       };
//     } catch (error) {
//       console.error("[ProfileController.getFullProfile]", {
//         userId,
//         message: error?.message,
//         code: error?.code,
//         details: error?.details,
//         hint: error?.hint,
//       });

//       throw error;
//     }
//   }

//   /* ----------------------------------------
//      REFRESH STATE
//   ---------------------------------------- */

//   static async refreshUserState(userId) {
//     const [stats, streak] = await Promise.all([
//       getProfileStats(userId),
//       getActivityStreak(userId),
//     ]);

//     const achievements =
//       await ProfileAchievements.evaluate(userId, {
//         stats,
//         streak,
//       });

//     const reputation = computeReputation({
//       stats,
//       achievements: achievements.unlocked,
//       streak,
//     });

//     return {
//       stats,
//       streak,
//       achievements,
//       reputation,
//     };
//   }

//   /* ----------------------------------------
//      UPDATE AVATAR
//   ---------------------------------------- */

//   static async updateAvatar(userId, file, onProgress) {
//     return ProfileController._uploadImage({
//       userId,
//       file,
//       bucket: "avatars",
//       column: "avatar_url",
//       onProgress,
//     });
//   }

//   /* ----------------------------------------
//      UPDATE COVER
//   ---------------------------------------- */

//   static async updateCover(userId, file, onProgress) {
//     return ProfileController._uploadImage({
//       userId,
//       file,
//       bucket: "covers",
//       column: "cover_image",
//       onProgress,
//     });
//   }

//   /* ----------------------------------------
//      DELETE AVATAR
//   ---------------------------------------- */

//   static async deleteAvatar(userId, currentAvatarUrl) {
//     return ProfileController._deleteImage({
//       userId,
//       currentUrl: currentAvatarUrl,
//       bucket: "avatars",
//       column: "avatar_url",
//     });
//   }

//   /* ----------------------------------------
//      DELETE COVER
//   ---------------------------------------- */

//   static async deleteCover(userId, currentCoverUrl) {
//     return ProfileController._deleteImage({
//       userId,
//       currentUrl: currentCoverUrl,
//       bucket: "covers",
//       column: "cover_image",
//     });
//   }

//   /* ----------------------------------------
//      DELETE IMAGE
//   ---------------------------------------- */

//   static async _deleteImage({
//     userId,
//     currentUrl,
//     bucket,
//     column,
//   }) {
//     try {
//       if (currentUrl) {
//         const path =
//           ProfileController._extractStoragePath(
//             currentUrl,
//             bucket
//           );

//         if (path) {
//           const { error: storageError } =
//             await supabase.storage
//               .from(bucket)
//               .remove([path]);

//           if (storageError) {
//             console.warn(
//               `[ProfileController] Storage cleanup failed`,
//               storageError
//             );
//           }
//         }
//       }

//       const { error } = await supabase
//         .from("profiles")
//         .update({
//           [column]: null,
//         })
//         .eq("id", userId);

//       if (error) throw error;

//       return {
//         [column]: null,
//       };
//     } catch (error) {
//       console.error(
//         `[ProfileController.${column} delete]`,
//         error
//       );

//       throw error;
//     }
//   }

//   /* ----------------------------------------
//      EXTRACT STORAGE PATH
//   ---------------------------------------- */

//   static _extractStoragePath(url, bucket) {
//     try {
//       const marker = `/object/public/${bucket}/`;

//       const index = url.indexOf(marker);

//       if (index === -1) {
//         return null;
//       }

//       return url
//         .substring(index + marker.length)
//         .split("?")[0];
//     } catch {
//       return null;
//     }
//   }

//   /* ----------------------------------------
//      UPLOAD IMAGE
//   ---------------------------------------- */

//   static async _uploadImage({
//     userId,
//     file,
//     bucket,
//     column,
//     onProgress,
//   }) {
//     let progressInterval;

//     try {
//       if (!userId) {
//         throw new Error("Missing userId");
//       }

//       if (!file) {
//         throw new Error("Missing image file");
//       }

//       const ext =
//         file.type === "image/png"
//           ? "png"
//           : "jpg";

//       const filePath =
//         `${userId}-${Date.now()}.${ext}`;

//       if (onProgress) {
//         let progress = 0;

//         progressInterval = setInterval(() => {
//           progress += 20;

//           onProgress(
//             Math.min(progress, 90)
//           );
//         }, 100);
//       }

//       const { error: uploadError } =
//         await supabase.storage
//           .from(bucket)
//           .upload(filePath, file, {
//             upsert: true,
//             contentType: file.type,
//           });

//       if (uploadError) {
//         throw uploadError;
//       }

//       const {
//         data: publicUrlData,
//       } = supabase.storage
//         .from(bucket)
//         .getPublicUrl(filePath);

//       const url =
//         publicUrlData?.publicUrl;

//       if (!url) {
//         throw new Error(
//           "Failed to generate public image URL"
//         );
//       }

//       const { error: dbError } =
//         await supabase
//           .from("profiles")
//           .update({
//             [column]: url,
//           })
//           .eq("id", userId);

//       if (dbError) {
//         throw dbError;
//       }

//       onProgress?.(100);

//       return {
//         [column]: url,
//       };
//     } catch (error) {
//       console.error(
//         `[ProfileController.${column} upload]`,
//         error
//       );

//       throw error;
//     } finally {
//       if (progressInterval) {
//         clearInterval(progressInterval);
//       }
//     }
//   }
// }

// src/controllers/profileController.js

import { supabase } from "../supabaseClient";

import { getProfile } from "../services/profileService";
import { getProfileStats } from "../services/profileStatsService";
import { getActivityStreak } from "../services/profileActivityService";
import ProfileAchievements from "../services/profileAchievements";
import { computeReputation } from "../services/profileReputation";

class ProfileController {
  /* ----------------------------------------
     FULL PROFILE
  ---------------------------------------- */

  static async getFullProfile(userId) {
    if (!userId) {
      throw new Error("getFullProfile requires a userId");
    }

    try {
      const [profile, stats, streak] = await Promise.all([
        getProfile(userId),
        getProfileStats(userId),
        getActivityStreak(userId),
      ]);

      const achievements =
        await ProfileAchievements.getUserAchievements(userId, {
          stats,
          streak,
        });

      const reputation = computeReputation({
        stats,
        achievements: achievements.unlocked,
        streak,
      });

      return {
        profile,
        stats,
        streak,
        achievements,
        reputation,
      };
    } catch (error) {
      console.error("[ProfileController.getFullProfile]", {
        userId,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });

      throw error;
    }
  }

  /* ----------------------------------------
     REFRESH STATE
  ---------------------------------------- */

  static async refreshUserState(userId) {
    if (!userId) {
      throw new Error("refreshUserState requires a userId");
    }

    try {
      const [stats, streak] = await Promise.all([
        getProfileStats(userId),
        getActivityStreak(userId),
      ]);

      const achievements =
        await ProfileAchievements.evaluate(userId, {
          stats,
          streak,
        });

      const reputation = computeReputation({
        stats,
        achievements: achievements.unlocked,
        streak,
      });

      return {
        stats,
        streak,
        achievements,
        reputation,
      };
    } catch (error) {
      console.error("[ProfileController.refreshUserState]", {
        userId,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });

      throw error;
    }
  }

  /* ----------------------------------------
     UPDATE AVATAR
  ---------------------------------------- */

  static async updateAvatar(userId, file, onProgress) {
    return ProfileController._uploadImage({
      userId,
      file,
      bucket: "avatars",
      column: "avatar_url",
      onProgress,
    });
  }

  /* ----------------------------------------
     UPDATE COVER
  ---------------------------------------- */

  static async updateCover(userId, file, onProgress) {
    return ProfileController._uploadImage({
      userId,
      file,
      bucket: "covers",
      column: "cover_image",
      onProgress,
    });
  }

  /* ----------------------------------------
     DELETE AVATAR
  ---------------------------------------- */

  static async deleteAvatar(userId, currentAvatarUrl) {
    return ProfileController._deleteImage({
      userId,
      currentUrl: currentAvatarUrl,
      bucket: "avatars",
      column: "avatar_url",
    });
  }

  /* ----------------------------------------
     DELETE COVER
  ---------------------------------------- */

  static async deleteCover(userId, currentCoverUrl) {
    return ProfileController._deleteImage({
      userId,
      currentUrl: currentCoverUrl,
      bucket: "covers",
      column: "cover_image",
    });
  }

  /* ----------------------------------------
     DELETE IMAGE
  ---------------------------------------- */

  static async _deleteImage({
    userId,
    currentUrl,
    bucket,
    column,
  }) {
    if (!userId) {
      throw new Error("Missing userId");
    }

    try {
      /*
       * Remove old file from Supabase Storage.
       * Storage cleanup failure should not prevent
       * the profile database value from being cleared.
       */
      if (currentUrl) {
        const path =
          ProfileController._extractStoragePath(
            currentUrl,
            bucket
          );

        if (path) {
          const { error: storageError } =
            await supabase.storage
              .from(bucket)
              .remove([path]);

          if (storageError) {
            console.warn(
              "[ProfileController] Storage cleanup failed",
              {
                bucket,
                path,
                message: storageError.message,
              }
            );
          }
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          [column]: null,
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      return {
        [column]: null,
      };
    } catch (error) {
      console.error(
        `[ProfileController.${column} delete]`,
        {
          userId,
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
        }
      );

      throw error;
    }
  }

  /* ----------------------------------------
     EXTRACT STORAGE PATH
  ---------------------------------------- */

  static _extractStoragePath(url, bucket) {
    if (!url || !bucket) {
      return null;
    }

    try {
      const marker = `/object/public/${bucket}/`;
      const index = url.indexOf(marker);

      if (index === -1) {
        return null;
      }

      return url
        .substring(index + marker.length)
        .split("?")[0];
    } catch {
      return null;
    }
  }

  /* ----------------------------------------
     UPLOAD IMAGE
  ---------------------------------------- */

  static async _uploadImage({
    userId,
    file,
    bucket,
    column,
    onProgress,
  }) {
    let progressInterval = null;

    try {
      if (!userId) {
        throw new Error("Missing userId");
      }

      if (!file) {
        throw new Error("Missing image file");
      }

      if (!file.type?.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      /*
       * Keep extension controlled rather than trusting
       * the original filename.
       */
      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

      const filePath =
        `${userId}-${Date.now()}.${extension}`;

      /*
       * Supabase JS does not expose upload progress.
       * This is therefore an estimated progress indicator,
       * not actual network progress.
       */
      if (onProgress) {
        let progress = 0;

        progressInterval = setInterval(() => {
          progress += 20;

          onProgress(
            Math.min(progress, 90)
          );
        }, 100);
      }

      const { error: uploadError } =
        await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const url =
        publicUrlData?.publicUrl;

      if (!url) {
        throw new Error(
          "Failed to generate public image URL"
        );
      }

      const { error: dbError } =
        await supabase
          .from("profiles")
          .update({
            [column]: url,
          })
          .eq("id", userId);

      if (dbError) {
        /*
         * Database update failed after upload.
         * Attempt storage cleanup to avoid an orphaned file.
         */
        await supabase.storage
          .from(bucket)
          .remove([filePath])
          .catch(() => {});

        throw dbError;
      }

      onProgress?.(100);

      return {
        [column]: url,
      };
    } catch (error) {
      console.error(
        `[ProfileController.${column} upload]`,
        {
          userId,
          bucket,
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
        }
      );

      throw error;
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  }
}

export default ProfileController;