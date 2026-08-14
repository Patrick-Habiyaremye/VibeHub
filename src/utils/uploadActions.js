// utils/uploadActions.js
//
// Entry point the UI calls to add a reel to the upload queue.
//
// FIX (this pass): queue item now also stores width/height from
// validateVideoFile, so ReelCard/ReelPlayer can size the live upload
// preview correctly too, not just the finished server-side reel.

import { saveFile } from "./fileStore";
import { upsertItem } from "./queueStore";
import { compressVideo } from "./compressVideo";
import { validateVideoFile } from "./validateFile";
import { generateThumbnail } from "./thumbnailGenerator";
import { useUploadStore } from "../store/uploadStore";
import { emitQueueChange, scheduleProcessing } from "./uploadManager";

/**
 * @throws {Error} if the file fails validation (wrong type, too large,
 *   too long, or unreadable/corrupt) — callers should catch this and show
 *   the message to the user rather than silently enqueueing garbage.
 */
export async function enqueueUpload({ file, caption, userId }) {
  const check = await validateVideoFile(file);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const id = crypto.randomUUID();
  const path = `${userId}/${id}.mp4`;

  const item = {
    id,
    fileId: id,
    caption,
    userId,
    path,
    status: "compressing",
    progress: 0,
    error: null,
    retryCount: 0,
    duration: check.duration,
    width: check.width,
    height: check.height,
    hasThumbnail: false,
    createdAt: Date.now(),
  };

  await saveFile(id, file);
  await upsertItem(item);
  useUploadStore.getState().enqueue(item);

  generateThumbnailInBackground(id, file);
  compressInBackground(id, file);

  return id;
}

async function generateThumbnailInBackground(id, file) {
  try {
    const thumb = await generateThumbnail(file);
    await saveFile(`${id}:thumb`, thumb);
    emitQueueChange(id, { hasThumbnail: true });
  } catch (err) {
    console.warn("Thumbnail generation failed (non-fatal):", err);
  }
}

async function compressInBackground(id, file) {
  try {
    const compressed = await compressVideo(file, {
      onProgress: (percent) => {
        emitQueueChange(id, { status: "compressing", progress: percent });
      },
    });

    await saveFile(id, compressed);
    emitQueueChange(id, { status: "pending", progress: 0 });
  } catch (err) {
    console.warn("Video compression failed, uploading original file:", err);
    emitQueueChange(id, { status: "pending", progress: 0 });
  } finally {
    scheduleProcessing();
  }
}