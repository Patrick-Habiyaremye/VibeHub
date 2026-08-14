// import { useCallback, useRef, useState } from "react";
// import * as tus from "tus-js-client";
// import { supabase } from "../../../supabaseClient";

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// function tusEndpoint() {
//   if (!SUPABASE_URL) return null;
//   try {
//     const u = new URL(SUPABASE_URL);
//     if (u.hostname.endsWith(".supabase.co") && !u.hostname.includes(".storage.")) {
//       u.hostname = u.hostname.replace(".supabase.co", ".storage.supabase.co");
//     }
//     return `${u.origin}/storage/v1/upload/resumable`;
//   } catch {
//     return `${SUPABASE_URL}/storage/v1/upload/resumable`;
//   }
// }

// const CHUNK_SIZE = 6 * 1024 * 1024;
// const RETRY_DELAYS_MS = [0, 1000, 2000, 4000, 8000, 15000, 30000];

// function decodeJwtPayload(jwt) {
//   try {
//     const part = jwt.split(".")[1];
//     return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
//   } catch {
//     return null;
//   }
// }

// // A real user session token is always a 3-part JWT.
// function isWellFormedJwt(token) {
//   return typeof token === "string" && token.split(".").length === 3 && decodeJwtPayload(token) !== null;
// }

// // The project's apikey can be EITHER:
// //  - a new-style publishable/secret key: "sb_publishable_..." / "sb_secret_..."
// //  - a legacy anon/service_role JWT (3 parts)
// // Both are valid — don't force JWT shape here.
// function isWellFormedApiKey(key) {
//   if (typeof key !== "string" || key.length < 20) return false;
//   if (key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) return true;
//   return isWellFormedJwt(key);
// }

// function isNetworkish(err) {
//   const msg = err?.message || String(err || "");
//   return /network|failed to fetch|ECONNRESET|ETIMEDOUT|NetworkError|Load failed/i.test(msg);
// }

// function friendlyUploadError(err) {
//   const msg = err?.message || String(err || "");
//   const body = err?.originalResponse?.getBody?.() || "";

//   if (/maximum allowed size|exceeded|413/i.test(msg)) {
//     return "This file is too large to upload. Try a shorter or lower-quality clip.";
//   }
//   if (/Invalid Compact JWS/i.test(body) || /Invalid Compact JWS/i.test(msg)) {
//     return "Your app's Supabase API key is outdated for this project. Check VITE_SUPABASE_ANON_KEY in your .env — it should be the current publishable key from Project Settings → API Keys, not the legacy anon key.";
//   }
//   if (isNetworkish(err)) {
//     return "Connection lost. Check your internet and tap retry.";
//   }
//   if (/401|403|jwt|expired|InvalidJWT/i.test(msg) || /401|403/.test(String(err?.originalResponse?.getStatus?.()))) {
//     return "Your session expired. Please sign in again and retry.";
//   }
//   return "Upload failed. Please try again.";
// }

// // Runs before any network call — catches config problems with a specific
// // diagnosis instead of a generic 400 after the fact.
// function preflightCheckConfig() {
//   const problems = [];

//   if (!SUPABASE_URL) {
//     problems.push("VITE_SUPABASE_URL is missing.");
//   }
//   if (!isWellFormedApiKey(SUPABASE_ANON_KEY)) {
//     problems.push(
//       "VITE_SUPABASE_ANON_KEY is invalid. It should be either the publishable key " +
//       "(starts with sb_publishable_) or a valid legacy anon JWT, copied fresh from " +
//       "Project Settings → API Keys. Restart the dev server after changing .env."
//     );
//   }

