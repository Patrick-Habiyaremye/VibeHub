// features/reels/UploadCard.jsx
//
// Previously rendered `item.previewUrl` directly — queue items never
// carry that field (see hooks/useUploadPreviewUrl.js for why: a blob:
// URL only works in the tab that created it, so it can't safely live on
// shared/broadcast state). This now derives its own local preview from
// IndexedDB. Also adds a Cancel action — pause/resume/retry existed, but
// there was previously no way to abandon an upload outright.

import { useUploadPreviewUrl } from "../../hooks/useUploadPreviewUrl";

export default function UploadCard({ item, onPause, onResume, onRetry, onCancel }) {
  const isUploading = item.status === "uploading";
  const isPaused = item.status === "paused";
  const isFailed = item.status === "failed";
  const isPending = item.status === "pending";
  const isCompressing = item.status === "compressing";
  const isDone = item.status === "done";

  // Re-resolve whenever status changes, since compression finishing
  // replaces the stored blob for the same file id.
  const previewUrl = useUploadPreviewUrl(item.fileId ?? item.id, item.status);

  return (
    <div className="rounded-xl border p-4 space-y-3 shadow-sm bg-white">
      {/* Preview */}
      <div className="relative">
        {previewUrl ? (
          <video src={previewUrl} className="w-full rounded-lg" controls={isDone} />
        ) : (
          <div className="h-40 bg-gray-200 animate-pulse rounded-lg" />
        )}

        {isCompressing && (
          <div className="absolute inset-0 flex items-center justify-center text-sm bg-black/40 text-white">
            Preparing your reel…
          </div>
        )}
      </div>

      {/* Caption */}
      <p className="text-sm text-gray-700">{item.caption}</p>

      {/* Progress */}
      <div className="space-y-1">
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className={`h-2 rounded transition-all ${isFailed ? "bg-red-500" : "bg-black"}`}
            style={{ width: `${item.progress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span className="capitalize">{item.status}</span>
          <span>{Math.floor(item.progress)}%</span>
        </div>
      </div>

      {/* Error */}
      {isFailed && (
        <p className="text-red-500 text-xs">❌ {item.error || "Upload failed"}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isUploading && (
          <button
            onClick={() => onPause(item.id)}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
          >
            Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={() => onResume(item.id)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
          >
            Resume
          </button>
        )}

        {isFailed && (
          <button
            onClick={() => onRetry(item.id)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded"
          >
            Retry
          </button>
        )}

        {isDone && (
          <span className="text-green-600 text-sm font-medium">✅ Uploaded</span>
        )}

        {!isDone && (
          <button
            onClick={() => onCancel(item.id)}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded ml-auto"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
