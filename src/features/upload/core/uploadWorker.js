import { getActiveUploads, updateUpload } from "./uploadQueue";
import { uploadChunks } from "./chunkUpload";
import { retry } from "./retry";

export async function processUploads(onUpdate) {
  const uploads = await getActiveUploads();

  for (const u of uploads) {
    if (u.status === "completed") continue;

    try {
      await updateUpload(u.id, { status: "uploading" });

      await retry(() =>
        uploadChunks(
          u.file,
          async (chunkIndex) => {
            // 🔥 call backend
            const res = await fetch("/api/upload-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileId: u.id,
                chunkIndex,
              }),
            });

            return res.json();
          },
          async (progress) => {
            await updateUpload(u.id, { progress });

            onUpdate?.({
              id: u.id,
              progress,
              uploading: true,
            });
          }
        )
      );

      // finalize
      await fetch("/api/upload-complete", {
        method: "POST",
        body: JSON.stringify({ fileId: u.id }),
      });

      await updateUpload(u.id, {
        status: "completed",
        progress: 100,
      });

      onUpdate?.({
        id: u.id,
        uploading: false,
        done: true,
      });

    } catch (err) {
      await updateUpload(u.id, {
        status: "failed",
        retries: u.retries + 1,
      });

      onUpdate?.({
        id: u.id,
        error: true,
      });
    }
  }
}