//   // Only cross-check project ref when the key is a JWT — publishable keys
//   // don't carry a decodable ref claim.
//   if (isWellFormedJwt(SUPABASE_ANON_KEY)) {
//     const anonPayload = decodeJwtPayload(SUPABASE_ANON_KEY);
//     const urlRef = SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
//     const anonRef = anonPayload?.ref;
//     if (urlRef && anonRef && urlRef !== anonRef) {
//       problems.push(
//         `VITE_SUPABASE_URL points to project "${urlRef}" but VITE_SUPABASE_ANON_KEY ` +
//         `belongs to project "${anonRef}".`
//       );
//     }
//   }

//   if (problems.length > 0) {
//     console.error("[preflight] Supabase config problems found:\n" + problems.join("\n"));
//   }

//   return problems;
// }

// async function getFreshAccessToken() {
//   let sessionResult;
//   try {
//     sessionResult = await supabase.auth.getSession();
//   } catch {
//     return { error: "Couldn't reach the auth server. Check your connection." };
//   }

//   const { session } = sessionResult.data;
//   if (!session) {
//     return { error: "You need to be signed in to upload." };
//   }

//   const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
//   const needsRefresh = !expiresAt || expiresAt - Date.now() < 90_000;

//   let token = session.access_token;

//   if (needsRefresh) {
//     try {
//       const { data, error } = await supabase.auth.refreshSession();
//       if (!error && data.session) {
//         token = data.session.access_token;
//       }
//     } catch {
//       // fall back to existing token
//     }
//   }

//   if (!isWellFormedJwt(token)) {
//     console.error("[auth] access_token is not a valid JWT:", token);
//     return { error: "Your session looks corrupted. Please sign out and back in, then retry." };
//   }

//   return { token };
// }

// /**
//  * Resumable, progress-tracked upload to Supabase Storage.
//  * status: "idle" | "uploading" | "paused" | "error" | "done"
//  */
// export function useResumableUpload() {
//   const uploadRef = useRef(null);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState("idle");
//   const [error, setError] = useState(null);

//   const start = useCallback(async ({ file, bucket, path, contentType }) => {
//     setStatus("uploading");
//     setError(null);
//     if (!uploadRef.current) setProgress(0);

//     if (!file) {
//       setStatus("error");
//       setError("No file was provided to upload.");
//       return;
//     }
//     if (!bucket || !path) {
//       setStatus("error");
//       setError("Upload isn't configured correctly. (Missing bucket or destination path.)");
//       return;
//     }

//     const configProblems = preflightCheckConfig();
//     if (configProblems.length > 0) {
//       setStatus("error");
//       setError(configProblems.join(" "));
//       return;
//     }

//     const endpoint = tusEndpoint();
//     if (!endpoint) {
//       setStatus("error");
//       setError("Upload isn't configured correctly. (Couldn't build upload endpoint.)");
//       return;
//     }

//     const { token, error: tokenError } = await getFreshAccessToken();
//     if (!token) {
//       setStatus("error");
//       setError(tokenError || "You need to be signed in to upload.");
//       return;
//     }

//     const resolvedContentType = contentType || file.type || "application/octet-stream";

//     const upload = new tus.Upload(file, {
//       endpoint,
//       retryDelays: RETRY_DELAYS_MS,
//       overridePatchMethod: true,
//       headers: {
//         authorization: `Bearer ${token}`,
//         apikey: SUPABASE_ANON_KEY,
//         "x-upsert": "true",
//       },
//       onBeforeRequest: async (req) => {
//         const { token: fresh } = await getFreshAccessToken();
//         if (fresh) {
//           req.setHeader("authorization", `Bearer ${fresh}`);
//           req.setHeader("apikey", SUPABASE_ANON_KEY);
//         }
//       },
//       fingerprint: (_file, options) =>
//         Promise.resolve(`supabase-upload-${options.metadata.objectName}`),
//       uploadDataDuringCreation: true,
//       removeFingerprintOnSuccess: true,
//       metadata: {
//         bucketName: bucket,
//         objectName: path,
//         contentType: resolvedContentType,
//         cacheControl: "3600",
//       },
//       chunkSize: CHUNK_SIZE,
//       onShouldRetry: (err, retryAttempt, options) => {
//         const statusCode = err?.originalResponse?.getStatus?.();
//         const body = err?.originalResponse?.getBody?.() || "";

