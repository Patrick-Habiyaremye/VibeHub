// All avatar/cover state + crop/upload/delete flows, extracted verbatim in
// behavior from the original ProfilePage2 component so nothing regresses.
import { useCallback, useRef, useState } from "react";
import { ProfileMutationService } from "../services/ProfileMutationService";
import { validateImageFile } from "../utils/profileValidators";

export function useProfileMutations({ userId, profile, setData }) {
  const [actionError, setActionError] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [deletingCover, setDeletingCover] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  const [cropMode, setCropMode] = useState(false);
  const [cropTarget, setCropTarget] = useState(null); // "avatar" | "cover"
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null); // "avatar" | "cover"

  const objectUrlsRef = useRef(new Set());
  const trackObjectUrl = (url) => {
    objectUrlsRef.current.add(url);
    return url;
  };
  const releaseObjectUrl = (url) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  };
  const releaseAllObjectUrls = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  };

  const openCropModal = useCallback((file, target) => {
    setActionError(null);
    const url = trackObjectUrl(URL.createObjectURL(file));
    setImageSrc(url);
    setCropTarget(target);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropMode(true);
  }, []);

  const selectFile = useCallback(
    (file, target) => {
      const result = validateImageFile(file);
      if (!result.valid) {
        setActionError(result.error);
        return;
      }
      openCropModal(file, target);
    },
    [openCropModal]
  );

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const closeCropModal = useCallback(() => {
    releaseObjectUrl(imageSrc);
    setCropMode(false);
    setCropTarget(null);
    setImageSrc(null);
    setCroppedAreaPixels(null);
  }, [imageSrc]);

  const uploadAvatar = useCallback(
    async (blob) => {
      const localUrl = trackObjectUrl(URL.createObjectURL(blob));
      setAvatarFailed(false);
      setAvatarPreview(localUrl);
      setUploadingAvatar(true);
      setAvatarProgress(0);
      setActionError(null);

      try {
        const updated = await ProfileMutationService.updateAvatar(userId, blob, setAvatarProgress);
        setData((prev) =>
          prev ? { ...prev, profile: { ...prev.profile, avatarUrl: updated.avatar_url } } : prev
        );
      } catch (err) {
        console.error("Avatar upload error:", err);
        setActionError(err?.message || err?.error_description || "Avatar upload failed. Please try again.");
        setAvatarPreview(null);
      } finally {
        setUploadingAvatar(false);
        releaseObjectUrl(localUrl);
      }
    },
    [userId, setData]
  );

  const uploadCover = useCallback(
    async (blob) => {
      const localUrl = trackObjectUrl(URL.createObjectURL(blob));
      setCoverFailed(false);
      setCoverPreview(localUrl);
      setUploadingCover(true);
      setCoverProgress(0);
      setActionError(null);

      try {
        const updated = await ProfileMutationService.updateCover(userId, blob, setCoverProgress);
        setData((prev) =>
          prev ? { ...prev, profile: { ...prev.profile, coverImage: updated.cover_image } } : prev
        );
      } catch (err) {
        console.error("Cover upload error:", err);
        setActionError(err?.message || err?.error_description || "Cover upload failed. Please try again.");
        setCoverPreview(null);
      } finally {
        setUploadingCover(false);
        releaseObjectUrl(localUrl);
      }
    },
    [userId, setData]
  );

  const confirmCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const target = cropTarget;

    setProcessing(true);
    let blob;
    try {
      blob = await ProfileMutationService.cropAndCompressImage({ imageSrc, croppedAreaPixels, target });
    } catch (err) {
      console.error("Image processing error:", err);
      setActionError("Couldn't process that image. Please try another.");
      setProcessing(false);
      return;
    }
    setProcessing(false);
    closeCropModal();

    if (target === "cover") await uploadCover(blob);
    else await uploadAvatar(blob);
  }, [croppedAreaPixels, cropTarget, imageSrc, closeCropModal, uploadCover, uploadAvatar]);

  const confirmDelete = useCallback(async () => {
    const target = confirmDeleteTarget;
    setConfirmDeleteTarget(null);
    setActionError(null);

    if (target === "avatar") {
      setDeletingAvatar(true);
      try {
        await ProfileMutationService.deleteAvatar(userId, profile?.avatarUrl);
        setAvatarPreview(null);
        setData((prev) => (prev ? { ...prev, profile: { ...prev.profile, avatarUrl: null } } : prev));
      } catch (err) {
        console.error("Delete avatar error:", err);
        setActionError(err?.message || err?.error_description || "Couldn't remove your avatar. Please try again.");
      } finally {
        setDeletingAvatar(false);
      }
    } else if (target === "cover") {
      setDeletingCover(true);
      try {
        await ProfileMutationService.deleteCover(userId, profile?.coverImage);
        setCoverPreview(null);
        setData((prev) => (prev ? { ...prev, profile: { ...prev.profile, coverImage: null } } : prev));
      } catch (err) {
        console.error("Delete cover error:", err);
        setActionError(err?.message || err?.error_description || "Couldn't remove your cover photo. Please try again.");
      } finally {
        setDeletingCover(false);
      }
    }
  }, [confirmDeleteTarget, userId, profile, setData]);

  return {
    actionError,
    setActionError,

    avatar: {
      preview: avatarPreview,
      uploading: uploadingAvatar,
      progress: avatarProgress,
      deleting: deletingAvatar,
      failed: avatarFailed,
      setFailed: setAvatarFailed,
    },
    cover: {
      preview: coverPreview,
      uploading: uploadingCover,
      progress: coverProgress,
      deleting: deletingCover,
      failed: coverFailed,
      setFailed: setCoverFailed,
    },

    crop: {
      mode: cropMode,
      target: cropTarget,
      imageSrc,
      crop,
      zoom,
      croppedAreaPixels,
      processing,
      setCrop,
      setZoom,
      onCropComplete,
      close: closeCropModal,
      confirm: confirmCrop,
    },

    confirmDeleteTarget,
    setConfirmDeleteTarget,
    confirmDelete,

    selectFile,
    releaseAllObjectUrls,
  };
}