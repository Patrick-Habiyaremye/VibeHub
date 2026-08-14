import { useCallback, useEffect, useRef, useState } from "react";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
// at the top, replace the two local constants with imports:
import {
  MOMENT_MAX_VIDEO_BITRATE,
  computeAdaptiveVideoBitrate,
} from "./momentLimits";

// remove these two lines (no longer used):
// const DEFAULT_VIDEO_BITS_PER_SECOND = 2_500_000;

const MIN_CLIP_SECONDS = 3;
const DEFAULT_MAX_FILE_SIZE_BYTES = 45 * 1024 * 1024; // 45 MB
//const DEFAULT_VIDEO_BITS_PER_SECOND = 2_500_000;
const EXPORT_FPS = 24; // 24 is enough for stories and much faster than 30

function pickSupportedMimeType() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const type of candidates) {
    if (window.MediaRecorder?.isTypeSupported?.(type)) return type;
  }
  return "";
}

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
}

/**
 * Seek and wait until the frame is actually painted.
 * One rAF is not always enough on mobile; two is reliable.
 */
function seekTo(video, t) {
  const clamped = Math.min(Math.max(t, 0), video.duration || t);
  if (Math.abs(video.currentTime - clamped) < 0.05) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener("seeked", onSeeked);
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    };
    const onSeeked = () => finish();
    video.addEventListener("seeked", onSeeked);
    video.currentTime = clamped;
    setTimeout(finish, 2500); // hard timeout so export never hangs
  });
}

async function extractAudioSlice(file, start, end) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    return null;
  }

  const audioCtx = new AudioCtx();
  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    const sampleRate = decoded.sampleRate;
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.min(decoded.length, Math.floor(end * sampleRate));
    const numberOfFrames = Math.max(0, endSample - startSample);
    if (numberOfFrames === 0) return null;
    return {
      decoded,
      startSample,
      numberOfFrames,
      numberOfChannels: decoded.numberOfChannels,
      sampleRate,
    };
  } catch (err) {
    console.warn("No usable audio track for export:", err);
    return null;
  } finally {
    try {
      audioCtx.close();
    } catch {}
  }
}

async function encodeAudioTrack(muxer, audioInfo) {
  const { decoded, startSample, numberOfFrames, numberOfChannels, sampleRate } =
    audioInfo;

  const audioEncoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (e) => console.error("Audio encode error:", e),
  });
  audioEncoder.configure({
    codec: "mp4a.40.2",
    sampleRate,
    numberOfChannels,
    bitrate: 128_000,
  });

  const FRAME_SIZE = 1024;
  for (let offset = 0; offset < numberOfFrames; offset += FRAME_SIZE) {
    const frames = Math.min(FRAME_SIZE, numberOfFrames - offset);
    const planar = new Float32Array(frames * numberOfChannels);
    for (let ch = 0; ch < numberOfChannels; ch++) {
      const channelData = decoded.getChannelData(ch);
      planar.set(
        channelData.subarray(startSample + offset, startSample + offset + frames),
        ch * frames
      );
    }
    const audioData = new AudioData({
      format: "f32-planar",
      sampleRate,
      numberOfFrames: frames,
      numberOfChannels,
      timestamp: Math.round((offset / sampleRate) * 1e6),
      data: planar,
    });
    while (audioEncoder.encodeQueueSize > 4) {
      await new Promise((r) => setTimeout(r, 0));
    }
    audioEncoder.encode(audioData);
    audioData.close();
  }
  await audioEncoder.flush();
  audioEncoder.close();
}

