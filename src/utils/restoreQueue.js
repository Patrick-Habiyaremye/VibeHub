// utils/restoreQueue.js
//
// Loads persisted queue items back into the in-memory store on app start
// (e.g. after a reload with uploads still pending). Safe to call from
// every tab: scheduleProcessing() internally no-ops unless this tab is
// the elected leader, so we no longer risk two tabs both re-starting the
// same upload.

import { getAllItems } from "./queueStore";
import { useUploadStore } from "../store/uploadStore";
import { scheduleProcessing } from "./uploadManager";
import { reconcileStorage } from "./storageIntegrity";

export async function restoreQueue() {
  // Clean up anything left inconsistent by a crash/kill before we load it
  // into the live store — no point restoring an item with no file behind it.
  await reconcileStorage().catch((err) =>
    console.error("Storage reconciliation failed (continuing):", err)
  );

  const items = await getAllItems();
  const { enqueue } = useUploadStore.getState();

  for (const item of items) {
    // Anything that was "uploading" when we last shut down wasn't
    // actually mid-flight anymore (no worker survives a reload) — treat
    // it as pending so it gets picked back up rather than stuck forever.
    const status = item.status === "uploading" ? "pending" : item.status;
    enqueue({ ...item, status });
  }

  scheduleProcessing();
}
