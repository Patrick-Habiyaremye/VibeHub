import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { enqueueUpload } from "../../utils/uploadActions";

const MAX_SIZE_MB = 50;

export default function ReelUpload({ open, onClose, onUploadUpdate }) {
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef();
  const { user } = useAuth();

  // ESC close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // cleanup preview
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError("");

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Only video files are allowed.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Max file size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setVideo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUploadClick = async () => {
    if (!video || !user) return;

    try {
      await enqueueUpload(
        {
          file: video,
          caption,
          userId: user.id,
        },
        (update) => {
          // 🔥 THIS IS CRITICAL
          onUploadUpdate?.(update);
        }
      );

      // reset UI instantly
      setVideo(null);
      setCaption("");
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";

      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Try again.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-lg bg-slate-800 p-6 rounded-xl text-white space-y-4 shadow-2xl">
        <h2 className="text-lg font-semibold">Upload Reel</h2>

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="block w-full text-sm"
        />

        {preview && (
          <video
            src={preview}
            controls
            className="w-full rounded-lg max-h-80 object-cover"
          />
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={200}
          placeholder="Share something meaningful..."
          className="w-full bg-slate-900 p-3 rounded-lg"
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleUploadClick}
            disabled={!video}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}