async function exportClipFast({
  video,
  file,
  start,
  end,
  maxFileSizeBytes,
  videoBitsPerSecond,
  onProgress,
}) {
  if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") {
    throw new Error("WebCodecs not supported");
  }

  // Guard: video must have real dimensions and a live source
  if (!video.videoWidth || !video.videoHeight || !video.src) {
    throw new Error("Video not ready for export");
  }

  const width = Math.max(2, Math.floor(video.videoWidth / 2) * 2);
  const height = Math.max(2, Math.floor(video.videoHeight / 2) * 2);

  const audioInfo = await extractAudioSlice(file, start, end);
  const includeAudio = !!audioInfo && typeof AudioEncoder !== "undefined";

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height },
    audio: includeAudio
      ? {
          codec: "aac",
          numberOfChannels: audioInfo.numberOfChannels,
          sampleRate: audioInfo.sampleRate,
        }
      : undefined,
    fastStart: "in-memory",
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error("Video encode error:", e),
  });

  videoEncoder.configure({
    codec: "avc1.42001f",
    width,
    height,
    bitrate: videoBitsPerSecond,
    framerate: EXPORT_FPS,
    hardwareAcceleration: "prefer-hardware",
    latencyMode: "quality",
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });

  const wasPlaying = !video.paused;
  video.pause();

  const totalFrames = Math.max(1, Math.ceil((end - start) * EXPORT_FPS));
  let frameIndex = 0;

  const videoWork = (async () => {
    const frameDuration = 1 / EXPORT_FPS;
    for (let t = start; t < end - 0.001; t += frameDuration, frameIndex++) {
      await seekTo(video, Math.min(t, end - 0.001));

      // Ensure the video has a decoded frame before drawing
      if (video.readyState < 2) {
        await new Promise((r) => setTimeout(r, 30));
      }

      ctx.drawImage(video, 0, 0, width, height);

      let frame;
      try {
        frame = new VideoFrame(canvas, {
          timestamp: Math.round((t - start) * 1e6),
          duration: Math.round(frameDuration * 1e6),
        });
      } catch (err) {
        // Tainted canvas or other SecurityError → abort fast path
        throw err;
      }

      while (videoEncoder.encodeQueueSize > 6) {
        await new Promise((r) => setTimeout(r, 0));
      }
      videoEncoder.encode(frame, {
        keyFrame: frameIndex % (EXPORT_FPS * 2) === 0,
      });
      frame.close();

      onProgress?.(Math.min(99, Math.round((frameIndex / totalFrames) * 100)));
    }
    await videoEncoder.flush();
    videoEncoder.close();
  })();

  const audioWork = includeAudio
    ? encodeAudioTrack(muxer, audioInfo)
    : Promise.resolve();

  await Promise.all([videoWork, audioWork]);
  muxer.finalize();

  const blob = new Blob([muxer.target.buffer], { type: "video/mp4" });

  if (wasPlaying) video.play().catch(() => {});

  if (blob.size > maxFileSizeBytes) {
    const err = new Error(
      `That clip is ${formatBytes(blob.size)} — over the ${formatBytes(
        maxFileSizeBytes
      )} limit. Try a shorter clip.`
    );
    err.isOversize = true;
    throw err;
  }

  onProgress?.(100);
  return blob;
}

function exportViaMediaRecorder({ video, start, end, videoBitsPerSecond }) {
  const captureFn = video.captureStream || video.mozCaptureStream;
  if (!captureFn || !window.MediaRecorder) {
    return Promise.reject(
      new Error(
        "Your browser doesn't support in-browser clipping. Try Chrome, Edge, or Firefox."
      )
    );
  }

  // Safety: only capture from a live same-origin blob source
  if (!video.src || video.src.startsWith("http")) {
    return Promise.reject(new Error("Cannot capture from this video source"));
  }

  return new Promise((resolve, reject) => {
    const mimeType = pickSupportedMimeType();
    let stream;
    try {
      stream = captureFn.call(video);
    } catch (err) {
      reject(err);
      return;
    }

    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond,
    });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) =>
      reject(e.error || new Error("Recording failed"));
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
    };

    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      try {
        recorder.start(100); // timeslice helps some mobile browsers
        video.play().catch(reject);
      } catch (err) {
        reject(err);
      }
    };
    video.addEventListener("seeked", onSeeked);

    const onTimeUpdate = () => {
      if (video.currentTime >= end - 0.05) {
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.pause();
        if (recorder.state !== "inactive") recorder.stop();
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);

    video.currentTime = start;
  });
}

