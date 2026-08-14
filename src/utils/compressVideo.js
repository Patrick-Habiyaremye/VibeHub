// utils/compressVideo.js
//
// Wraps @ffmpeg/ffmpeg (WASM) to transcode reels client-side before they
// hit the upload queue. Two things make this "production" rather than a
// demo: (1) the WASM instance can only run one job at a time, so jobs are
// serialized through a chain rather than left to race each other, and
// (2) virtual-FS cleanup happens in `finally`, so a failed encode can't
// leak memory in the ffmpeg instance.

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { COMPRESSION } from "./config";

let ffmpeg;
let loadPromise;

async function getFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
  }
  if (!loadPromise) {
    loadPromise = ffmpeg.load().catch((err) => {
      // Allow retrying load on the next call instead of getting stuck.
      loadPromise = undefined;
      throw err;
    });
  }
  await loadPromise;
  return ffmpeg;
}

// Serializes compression jobs since a single ffmpeg WASM instance cannot
// run two `exec()` calls concurrently.
let jobChain = Promise.resolve();

/**
 * @param {File|Blob} file
 * @param {Object} [opts]
 * @param {(percent:number)=>void} [opts.onProgress]
 * @param {()=>boolean} [opts.shouldAbort] - checked between setup and exec;
 *   if it returns true the original file is returned unmodified. (ffmpeg.wasm
 *   has no clean mid-encode cancel, so this is a best-effort early-out only.)
 * @returns {Promise<Blob>}
 */
export function compressVideo(file, opts = {}) {
  const { onProgress, shouldAbort } = opts;

  const run = async () => {
    if (file.size < COMPRESSION.SKIP_UNDER_BYTES) {
      onProgress?.(100);
      return file instanceof Blob ? file : new Blob([file]);
    }

    if (shouldAbort?.()) return file;

    const ff = await getFFmpeg();

    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const inputName = `input_${stamp}.mp4`;
    const outputName = `output_${stamp}.mp4`;

    const onFFProgress = ({ progress }) => {
      if (typeof progress === "number" && Number.isFinite(progress)) {
        onProgress?.(Math.max(0, Math.min(100, Math.round(progress * 100))));
      }
    };
    ff.on("progress", onFFProgress);

    try {
      await ff.writeFile(inputName, await fetchFile(file));

      const preset = file.size > COMPRESSION.LARGE_FILE_BYTES ? "veryfast" : "fast";

      await ff.exec([
        "-i", inputName,
        "-vcodec", "libx264",
        "-crf", String(COMPRESSION.CRF),
        "-preset", preset,
        // Copy audio instead of re-encoding — cuts encode time noticeably
        // and reels rarely need audio re-processing.
        "-acodec", "copy",
        // Lets playback/streaming start before the whole file downloads.
        "-movflags", "+faststart",
        outputName,
      ]);

      const data = await ff.readFile(outputName);
      onProgress?.(100);
      return new Blob([data.buffer], { type: "video/mp4" });
    } finally {
      // VERY IMPORTANT — always runs, even if writeFile/exec/readFile threw,
      // so a failed job never leaves stale files in the ffmpeg virtual FS.
      ff.off("progress", onFFProgress);
      await ff.deleteFile(inputName).catch(() => {});
      await ff.deleteFile(outputName).catch(() => {});
    }
  };

  const result = jobChain.then(run, run);
  // Keep the chain alive even if this job rejected, so the *next* queued
  // job still runs instead of being stuck behind a broken promise.
  jobChain = result.then(
    () => {},
    () => {}
  );
  return result;
}