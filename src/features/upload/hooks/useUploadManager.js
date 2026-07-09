import { useEffect } from "react";
import { addUpload } from "../core/uploadQueue";
import { processUploads } from "../core/uploadWorker";

export default function useUploadManager(onUpdate) {
  useEffect(() => {
    const interval = setInterval(() => {
      processUploads(onUpdate);
    }, 2000);

    return () => clearInterval(interval);
  }, [onUpdate]);

  const startUpload = async ({ file, caption, user }) => {
    const id = "upload-" + Date.now();

    await addUpload({
      id,
      file,
      caption,
      userId: user.id,
    });

    // optimistic UI
    onUpdate?.({
      id,
      content: caption,
      uploading: true,
      progress: 0,
    });
  };

  return { startUpload };
}