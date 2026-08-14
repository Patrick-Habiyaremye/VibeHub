// utils/networkMonitor.js
//
// Without this, a dropped connection just sits inside tus's own retry
// loop (retryDelays in resumableUploader.js) until it gives up and calls
// onError — the item ends up "failed" for something that wasn't really a
// failure. This watches connectivity directly: on drop, actively-
// uploading items are paused (not failed); on reconnect, only the ones
// *we* paused for this reason are resumed automatically. Anything the
// user paused manually stays paused until they act.

import { isTabLeader } from "./tabLeader";
import { useUploadStore } from "../store/uploadStore";
import { pauseUpload, resumeUpload, scheduleProcessing } from "./uploadManager";

let initialized = false;
let wasOffline = typeof navigator !== "undefined" && !navigator.onLine;

export function initNetworkMonitor() {
  if (initialized) return;
  initialized = true;

  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);
}

function handleOffline() {
  wasOffline = true;
  if (!isTabLeader()) return;

  const { uploads } = useUploadStore.getState();
  for (const item of Object.values(uploads)) {
    if (item.status === "uploading") {
      pauseUpload(item.id, { auto: true });
    }
  }
}

function handleOnline() {
  if (!wasOffline) return; // spurious online event with nothing to recover
  wasOffline = false;
  if (!isTabLeader()) return;

  const { uploads } = useUploadStore.getState();
  for (const item of Object.values(uploads)) {
    if (item.status === "paused" && item.autoPaused) {
      resumeUpload(item.id);
    }
  }
  scheduleProcessing();
}

export function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
