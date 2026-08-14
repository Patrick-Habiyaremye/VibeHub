// features/create/useCreatePost.js
import { useState } from "react";
import { useResumableUpload } from "./useResumableUpload";
import { DraftManager } from "./DraftManager";
import { supabase } from "../../../supabaseClient";
import { mapDraftToApi } from "./adapters/mapDraftToApi";

export function useCreatePost({ api, userId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    start,
    pause,
    resume,
    retry,
    progress,
    status,
  } = useResumableUpload();

  const submit = async (draft) => {
    if (!draft?.text && !draft?.file) return;

    setLoading(true);
    setError("");

    try {
      let media = null;

      // ✅ Upload if file exists
      if (draft.file) {
        const ext = draft.file.name.split(".").pop() || "bin";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;

        await start({
          file: draft.file,
          bucket: "posts",
          path,
          contentType: draft.file.type,
        });

        const { data } = supabase.storage.from("posts").getPublicUrl(path);

        media = {
          path,
          url: data.publicUrl,
          kind: draft.type,
        };
      }

      // ✅ Build payload via mapper (NO UI logic leakage)
      const payload = mapDraftToApi({
        ...draft,
        media,
      });

      const newPost = await api.createPost(payload);

      DraftManager.clear();
      onSuccess?.(newPost);
    } catch (err) {
      setError(err.message || "Something went wrong while posting.");
    } finally {
      setLoading(false);
    }
  };

  return {
    submit,
    loading,
    error,
    progress,
    uploadStatus: status,
    pauseUpload: pause,
    resumeUpload: resume,
    retryUpload: retry,
  };
}