//         if (statusCode === 413) return false;
//         if (/Invalid Compact JWS/i.test(body)) return false;

//         if (statusCode === 401 || statusCode === 403) {
//           return retryAttempt < 2;
//         }
//         return retryAttempt < options.retryDelays.length;
//       },
//       onError: (err) => {
//         const statusCode = err?.originalResponse?.getStatus?.();
//         const body = err?.originalResponse?.getBody?.();
//         console.error("Upload failed:", err, { status: statusCode, body });
//         setStatus("error");
//         setError(friendlyUploadError(err));
//       },
//       onProgress: (bytesUploaded, bytesTotal) => {
//         if (bytesTotal > 0) {
//           setProgress(Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100)));
//         }
//       },
//       onSuccess: () => {
//         setStatus("done");
//         setProgress(100);
//       },
//     });

//     uploadRef.current = upload;

//     try {
//       const previousUploads = await upload.findPreviousUploads();
//       if (previousUploads.length > 0) {
//         upload.resumeFromPreviousUpload(previousUploads[0]);
//       }
//     } catch (e) {
//       console.warn("[tus] findPreviousUploads failed, starting fresh:", e);
//     }

//     try {
//       upload.start();
//     } catch (e) {
//       console.error("[tus] upload.start() threw synchronously:", e);
//       setStatus("error");
//       setError(friendlyUploadError(e));
//     }
//   }, []);

//   const pause = useCallback(() => {
//     if (!uploadRef.current) return;
//     uploadRef.current.abort();
//     setStatus("paused");
//   }, []);

//   const resume = useCallback(async () => {
//     if (!uploadRef.current) return;
//     const { token, error: tokenError } = await getFreshAccessToken();
//     if (!token) {
//       setStatus("error");
//       setError(tokenError || "Your session expired while paused. Please sign in again.");
//       return;
//     }
//     setStatus("uploading");
//     uploadRef.current.start();
//   }, []);

//   const retry = useCallback(async () => {
//     if (!uploadRef.current) return;
//     const { token, error: tokenError } = await getFreshAccessToken();
//     if (!token) {
//       setStatus("error");
//       setError(tokenError || "Your session expired. Please sign in again.");
//       return;
//     }
//     setStatus("uploading");
//     setError(null);
//     uploadRef.current.start();
//   }, []);

//   const reset = useCallback(() => {
//     if (uploadRef.current) {
//       try {
//         uploadRef.current.abort();
//       } catch {}
//     }
//     uploadRef.current = null;
//     setStatus("idle");
//     setProgress(0);
//     setError(null);
//   }, []);

//   return { status, progress, error, start, pause, resume, retry, reset };
// }

// useResumableUpload.js
//
// Uploads a file to Supabase Storage via the standard (non-tus) object
// endpoint, with real upload progress via XMLHttpRequest, cancellation,
// automatic token refresh, and clear, actionable error messages.
//
// NOTE ON NAMING: the hook is still called `useResumableUpload` for
// drop-in compatibility with existing call sites, but it no longer uses
// tus/resumable-protocol uploads (see project notes: the tus endpoint has
// an unresolved server-side issue with this project's rotated JWT keys).
// True mid-upload pause/resume is not possible without chunking — see the
// `pause`/`resume` docs below for what they actually do here.

import { useCallback, useRef, useState } from "react";
import { supabase } from "../../../supabaseClient";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const DEFAULT_MAX_FILE_BYTES = 200 * 1024 * 1024; // 200MB — adjust to your plan's limit
const TOKEN_REFRESH_MARGIN_MS = 90_000; // refresh if <90s of token life remain

// ---------------------------------------------------------------------------
// Pure helpers (no React, easy to unit test in isolation)
// ---------------------------------------------------------------------------

