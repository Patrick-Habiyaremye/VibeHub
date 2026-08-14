// hooks/useCreateMediaPost.js

import { useState } from "react";
import { useResumableUpload } from "./useResumableUpload";
import { processMedia } from "../engines/mediaProcessor";
import { mapMediaToPost } from "../adapters/mapMediaToPost";
import { ContentApi } from "../api/ContentApi";

export function useCreateMediaPost(user) {
  const upload = useResumableUpload();

  const [post, setPost] = useState(null);

  const createPost = async (file) => {
    // 1. OPTIMISTIC PREVIEW
    const localUrl = URL.createObjectURL(file);

    const optimisticPost = {
      id: `temp-${Date.now()}`,
      media_url: localUrl,
      media_type: file.type.startsWith("video") ? "video" : "image",
      optimistic: true,
    };

    setPost(optimisticPost);

    // 2. START UPLOAD
    const path = `posts/${user.id}/${Date.now()}-${file.name}`;

    await upload.start({
      file,
      bucket: "posts",
      path,
    });

    // 3. WAIT FOR COMPLETION
    const waitForUpload = () =>
      new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (upload.status === "done" && upload.fileUrl) {
            clearInterval(interval);
            resolve(upload.fileUrl);
          }
          if (upload.status === "error") {
            clearInterval(interval);
            reject(upload.error);
          }
        }, 200);
      });

    let fileUrl;
    try {
      fileUrl = await waitForUpload();
    } catch (err) {
      console.error(err);
      return;
    }

    // 4. PROCESS MEDIA
    const media = await processMedia(file, fileUrl);

    // 5. NORMALIZE → POST
    const finalPost = mapMediaToPost({ media, user });

    // 6. SEND TO BACKEND
    const saved = await ContentApi.createPost(finalPost);

    // 7. REPLACE OPTIMISTIC POST
    setPost(saved);

    return saved;
  };

  return {
    createPost,
    upload,
    post,
  };
}