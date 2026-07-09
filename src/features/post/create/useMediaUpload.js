import { useState } from "react";

export function useMediaUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = async (file, uploadFn) => {
    if (!file) return null;

    setUploading(true);
    setProgress(0);

    // simulate chunk upload (replace with real later)
    const total = 100;
    for (let i = 0; i <= total; i += 10) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(i);
    }

    const result = await uploadFn(file);

    setUploading(false);
    return result;
  };

  return {
    upload,
    progress,
    uploading,
  };
}