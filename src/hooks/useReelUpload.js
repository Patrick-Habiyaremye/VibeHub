// hooks/useReelUpload.js
import { useState } from "react";
import { addToQueue } from "../utils/uploadQueue";

export default function useReelUpload(user, onUpdate) {
  const upload = (file, caption) => {
    console.log("STEP 1: Adding to queue", { file, caption });
    if (!file) return;

    const id = "temp-" + Date.now();

    // ✅ REAL optimistic UI
    onUpdate({
      id,
      content: caption,
      media: {
        kind: "video",
        src: URL.createObjectURL(file),
      },
      uploading: true,
      progress: 0,
profiles: {
    username: user?.username ?? "You",
    avatar_url: user?.avatar_url ?? null,
}
    });

    // ✅ REAL queue
    addToQueue({
      id,
      file,
      caption,
      userId: user.id,
      path: `reels/${id}.mp4`,
      status: "pending",
      progress: 0,
      retries: 0,
    });
  };

  return { upload };
}
