import { useState } from "react";
import { useMediaUpload } from "./useMediaUpload";
import { DraftManager } from "./DraftManager";

export function useCreatePost({ api, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { upload, progress, uploading } = useMediaUpload();

  const submit = async ({ content, file, type }) => {
    if (!content && !file) return;

    try {
      setLoading(true);
      setError("");

      let mediaUrl = null;

      if (file) {
        mediaUrl = await upload(file, api.uploadMedia);
      }

      const newPost = await api.createPost({
        content,
        mediaUrl,
        type,
      });

      DraftManager.clear();
      onSuccess?.(newPost);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    submit,
    loading,
    error,
    progress,
    uploading,
  };
}