function decodeJwtPayload(jwt) {
  try {
    const part = jwt.split(".")[1];
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function isWellFormedJwt(token) {
  return typeof token === "string" && token.split(".").length === 3 && decodeJwtPayload(token) !== null;
}

// Supabase apikeys come in two valid shapes: the new opaque
// sb_publishable_/sb_secret_ keys, or a legacy anon/service_role JWT.
function isWellFormedApiKey(key) {
  if (typeof key !== "string" || key.length < 20) return false;
  if (key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) return true;
  return isWellFormedJwt(key);
}

function buildObjectUrl(bucket, path) {
  if (!SUPABASE_URL) return null;
  // Standard object endpoint lives on the main project URL, not the
  // dedicated storage subdomain that tus resumable uploads use.
  const encodedPath = path
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
}

function validateFile(file, { maxSizeBytes = DEFAULT_MAX_FILE_BYTES, allowedTypes } = {}) {
  if (!file) return "No file was provided to upload.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return `This file is too large (max ${maxMb}MB). Try a shorter or lower-quality clip.`;
  }
  if (allowedTypes && allowedTypes.length > 0) {
    const type = file.type || "";
    const matches = allowedTypes.some((t) => (t.endsWith("/*") ? type.startsWith(t.slice(0, -1)) : type === t));
    if (!matches) {
      return `Unsupported file type${type ? ` (${type})` : ""}. Allowed: ${allowedTypes.join(", ")}.`;
    }
  }
  return null;
}

function preflightCheckConfig() {
  const problems = [];
  if (!SUPABASE_URL) problems.push("VITE_SUPABASE_URL is missing.");
  if (!isWellFormedApiKey(SUPABASE_ANON_KEY)) {
    problems.push(
      "VITE_SUPABASE_ANON_KEY is invalid or missing. Copy the current publishable key " +
      "from Project Settings → API Keys and restart the dev server."
    );
  }
  if (problems.length > 0) {
    console.error("[preflight] Supabase config problems:\n" + problems.join("\n"));
  }
  return problems;
}

async function getFreshAccessToken() {
  let sessionResult;
  try {
    sessionResult = await supabase.auth.getSession();
  } catch {
    return { error: "Couldn't reach the auth server. Check your connection." };
  }

  const { session } = sessionResult.data;
  if (!session) return { error: "You need to be signed in to upload." };

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  const needsRefresh = !expiresAt || expiresAt - Date.now() < TOKEN_REFRESH_MARGIN_MS;

  let token = session.access_token;
  if (needsRefresh) {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session) token = data.session.access_token;
    } catch {
      // fall back to existing token — it may still have a few seconds left
    }
  }

  if (!isWellFormedJwt(token)) {
    console.error("[auth] access_token is not a valid JWT:", token);
    return { error: "Your session looks corrupted. Please sign out and back in, then retry." };
  }

  return { token };
}

function friendlyUploadError({ status, body, isAbort, isNetwork }) {
  if (isAbort) return "Upload cancelled.";
  if (isNetwork) return "Connection lost. Check your internet and tap retry.";
  if (status === 413) return "This file is too large to upload. Try a shorter or lower-quality clip.";
  if (status === 401 || status === 403) {
    if (/Invalid Compact JWS/i.test(body || "")) {
      return "Your Supabase API key isn't valid for this project. Check VITE_SUPABASE_ANON_KEY and restart the dev server.";
    }
    return "Your session expired. Please sign in again and retry.";
  }
  if (status >= 500) return "Supabase is having trouble right now. Please try again shortly.";
  return "Upload failed. Please try again.";
}