/**
 * Production VideoTrimmer
 * - Stable blob URL (state, not ref) → no more ERR_FILE_NOT_FOUND / taint
 * - Pass-through when user didn't actually trim → instant
 * - WebCodecs fast path + MediaRecorder fallback
 * - Real progress while clipping
 */
export default function VideoTrimmer({
file,
  maxDurationSeconds = 60,
  maxFileSizeBytes = 45 * 1024 * 1024,
  videoBitsPerSecond, // optional override — omit to auto-adapt to clip length
  onConfirm,
  onCancel,
}) {
  const videoRef = useRef(null);
  const trackRef = useRef(null);

  // CRITICAL: object URL must live in state so <video> re-renders with a live src
  const [objectUrl, setObjectUrl] = useState(null);

  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState(null);

  // Create / revoke blob URL safely
  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    const d = v.duration;
    if (!Number.isFinite(d) || d <= 0) {
      setError("Couldn't read this video. Try a different file.");
      return;
    }
    setDuration(d);
    setStart(0);
    setEnd(Math.min(d, maxDurationSeconds));
  };

  const clientXToSeconds = useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track || !duration) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      e.preventDefault?.();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const t = clientXToSeconds(clientX);
      if (dragging === "start") {
        const newStart = Math.max(0, Math.min(t, end - MIN_CLIP_SECONDS));
        setStart(newStart);
        setEnd((prev) => Math.min(prev, newStart + maxDurationSeconds));
      } else if (dragging === "end") {
        const newEnd = Math.min(
          duration,
          Math.max(t, start + MIN_CLIP_SECONDS),
          start + maxDurationSeconds
        );
        setEnd(newEnd);
      } else if (dragging === "scrub") {
        const clamped = Math.min(Math.max(t, start), end);
        if (videoRef.current) videoRef.current.currentTime = clamped;
        setPlayheadTime(clamped);
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, start, end, duration, maxDurationSeconds, clientXToSeconds]);

  const togglePreview = () => {
    const v = videoRef.current;
    if (!v) return;
    if (previewing) {
      v.pause();
      setPreviewing(false);
      return;
    }
    v.currentTime = start;
    v.play().catch(() => {});
    setPreviewing(true);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => {
      setPlayheadTime(v.currentTime);
      if (previewing && v.currentTime >= end - 0.05) {
        v.currentTime = start;
        v.play().catch(() => {});
      }
    };
    v.addEventListener("timeupdate", onTimeUpdate);
    return () => v.removeEventListener("timeupdate", onTimeUpdate);
  }, [start, end, previewing]);

  const handleConfirm = async () => {
    const v = videoRef.current;
    if (!v || !file || !objectUrl) return;

    setError(null);
    setExporting(true);
    setExportProgress(0);
    v.pause();
    setPreviewing(false);

    const clipLen = end - start;
    const effectiveBitrate = videoBitsPerSecond ?? computeAdaptiveVideoBitrate(clipLen);
    const almostFull =
      start < 0.15 &&
      Math.abs(end - Math.min(duration, maxDurationSeconds)) < 0.25 &&
      duration <= maxDurationSeconds + 0.5;

    // WhatsApp-style fast path: no real trim → hand the original File back
    if (almostFull && file.size <= maxFileSizeBytes) {
      onConfirm(file, {
        start: 0,
        end: duration,
        duration: duration,
        sizeBytes: file.size,
        passedThrough: true,
      });
      setExporting(false);
      return;
    }

    try {
      let blob;
      const webCodecsOk =
        typeof VideoEncoder !== "undefined" &&
        typeof VideoFrame !== "undefined";

      if (webCodecsOk) {
        try {
          blob = await exportClipFast({
            video: v,
            file,
            start,
            end,
            maxFileSizeBytes,
            videoBitsPerSecond,
            onProgress: setExportProgress,
          });
        } catch (err) {
          if (err?.isOversize) throw err;
          console.warn("Fast export failed, falling back to MediaRecorder:", err);
          blob = await exportViaMediaRecorder({
            video: v,
            start,
            end,
            videoBitsPerSecond,
          });
        }
      } else {
        blob = await exportViaMediaRecorder({
          video: v,
          start,
          end,
          videoBitsPerSecond,
        });
      }

      if (blob.size > maxFileSizeBytes) {
        setError(
          `That clip is ${formatBytes(blob.size)} — over the ${formatBytes(
            maxFileSizeBytes
          )} limit. Try a shorter clip.`
        );
        return;
      }

      onConfirm(blob, {
        start,
        end,
        duration: clipLen,
        sizeBytes: blob.size,
      });
    } catch (err) {
      console.error("Clip export failed:", err);
      setError(
        err?.isOversize
          ? err.message
          : "Couldn't create the clip. Please try a different video or a shorter range."
      );
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const clipLength = Math.max(0, end - start);
  const startPct = duration ? (start / duration) * 100 : 0;
  const endPct = duration ? (end / duration) * 100 : 100;
  const playheadPct = duration ? (playheadTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onCancel}
          disabled={exporting}
          className="text-sm text-slate-300 px-3 py-2 -ml-3 min-h-[44px] disabled:opacity-40"
        >
          Cancel
        </button>
        <p className="text-sm font-medium text-white">
          Trim to {formatTime(maxDurationSeconds)}
        </p>
        <button
          onClick={handleConfirm}
          disabled={exporting || clipLength <= 0 || !objectUrl}
          className="text-sm font-semibold text-[#FF9457] disabled:opacity-40 px-3 py-2 -mr-3 min-h-[44px]"
        >
          {exporting
            ? exportProgress > 0
              ? `Clipping… ${exportProgress}%`
              : "Clipping…"
            : "Use clip"}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 px-4">
        {objectUrl ? (
          <video
            ref={videoRef}
            src={objectUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() =>
              setError("Couldn't load this video. Try a different file.")
            }
            playsInline
            muted
            preload="auto"
            className="max-h-full max-w-full rounded-2xl bg-black"
            // Do NOT set crossOrigin on a blob: URL — that causes taint
          />
        ) : (
          <div className="text-slate-400 text-sm">Loading video…</div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mx-4 mb-2 bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 text-sm shrink-0"
        >
          {error}
        </div>
      )}

      <div className="shrink-0 px-4 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>{formatTime(start)}</span>
          <span className="text-white font-medium">
            {formatTime(clipLength)} clip
          </span>
          <span>{formatTime(end)}</span>
        </div>

        <div
          ref={trackRef}
          className="relative h-12 rounded-xl bg-white/10 select-none touch-none"
        >
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white z-20 pointer-events-none"
            style={{ left: `${playheadPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-black/60 rounded-l-xl"
            style={{ width: `${startPct}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-black/60 rounded-r-xl"
            style={{ width: `${100 - endPct}%` }}
          />
          <div
            className="absolute inset-y-0 border-y-2 border-[#FF9457] bg-[#FF9457]/10"
            style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
            onMouseDown={(e) => {
              setDragging("scrub");
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              setDragging("scrub");
              e.stopPropagation();
            }}
          />
          <div
            onMouseDown={(e) => {
              setDragging("start");
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              setDragging("start");
              e.stopPropagation();
            }}
            className="absolute top-0 bottom-0 w-6 -ml-3 flex items-center justify-center cursor-ew-resize z-10"
            style={{ left: `${startPct}%` }}
          >
            <div className="w-1.5 h-8 rounded-full bg-[#FF9457]" />
          </div>
          <div
            onMouseDown={(e) => {
              setDragging("end");
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              setDragging("end");
              e.stopPropagation();
            }}
            className="absolute top-0 bottom-0 w-6 -ml-3 flex items-center justify-center cursor-ew-resize z-10"
            style={{ left: `${endPct}%` }}
          >
            <div className="w-1.5 h-8 rounded-full bg-[#FF9457]" />
          </div>
        </div>

        <button
          onClick={togglePreview}
          disabled={exporting || !objectUrl}
          className="w-full mt-4 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition disabled:opacity-40"
        >
          {previewing ? "⏸ Pause preview" : "▶ Preview clip"}
        </button>
      </div>
    </div>
  );
}

