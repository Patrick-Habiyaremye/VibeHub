import { useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import Cropper from "react-easy-crop";

import { useProfileContext } from "../context/ProfileContext";
import ProfileAvatar from "./ProfileAvatar";

import {
  FALLBACK_COVER,
  FALLBACK_AVATAR,
  COVER_ASPECT,
} from "../constants/profile.constants";

import {
  selectCoverImage,
  selectAvatarImage,
  selectHasCustomCover,
  selectHasCustomAvatar,
} from "../utils/profileSelectors";

export default function ProfileHeader() {
  const {
    profile,
    isOwnProfile,
    mutations,
  } = useProfileContext();

  const {
    avatar,
    cover,
    crop,
    confirmDeleteTarget,
    setConfirmDeleteTarget,
    confirmDelete,
    selectFile,
  } = mutations;

  const coverInputRef = useRef(null);

  /*
   * --------------------------------------------------
   * Derived profile images
   * --------------------------------------------------
   */

  const coverImage = selectCoverImage({
    coverPreview: cover.preview,
    coverFailed: cover.failed,
    profile,
    fallback: FALLBACK_COVER,
  });

  const avatarImage = selectAvatarImage({
    avatarPreview: avatar.preview,
    avatarFailed: avatar.failed,
    profile,
    fallback: FALLBACK_AVATAR,
  });

  /*
   * --------------------------------------------------
   * Custom image detection
   * --------------------------------------------------
   */

  const hasCustomCover = selectHasCustomCover({
    coverPreview: cover.preview,
    coverImage: profile?.coverImage,
  });

  const hasCustomAvatar = selectHasCustomAvatar({
    avatarPreview: avatar.preview,
    avatarUrl: profile?.avatarUrl,
  });

  /*
   * --------------------------------------------------
   * Busy state
   * --------------------------------------------------
   */

  const coverBusy = cover.uploading || cover.deleting;

  /*
   * --------------------------------------------------
   * Cover handlers
   * --------------------------------------------------
   */

  const handleCoverClick = () => {
    if (coverBusy) return;

    coverInputRef.current?.click();
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    // Reset input so selecting the same file again works.
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }

    if (!file) return;

    selectFile(file, "cover");
  };

  /*
   * --------------------------------------------------
   * Render
   * --------------------------------------------------
   */

  return (
    <div className="relative w-full">
      {/* ==================================================
          COVER
          ================================================== */}

      <div className="relative w-full h-64 overflow-hidden rounded-xl">
        <img
          src={coverImage}
          alt={`${profile?.fullName || profile?.username || "User"}'s cover`}
          className="w-full h-full"
          onError={() => cover.setFailed?.(true)}
        />

        {/* Cover overlay */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* --------------------------------------------------
            Cover upload progress
            -------------------------------------------------- */}

        {cover.uploading && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-2">
            <Loader2
              className="animate-spin"
              size={24}
            />

            <div className="text-sm font-medium">
              {cover.progress}%
            </div>

            <div className="w-40 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-150"
                style={{
                  width: `${cover.progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* --------------------------------------------------
            Cover delete loading
            -------------------------------------------------- */}

        {cover.deleting && !cover.uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
            <Loader2
              className="animate-spin"
              size={24}
            />
          </div>
        )}

        {/* --------------------------------------------------
            Cover controls
            -------------------------------------------------- */}

        {isOwnProfile && !coverBusy && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />

            <div className="absolute bottom-4 right-4 flex gap-2">
              {hasCustomCover && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteTarget("cover")}
                  className="
                    flex items-center gap-2
                    bg-white/90
                    hover:bg-white
                    text-red-600
                    px-3 py-2
                    rounded-xl
                    shadow
                    font-medium
                    text-sm
                    transition-colors
                  "
                  aria-label="Remove cover photo"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={handleCoverClick}
                className="
                  flex items-center gap-2
                  bg-white/90
                  hover:bg-white
                  text-gray-900
                  px-4 py-2
                  rounded-xl
                  shadow
                  font-medium
                  text-sm
                  transition-colors
                "
              >
                <Camera size={16} />
                Change cover
              </button>
            </div>
          </>
        )}

        {/* ==================================================
            AVATAR
            ================================================== */}

        <div className="absolute left-6 -bottom-16">
          <ProfileAvatar
            avatarImage={avatarImage}
            isOwnProfile={isOwnProfile}
            hasCustomAvatar={hasCustomAvatar}
            avatarState={avatar}
            onSelectFile={selectFile}
            onRequestDelete={setConfirmDeleteTarget}
          />
        </div>
      </div>

      {/* ==================================================
          CROP MODAL
          ================================================== */}

      {crop.mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4">
            <h3 className="mb-3 font-semibold text-gray-800">
              {crop.target === "cover"
                ? "Adjust cover photo"
                : "Adjust your photo"}
            </h3>

            <div className="relative h-64 overflow-hidden rounded-lg bg-gray-900">
              <Cropper
                image={crop.imageSrc}
                crop={crop.crop}
                zoom={crop.zoom}
                aspect={
                  crop.target === "cover"
                    ? COVER_ASPECT
                    : 1
                }
                cropShape={
                  crop.target === "avatar"
                    ? "round"
                    : "rect"
                }
                showGrid={crop.target !== "avatar"}
                onCropChange={crop.setCrop}
                onZoomChange={crop.setZoom}
                onCropComplete={crop.onCropComplete}
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={crop.zoom}
              onChange={(event) =>
                crop.setZoom(Number(event.target.value))
              }
              className="mt-4 w-full"
              aria-label="Zoom"
            />

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={crop.close}
                disabled={crop.processing}
                className="
                  px-4 py-2
                  rounded-lg
                  text-gray-600
                  hover:bg-gray-100
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={crop.confirm}
                disabled={
                  crop.processing ||
                  !crop.croppedAreaPixels
                }
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-lg
                  bg-purple-600
                  text-white
                  hover:bg-purple-700
                  disabled:opacity-50
                "
              >
                {crop.processing && (
                  <Loader2
                    className="animate-spin"
                    size={14}
                  />
                )}

                {crop.processing
                  ? "Processing…"
                  : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          DELETE CONFIRMATION
          ================================================== */}

      {confirmDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-xs rounded-xl bg-white p-5 text-center">
            <h3 className="mb-2 font-semibold text-gray-800">
              Remove{" "}
              {confirmDeleteTarget === "cover"
                ? "cover photo"
                : "profile photo"}
              ?
            </h3>

            <p className="mb-4 text-sm text-gray-500">
              You can always upload a new one later.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setConfirmDeleteTarget(null)
                }
                className="
                  px-4 py-2
                  rounded-lg
                  text-gray-600
                  hover:bg-gray-100
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="
                  px-4 py-2
                  rounded-lg
                  bg-red-600
                  text-white
                  hover:bg-red-700
                "
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
