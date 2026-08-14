// features/create/UploadProgress.jsx
import { Pause, Play, RotateCcw, WifiOff } from "lucide-react";

export default function UploadProgress({
  status, // idle | uploading | paused | error | done
  progress,
  error,
  isOffline,
  onPause,
  onResume,
  onRetry,
}) {
  if (status === "idle" || status === "done") return null;

  return (
    <div className="mt-3 bg-slate-900 border border-slate-700 rounded-lg p-3">
      <div className="w-full bg-slate-700 h-2 rounded overflow-hidden">
        <div
          className={`h-2 transition-all duration-150 ${
            status === "error" ? "bg-red-500" : "bg-yellow-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-slate-400">
          {status === "uploading" && `Uploading… ${progress}%`}
          {status === "paused" && `Paused at ${progress}%`}
          {status === "error" && (error || "Upload failed")}
        </span>

        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="flex items-center gap-1 text-orange-400">
              <WifiOff size={14} />
              Offline
            </span>
          )}

          {status === "uploading" && (
            <button
              onClick={onPause}
              className="flex items-center gap-1 text-slate-300 hover:text-white"
            >
              <Pause size={14} /> Pause
            </button>
          )}

          {status === "paused" && (
            <button
              onClick={onResume}
              className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-medium"
            >
              <Play size={14} /> Resume
            </button>
          )}

          {status === "error" && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-red-300 hover:text-red-200 font-medium"
            >
              <RotateCcw size={14} /> Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}