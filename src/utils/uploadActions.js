import { saveFile } from "./fileStore";
import { addToQueue } from "./uploadQueue";
import { processQueue } from "./uploadWorker";

export async function enqueueUpload({ file, caption, userId }, onUpdate) {
  const id = crypto.randomUUID();
  const path = `reels/${userId}/${Date.now()}.mp4`;

  // ✅ Save file (IndexedDB)
  await saveFile(id, file);

  // ✅ Save metadata
  addToQueue({
    id,
    path,
    caption,
    userId,
    status: "pending",
    retries: 0,
  });

  // ✅ START WORKER IMMEDIATELY
  processQueue(onUpdate);

  return id;
}