// hooks/useUploadPreviewUrl.js
//
// Resolves a playable/previewable local URL for a file still sitting in
// IndexedDB (an in-progress upload, before it has a real server URL).
//
// This deliberately does NOT read a `previewUrl` field off the queue item.
// blob: URLs are only valid in the browsing context (tab) that created
// them — if Tab A generated one and broadcast the item to Tab B, Tab B's
// <video src={that url}> would just be broken. IndexedDB, unlike blob
// URLs, *is* shared across tabs of the same origin, so each tab
// independently deriving its own object URL from the shared blob is the
// only version of this that actually works everywhere.
//
// `refreshKey` should be something that changes when the underlying blob
// might have been replaced (e.g. compression finishing) — pass the
// item's `status` or `hasThumbnail` so this re-fetches at the right time.

import { useEffect, useState } from "react";
import { getFile } from "../utils/fileStore";

export function useUploadPreviewUrl(fileId, refreshKey) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!fileId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl = null;

    getFile(fileId)
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, refreshKey]);

  return url;
}