// hooks/useUploadControls.js
//
// Thin, stable wrapper around utils/uploadManager.js's pause/resume/retry/
// cancel. The previous version reimplemented this logic by hand and had
// a real bug: it imported `activeUploads` from "../utils/uploadWorker",
// but uploadWorker.js never exports that — it lives in uploadRegistry.js.
// That import resolves to `undefined`, so `activeUploads.get(id)` would
// throw the moment pause/cancel/retry was used.
//
// Beyond the broken import, hand-rolling this here bypassed uploadManager's
// `activeCount` bookkeeping — aborting an upload directly (instead of via
// pauseUpload/cancelUpload) leaves the manager thinking a slot is still
// busy, which permanently starves the scheduler by one slot per action.
// Every one of these now goes through the same functions the scheduler
// itself uses, so state stays consistent everywhere.

import { useCallback } from "react";
import {
  pauseUpload,
  resumeUpload,
  retryUpload,
  cancelUpload,
} from "../utils/uploadManager";

export function useUploadControls() {
  const pause = useCallback((id) => pauseUpload(id), []);
  const resume = useCallback((id) => resumeUpload(id), []);
  const retry = useCallback((id) => retryUpload(id), []);
  const cancel = useCallback((id) => cancelUpload(id), []);

  return { pause, resume, retry, cancel };
}