// Low-level XHR upload — kept separate from the hook so it's independently
// testable and reusable outside React if needed.
function uploadFileViaXhr({ url, file, token, apikey, contentType, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", apikey);
    xhr.setRequestHeader("content-type", contentType);
    xhr.setRequestHeader("x-upsert", "true");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
      }
    };

    xhr.onload = () => {
      const status = xhr.status;
      if (status >= 200 && status < 300) {
        resolve({ status, body: xhr.responseText });
      } else {
        reject({ status, body: xhr.responseText, isAbort: false, isNetwork: false });
      }
    };

    xhr.onerror = () => {
      reject({ status: 0, body: null, isAbort: false, isNetwork: true });
    };

    xhr.onabort = () => {
      reject({ status: 0, body: null, isAbort: true, isNetwork: false });
    };

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(file);
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Upload a file to Supabase Storage with progress tracking, cancellation,
 * automatic auth-token refresh, and retry.
 *
 * status: "idle" | "uploading" | "error" | "done" | "cancelled"
 *
 * Note: this uses a single-request PUT, not chunked/resumable upload.
 * `pause()` cancels the in-flight request (progress is lost); `resume()`
 * and `retry()` both restart the upload from 0% using the last params
 * passed to `start()`. If you need true byte-level resume for very large
 * files, that requires fixing the tus/resumable endpoint issue instead.
 */
export function useResumableUpload({ maxSizeBytes, allowedTypes } = {}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const lastArgsRef = useRef(null); // { file, bucket, path, contentType } — for retry/resume

  const runUpload = useCallback(async ({ file, bucket, path, contentType }) => {
    setStatus("uploading");
    setError(null);
    setProgress(0);

    const fileProblem = validateFile(file, { maxSizeBytes, allowedTypes });
    if (fileProblem) {
      setStatus("error");
      setError(fileProblem);
      return;
    }
    if (!bucket || !path) {
      setStatus("error");
      setError("Upload isn't configured correctly. (Missing bucket or destination path.)");
      return;
    }

    const configProblems = preflightCheckConfig();
    if (configProblems.length > 0) {
      setStatus("error");
      setError(configProblems.join(" "));
      return;
    }

    const url = buildObjectUrl(bucket, path);
    if (!url) {
      setStatus("error");
      setError("Upload isn't configured correctly. (Couldn't build upload URL.)");
      return;
    }

    const { token, error: tokenError } = await getFreshAccessToken();
    if (!token) {
      setStatus("error");
      setError(tokenError || "You need to be signed in to upload.");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await uploadFileViaXhr({
        url,
        file,
        token,
        apikey: SUPABASE_ANON_KEY,
        contentType: contentType || file.type || "application/octet-stream",
        onProgress: setProgress,
        signal: controller.signal,
      });
      setStatus("done");
      setProgress(100);
    } catch (err) {
      if (err?.isAbort) {
        setStatus("cancelled");
        setError(null);
        return;
      }
      console.error("Upload failed:", err);
      setStatus("error");
      setError(friendlyUploadError(err));
    } finally {
      abortControllerRef.current = null;
    }
  }, [maxSizeBytes, allowedTypes]);

  const start = useCallback(async ({ file, bucket, path, contentType }) => {
    lastArgsRef.current = { file, bucket, path, contentType };
    await runUpload(lastArgsRef.current);
  }, [runUpload]);

  // Cancels the in-flight request. Progress is lost (single-request PUT,
  // not chunked) — this is a hard stop, not a true pause.
  const pause = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Restarts from 0% using the same file/destination as the last start().
  const resume = useCallback(async () => {
    if (!lastArgsRef.current) return;
    await runUpload(lastArgsRef.current);
  }, [runUpload]);

  // Alias of resume — kept distinct in the returned API in case callers
  // want different UI copy ("Retry" after an error vs "Resume" after pause).
  const retry = useCallback(async () => {
    if (!lastArgsRef.current) return;
    await runUpload(lastArgsRef.current);
  }, [runUpload]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    lastArgsRef.current = null;
    setStatus("idle");
    setProgress(0);
    setError(null);
  }, []);

  return { status, progress, error, start, pause, resume, retry, reset };
}