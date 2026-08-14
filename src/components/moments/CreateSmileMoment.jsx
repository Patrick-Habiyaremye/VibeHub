//C:\code\KeshApp\VibeHub\src\components\moments\CreateSmileMoment.jsx

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import VideoTrimmer from "./VideoTrimmer";
import { useResumableUpload } from "./hooks/useResumableUpload";
//import { useCreateMediaPost } from "./hooks/useCreaateMediaPost"

const MAX_IMAGE_MB = 10;
//const MAX_VIDEO_MB = 50;
// Videos longer than this get routed through VideoTrimmer before they
// ever reach the editor — this is the limit that was previously
// unenforced (only file *size* was checked, never duration), so a
// multi-minute video could sail straight through to publish.
// replace the local constant:
// const MAX_VIDEO_SECONDS = 60;
import { MAX_VIDEO_SECONDS, MAX_VIDEO_MB } from "./momentLimits";
// (remove the separate local MAX_VIDEO_MB = 50 constant too — one
// source of truth for both now)
// Single storage bucket for every moment upload — kept as one named
// constant so there's no chance of a second composer (or a future
// copy-paste) quietly writing to a different bucket than this one
// reads from.
const STORAGE_BUCKET = "moments";

// -----------------------------------------------------------------------
// MUSIC — powered entirely by Apple's public iTunes Search API.
// itunes.apple.com/search is CORS-enabled and works directly from the
// browser, unlike the RSS "most played" marketing feed (which frequently
// has no CORS headers and no data for smaller storefronts). "Trending" is
// built by merging a handful of genre searches instead of relying on that
// feed, so it degrades gracefully instead of failing outright.
// -----------------------------------------------------------------------
const SEARCH_COUNTRY = "RW";
const SEARCH_COUNTRY_FALLBACK = "US";
const TRENDING_TERMS = ["Afrobeats hits", "Amapiano", "R&B hits", "Gospel hits", "Top hits"];
const FETCH_TIMEOUT_MS = 8000;

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function mapItunesTrack(r) {
  return {
    id: String(r.trackId),
    title: r.trackName,
    artist: r.artistName,
    url: r.previewUrl,
    artwork: r.artworkUrl100,
  };
}

async function searchItunesTracks(term, limit = 25, country = SEARCH_COUNTRY) {
  const data = await fetchJson(
    `https://itunes.apple.com/search?term=${encodeURIComponent(
      term
    )}&media=music&entity=song&limit=${limit}&country=${country}`
  );
  let results = (data.results || []).filter((r) => r.previewUrl).map(mapItunesTrack);

  // Small/underpopulated storefronts can return nothing for a given term —
  // fall back to a broader catalog rather than showing an empty list.
  if (results.length === 0 && country !== SEARCH_COUNTRY_FALLBACK) {
    const fallback = await fetchJson(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        term
      )}&media=music&entity=song&limit=${limit}&country=${SEARCH_COUNTRY_FALLBACK}`
    );
    results = (fallback.results || []).filter((r) => r.previewUrl).map(mapItunesTrack);
  }

  return results;
}

async function fetchTrendingTracks() {
  const seen = new Set();
  const collected = [];
  let lastError = null;

  for (const term of TRENDING_TERMS) {
    try {
      const results = await searchItunesTracks(term, 10);
      for (const t of results) {
        if (!seen.has(t.id)) {
          seen.add(t.id);
          collected.push(t);
        }
      }
    } catch (err) {
      lastError = err;
    }
    if (collected.length >= 20) break;
  }

  if (collected.length === 0) {
    throw lastError || new Error("No trending songs available right now");
  }
  return collected;
}

// -----------------------------------------------------------------------
// VIDEO DURATION — read via an offscreen <video> element rather than
// trusting file metadata (containers can lie/omit duration). Used to
// decide whether a picked video needs to go through VideoTrimmer.
// -----------------------------------------------------------------------
function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Couldn't read video metadata"));
    };
    video.src = URL.createObjectURL(file);
  });
}

// near the top, with the other constants
function extensionForBlobType(mimeType) {
  if (mimeType === "video/webm") return "webm"; // MediaRecorder fallback path
  return "mp4"; // fast (WebCodecs + mp4-muxer) path, and the default
}

const BG_GRADIENTS = [
  "from-[#FF7A45] to-[#FFB238]",
  "from-[#F5386D] to-[#FF7A45]",
  "from-[#8B5CF6] to-[#F5386D]",
  "from-[#0EA5A5] to-[#22C55E]",
  "from-[#2563EB] to-[#8B5CF6]",
  "from-[#F59E0B] to-[#EF4444]",
];

const DURATIONS = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "24 hours", hours: 24 },
];

const MOOD_TAGS = [
  { emoji: "😄", label: "Feeling Good" },
  { emoji: "🔥", label: "On Fire" },
  { emoji: "🥳", label: "Celebrating" },
  { emoji: "😌", label: "Chill Vibes" },
  { emoji: "❤️", label: "Grateful" },
  { emoji: "💭", label: "Just Thinking" },
  { emoji: "🌙", label: "Moody" },
];

/**
 * Full-screen progress UI shown while `step === "uploading"`. Purely
 * presentational — every button here just calls back into the
 * resumable-upload hook or the parent's retry/cancel handlers.
 *
 * hasMedia === false means a text moment (nothing to upload — this
 * just reflects the brief window while the row insert is in flight).
 */
function UploadStatusPanel({
  hasMedia,
  uploadStatus,
  progress,
  uploadError,
  insertFailed,
  insertError,
  onPause,
  onResume,
  onRetryUpload,
  onRetryPost,
  onCancel,
}) {
  const uploading = hasMedia && uploadStatus === "uploading";
  const paused = hasMedia && uploadStatus === "paused";
  const uploadFailed = hasMedia && uploadStatus === "error";
  const uploadDone = !hasMedia || uploadStatus === "done";
  const finishing = uploadDone && !insertFailed;

  let title = "Posting your moment…";
  let subtitle = null;

  if (uploadFailed) {
    title = "Upload failed";
    subtitle = uploadError;
  } else if (insertFailed) {
    title = "Couldn't finish posting";
    subtitle = insertError;
  } else if (uploading) {
    title = `Uploading… ${progress}%`;
  } else if (paused) {
    title = `Paused at ${progress}%`;
  } else if (finishing) {
    title = hasMedia ? "Upload complete — finishing up…" : "Posting your moment…";
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-full max-w-xs">
        {hasMedia ? (
          <div
            className="h-2 rounded-full bg-white/10 overflow-hidden mb-3"
            role="progressbar"
            aria-valuenow={uploadDone ? 100 : progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-[#FF7A45] to-[#FFB238] transition-all duration-200"
              style={{ width: `${uploadDone ? 100 : progress}%` }}
            />
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto border-2 border-white/30 border-t-[#FF9457] rounded-full animate-spin mb-3" />
        )}
        <p className="text-sm font-semibold text-white">{title}</p>
        {subtitle && (
          <p role="alert" className="text-xs text-red-400 mt-1.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {uploading && (
          <button
            onClick={onPause}
            className="rounded-full bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-medium"
          >
            Pause
          </button>
        )}
        {paused && (
          <button
            onClick={onResume}
            className="rounded-full bg-gradient-to-r from-[#FF7A45] to-[#FFB238] px-5 py-2.5 text-sm font-semibold"
          >
            Resume
          </button>
        )}
        {uploadFailed && (
          <button
            onClick={onRetryUpload}
            className="rounded-full bg-gradient-to-r from-[#FF7A45] to-[#FFB238] px-5 py-2.5 text-sm font-semibold"
          >
            Retry upload
          </button>
        )}
        {insertFailed && (
          <button
            onClick={onRetryPost}
            className="rounded-full bg-gradient-to-r from-[#FF7A45] to-[#FFB238] px-5 py-2.5 text-sm font-semibold"
          >
            Retry
          </button>
        )}
        <button
          onClick={onCancel}
          className="rounded-full bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CreateSmileMoment({ user, onCreated, onOpenChange, renderTrigger }) {
  const [open, setOpenState] = useState(false);
  // Wrapper so every place in this file that opens/closes the modal
  // also notifies a parent that wants to know (e.g. StoryViewer
  // gating its story-advance timer while this is up).
  const setOpen = useCallback(
    (next) => {
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  const [step, setStep] = useState("select"); // select | trim | edit | uploading
  const [type, setType] = useState(null); // image | video | text
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // Holds the raw picked video while the trim step is up. Kept
  // separate from `file` so the editor's `file` only ever points at
  // something upload-ready (original image/video, or a trimmed clip).
  const [sourceVideoFile, setSourceVideoFile] = useState(null);

  const [caption, setCaption] = useState("");
  const [bgGradient, setBgGradient] = useState(BG_GRADIENTS[0]);
  const [track, setTrack] = useState(null);
  const [durationHours, setDurationHours] = useState(24);

  const [moodTag, setMoodTag] = useState(null);

  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["Yes", "No"]);

  const [activeTool, setActiveTool] = useState(null); // null | music | mood | poll | time
  const [musicSearch, setMusicSearch] = useState("");
  const [musicTab, setMusicTab] = useState("trending"); // trending | saved
  const [savedTracks, setSavedTracks] = useState(() => new Map());
  const [playingId, setPlayingId] = useState(null);

  const [trendingTracks, setTrendingTracks] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [error, setError] = useState(null);
  const [pickingVideo, setPickingVideo] = useState(false); // reading duration before we know select vs trim

  // True once an upload has finished but the smile_moments insert
  // that follows it has failed — distinct from an upload failure so
  // the UI can offer "retry post" without re-uploading the file.
  const [insertFailed, setInsertFailed] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioPreviewRef = useRef(null);

  // Storage path the current upload was (or is being) sent to. Set
  // once, right before upload.start(), so finalizeMoment reads back
  // the exact same object path instead of recomputing a fresh
  // Date.now() that could point at a different (non-existent) object.
  const uploadPathRef = useRef(null);
  // Guards finalizeMoment against double-firing (e.g. StrictMode's
  // double-invoke, or the done-effect re-running).
  const finalizedRef = useRef(false);
  // Snapshot of every field the insert needs, taken at the moment
  // publish() is called — so edits made while an upload is mid-flight
  // (user keeps typing the caption, say) can't leak into the moment
  // that eventually gets posted.
  const publishSnapshotRef = useRef(null);

  const upload = useResumableUpload();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      audioPreviewRef.current?.pause();
    };
  }, [previewUrl]);

  // If this component un-mounts mid-upload (parent stops rendering
  // it), abort the in-flight transfer rather than leaving an orphaned
  // XHR running. Safe to call even when nothing is in flight — pause()
  // no-ops if there's no active upload instance.
  useEffect(() => {
    return () => upload.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load trending songs the first time the music panel is opened.
  useEffect(() => {
    if (activeTool !== "music" || trendingTracks.length > 0 || trendingLoading) return;
    setTrendingLoading(true);
    setTrendingError(null);
    fetchTrendingTracks()
      .then(setTrendingTracks)
      .catch((err) => {
        console.error("Trending music failed:", err);
        setTrendingError("Couldn't load trending songs. Try searching instead.");
      })
      .finally(() => setTrendingLoading(false));
  }, [activeTool, trendingTracks.length, trendingLoading]);

  // Debounced live search against iTunes as the user types.
  useEffect(() => {
    const term = musicSearch.trim();
    if (!term) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    const t = setTimeout(() => {
      searchItunesTracks(term)
        .then((res) => {
          setSearchResults(res);
          if (res.length === 0) setSearchError("No songs found for that search");
        })
        .catch((err) => {
          console.error("Music search failed:", err);
          setSearchError("Couldn't search songs right now");
        })
        .finally(() => setSearchLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [musicSearch]);

  const resetAndClose = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    audioPreviewRef.current?.pause();
    audioPreviewRef.current = null;
    setOpen(false);
    setStep("select");
    setType(null);
    setFile(null);
    setPreviewUrl(null);
    setSourceVideoFile(null);
    setCaption("");
    setBgGradient(BG_GRADIENTS[0]);
    setTrack(null);
    setDurationHours(24);
    setMoodTag(null);
    setPollEnabled(false);
    setPollQuestion("");
    setPollOptions(["Yes", "No"]);
    setActiveTool(null);
    setMusicSearch("");
    setMusicTab("trending");
    setPlayingId(null);
    setError(null);
    setPickingVideo(false);
    setInsertFailed(false);
    upload.reset();
    uploadPathRef.current = null;
    finalizedRef.current = false;
    publishSnapshotRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl, setOpen]);

  const pickFile = (kind) => {
    setError(null);
    if (kind === "image") imageInputRef.current?.click();
    if (kind === "video") videoInputRef.current?.click();
    if (kind === "text") {
      setType("text");
      setStep("edit");
    }
  };

  const onImageChosen = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError(null);

    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_MB) {
      setError(`Image must be under ${MAX_IMAGE_MB}MB`);
      return;
    }

    setType("image");
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setStep("edit");
  };

  const onVideoChosen = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError(null);
    setType("video");
    setPickingVideo(true);

    let duration;
    try {
      duration = await getVideoDuration(f);
    } catch (err) {
      console.error("Couldn't read video metadata:", err);
      setPickingVideo(false);
      setError("Couldn't read that video. Try a different file.");
      return;
    }
    setPickingVideo(false);

    if (duration > MAX_VIDEO_SECONDS) {
      // Route through the trimmer rather than rejecting outright, and
      // skip the MAX_VIDEO_MB size check here — trimming re-encodes
      // to a shorter clip that's almost always smaller than the
      // source, so checking the untrimmed file's size would reject
      // videos that are about to shrink anyway. VideoTrimmer enforces
      // its own size cap on the exported clip.
      setSourceVideoFile(f);
      setStep("trim");
      return;
    }

    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_MB) {
      setError(`Video must be under ${MAX_VIDEO_MB}MB`);
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setStep("edit");
  };

  // Fires when the user taps "Use clip" inside VideoTrimmer. This now
  // publishes immediately instead of routing back through the
  // caption/music/poll editor — trimming a video *is* the share
  // action for that flow, so "Use clip" should go straight to
  // uploading/posting, not dump the user back on another screen where
  // they have to tap Share a second time.
  //
  // We still update `file`/`previewUrl` state (kept in sync in case
  // the upload fails and the editor is shown again via
  // handleCancelUpload), but we pass `blob` directly into publish()
  // rather than relying on that state read-back, because the state
  // set here hasn't committed yet on this render pass — reading
  // `file` inside publish() at this point would still see the
  // *previous* value (or null, on the very first trim).
  const handleTrimConfirm = (blob) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setSourceVideoFile(null);
    publish(blob);
  };

  const handleTrimCancel = () => {
    setSourceVideoFile(null);
    setType(null);
    setStep("select");
  };

  // ----------------------------
  // MUSIC PANEL ACTIONS
  // ----------------------------
  const togglePlay = (t) => {
    if (playingId === t.id) {
      audioPreviewRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioPreviewRef.current?.pause();
    const audio = new Audio(t.url);
    audio.volume = 0.6;
    audio.onended = () => setPlayingId(null);
    audio.play().catch(() => {});
    audioPreviewRef.current = audio;
    setPlayingId(t.id);
  };

  const toggleSaved = (t) => {
    setSavedTracks((prev) => {
      const next = new Map(prev);
      if (next.has(t.id)) next.delete(t.id);
      else next.set(t.id, t);
      return next;
    });
  };

  const chooseTrack = (t) => {
    setTrack((cur) => (cur?.id === t.id ? null : t));
  };

  const searching = musicSearch.trim().length > 0;
  const activeTracks = searching
    ? searchResults
    : musicTab === "saved"
    ? Array.from(savedTracks.values())
    : trendingTracks;
  const activeLoading = searching ? searchLoading : musicTab === "trending" ? trendingLoading : false;
  const activeError = searching ? searchError : musicTab === "trending" ? trendingError : null;
  const activeLabel = searching
    ? `Results for "${musicSearch.trim()}"`
    : musicTab === "saved"
    ? "Saved tracks"
    : "Trending now";

  const retryTrending = () => {
    setTrendingTracks([]);
    setTrendingError(null);
  };

  // ----------------------------
  // POLL PANEL ACTIONS
  // ----------------------------
  const updatePollOption = (idx, value) => {
    setPollOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));
  };

  // ----------------------------
  // PUBLISH — upload (resumable, if there's media) then insert the row
  // ----------------------------

  // Builds and inserts the smile_moments row from the snapshot taken
  // when publish() was called, plus whatever media_url the upload
  // (if any) landed at. Safe to call more than once: finalizedRef
  // guards re-entry, and a failed insert clears the guard so
  // retryInsert can call it again without re-uploading anything.
  const finalizeMoment = useCallback(async () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    setError(null);

    const snap = publishSnapshotRef.current;
    if (!user || !snap) {
      finalizedRef.current = false;
      return;
    }

    try {
      let media_url = null;
      if (uploadPathRef.current) {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadPathRef.current);
        media_url = data.publicUrl;
      }

      const payload = {
        user_id: user.id,
        caption: snap.caption || null,
        media_url,
        media_type: snap.type,
        music_url: snap.track?.url || null,
        music_title: snap.track ? `${snap.track.title} — ${snap.track.artist}` : null,
        music_artwork: snap.track?.artwork || null,
        bg_gradient: snap.type === "text" ? snap.bgGradient : null,
        mood_tag: snap.moodTag ? `${snap.moodTag.emoji} ${snap.moodTag.label}` : null,
        views_count: 0,
        reactions_count: 0,
        poll:
          snap.pollEnabled && snap.pollQuestion
            ? {
                question: snap.pollQuestion,
                options: snap.pollOptions.map((o) => ({
                  text: o.trim() || "Option",
                  votes: 0,
                })),
              }
            : null,
        expires_at: new Date(Date.now() + snap.durationHours * 60 * 60 * 1000).toISOString(),
      };

      const { data: inserted, error: insertError } = await supabase
        .from("smile_moments")
        .insert(payload)
        .select("*, profiles:user_id(username, avatar_url)")
        .single();

      if (insertError) throw insertError;

      audioPreviewRef.current?.pause();
      onCreated?.(inserted);
      resetAndClose();
    } catch (err) {
      console.error("Smile moment publish failed:", err);
      const msg =
        err?.message ||
        err?.error_description ||
        "Couldn't finish posting your smile moment. Try again.";
      setError(msg);
      setInsertFailed(true);
      // Allow retryInsert to call this again — the file (if any) is
      // already uploaded, so a retry only re-attempts the row insert.
      finalizedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, onCreated, resetAndClose]);

  // Fires exactly once when the resumable upload reports success — as
  // an effect, not inline during an event handler, so it can't
  // double-fire under StrictMode's double-invoke or an unrelated
  // re-render. finalizeMoment's own deps are stable ([user, onCreated,
  // resetAndClose]) so this only re-runs on a real status change.
  useEffect(() => {
    if (upload.status === "done" && !finalizedRef.current) {
      finalizeMoment();
    }
  }, [upload.status, finalizeMoment]);

  // `fileOverride` lets callers (namely handleTrimConfirm) hand publish
  // a freshly-created Blob directly, bypassing the `file` state read —
  // necessary because that state hasn't committed yet on the same
  // render pass it's set on. The Share buttons further down still call
  // this as a plain onClick={publish} handler, which means React will
  // pass the click SyntheticEvent as the first argument; the
  // `instanceof Blob` check below is what keeps that from being
  // mistaken for a real file.
  const publish = async (fileOverride) => {
    if (!user || step === "uploading") return;

    const activeFile = fileOverride instanceof Blob ? fileOverride : file;

    if (type === "text" && !caption.trim()) {
      setError("Add some text to your smile moment");
      return;
    }
    if (pollEnabled && !pollQuestion.trim()) {
      setError("Add a question for your poll, or turn it off");
      return;
    }

    setError(null);
    setInsertFailed(false);
    finalizedRef.current = false;

    publishSnapshotRef.current = {
      caption: caption.trim(),
      type,
      track,
      bgGradient,
      moodTag,
      pollEnabled,
      pollQuestion: pollQuestion.trim(),
      pollOptions,
      durationHours,
    };

    setStep("uploading");

    if (!activeFile) {
      // Text moment — nothing to upload, go straight to the insert.
      uploadPathRef.current = null;
      finalizeMoment();
      return;
    }

    // `activeFile` is either a File (image / untrimmed video, has
    // .name) or a Blob produced by VideoTrimmer (no .name — video/mp4
    // from the fast export path, or video/webm from the
    // MediaRecorder fallback). Fall back to a generated name with the
    // right extension in the Blob case.
    const rawName =
      activeFile.name || `clip-${Date.now()}.${extensionForBlobType(activeFile.type)}`;
    const safeName = rawName.replace(/\s+/g, "_");
    const fileName = `${user.id}/${Date.now()}-${safeName}`;
    uploadPathRef.current = fileName;

    await upload.start({
      file: activeFile,
      bucket: STORAGE_BUCKET,
      path: fileName,
      contentType: activeFile.type || (type === "video" ? "video/mp4" : undefined),
    });
  };

  const retryInsert = useCallback(() => {
    setInsertFailed(false);
    setError(null);
    finalizedRef.current = false;
    finalizeMoment();
  }, [finalizeMoment]);

  const handleCancelUpload = useCallback(() => {
    upload.pause();
    upload.reset();
    uploadPathRef.current = null;
    finalizedRef.current = false;
    publishSnapshotRef.current = null;
    setInsertFailed(false);
    setError(null);
    setStep("edit");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollOptionCountValid = pollOptions.filter((o) => o.trim()).length >= 2;

  const ToolButton = ({ toolKey, icon, label, compact }) => (
    <button
      onClick={() => setActiveTool((cur) => (cur === toolKey ? null : toolKey))}
      className={
        compact
          ? `flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[11px] shrink-0 ${
              activeTool === toolKey ? "text-[#FF9457]" : "text-slate-300"
            }`
          : `flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition ${
              activeTool === toolKey
                ? "bg-gradient-to-r from-[#FF7A45]/20 to-[#FFB238]/20 text-[#FF9457]"
                : "text-slate-200 hover:bg-white/5"
            }`
      }
    >
      <span
        className={`${compact ? "w-11 h-11" : "w-9 h-9"} rounded-full flex items-center justify-center text-base ${
          activeTool === toolKey
            ? "bg-gradient-to-br from-[#FF7A45] to-[#FFB238] text-white"
            : "bg-white/10"
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  );

  const TrackRow = ({ t }) => (
    <div
      onClick={() => chooseTrack(t)}
      className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer ${
        track?.id === t.id ? "bg-gradient-to-r from-[#FF7A45]/20 to-[#FFB238]/20" : "hover:bg-white/5"
      }`}
    >
      {t.artwork ? (
        <img src={t.artwork} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm shrink-0">
          🎵
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{t.title}</p>
        <p className="text-xs text-slate-400 truncate">{t.artist}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleSaved(t);
        }}
        className={`text-sm px-1 ${savedTracks.has(t.id) ? "text-[#FFB238]" : "text-slate-400"}`}
        title="Save"
      >
        🔖
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay(t);
        }}
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs shrink-0"
        title="Preview 30s"
      >
        {playingId === t.id ? (
          <span className="flex items-end gap-[2px] h-3">
            <span className="w-[2px] bg-[#FFB238] eq-bar" style={{ animationDelay: "0s" }} />
            <span className="w-[2px] bg-[#FFB238] eq-bar" style={{ animationDelay: "0.2s" }} />
            <span className="w-[2px] bg-[#FFB238] eq-bar" style={{ animationDelay: "0.4s" }} />
          </span>
        ) : (
          "▶"
        )}
      </button>
    </div>
  );

  const musicPanelBody = (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center bg-white/5 rounded-full px-3 py-2">
          <span className="text-slate-400 mr-2">🔍</span>
          <input
            value={musicSearch}
            onChange={(e) => setMusicSearch(e.target.value)}
            placeholder="Search any song or artist"
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <button
          onClick={() => setActiveTool(null)}
          className="text-slate-400 hover:text-white text-lg px-1 hidden lg:block"
        >
          ✕
        </button>
      </div>

      {!searching && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMusicTab("trending")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              musicTab === "trending"
                ? "bg-gradient-to-r from-[#FF7A45] to-[#FFB238] text-white"
                : "bg-white/5 text-slate-300"
            }`}
          >
            📈 Trending
          </button>
          <button
            onClick={() => setMusicTab("saved")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              musicTab === "saved"
                ? "bg-gradient-to-r from-[#FF7A45] to-[#FFB238] text-white"
                : "bg-white/5 text-slate-300"
            }`}
          >
            🔖 Saved
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 mb-2">{activeLabel}</p>

      <div className="flex-1 overflow-y-auto space-y-1 -mx-1 min-h-[120px]">
        {activeLoading && (
          <p className="text-xs text-slate-500 px-1 py-4 text-center">Loading songs…</p>
        )}
        {!activeLoading && activeError && (
          <div className="text-center py-4">
            <p className="text-xs text-red-400 mb-2">{activeError}</p>
            {!searching && musicTab === "trending" && (
              <button
                onClick={retryTrending}
                className="text-xs text-[#FF9457] underline underline-offset-2"
              >
                Retry
              </button>
            )}
          </div>
        )}
        {!activeLoading && !activeError && activeTracks.length === 0 && (
          <p className="text-xs text-slate-500 px-1 py-4 text-center">
            {searching
              ? "No songs found"
              : musicTab === "saved"
              ? "No saved tracks yet"
              : "No trending songs right now"}
          </p>
        )}
        {!activeLoading && activeTracks.map((t) => <TrackRow key={t.id} t={t} />)}
      </div>
    </>
  );

  const moodPanelBody = (
    <div className="grid grid-cols-2 gap-2">
      {MOOD_TAGS.map((m) => (
        <button
          key={m.label}
          onClick={() => setMoodTag((cur) => (cur?.label === m.label ? null : m))}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${
            moodTag?.label === m.label
              ? "bg-gradient-to-r from-[#FF7A45]/20 to-[#FFB238]/20 text-[#FF9457] ring-1 ring-[#FF7A45]"
              : "bg-white/5 hover:bg-white/10 text-slate-200"
          }`}
        >
          <span className="text-lg">{m.emoji}</span>
          {m.label}
        </button>
      ))}
    </div>
  );

  const pollPanelBody = (
    <>
      <label className="flex items-center justify-between mb-4 cursor-pointer">
        <span className="text-sm text-slate-300">Add a poll</span>
        <button
          onClick={() => setPollEnabled((v) => !v)}
          className={`w-11 h-6 rounded-full relative transition ${
            pollEnabled ? "bg-gradient-to-r from-[#FF7A45] to-[#FFB238]" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
              pollEnabled ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </label>

      {pollEnabled && (
        <div className="space-y-3">
          <input
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Ask a question..."
            maxLength={80}
            className="w-full bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none"
          />
          {pollOptions.map((opt, i) => (
            <input
              key={i}
              value={opt}
              onChange={(e) => updatePollOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              maxLength={30}
              className="w-full bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none"
            />
          ))}
          {!pollOptionCountValid && (
            <p className="text-xs text-slate-400">Add at least 2 options.</p>
          )}
        </div>
      )}
    </>
  );

  const timePanelBody = (
    <div className="space-y-1">
      {DURATIONS.map((d) => (
        <button
          key={d.hours}
          onClick={() => {
            setDurationHours(d.hours);
            setActiveTool(null);
          }}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm ${
            durationHours === d.hours
              ? "bg-gradient-to-r from-[#FF7A45]/20 to-[#FFB238]/20 text-[#FF9457]"
              : "hover:bg-white/5 text-slate-200"
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );

  const panelTitle =
    activeTool === "music"
      ? null // music panel has its own search bar as header
      : activeTool === "mood"
      ? "What's the vibe?"
      : activeTool === "poll"
      ? "Ask your friends"
      : activeTool === "time"
      ? "Visible for"
      : "";

  const panelBody =
    activeTool === "music"
      ? musicPanelBody
      : activeTool === "mood"
      ? moodPanelBody
      : activeTool === "poll"
      ? pollPanelBody
      : activeTool === "time"
      ? timePanelBody
      : null;

  return (
    <>
      <style>{`
        @keyframes vibe-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(255,122,69,0.55); }
          70% { box-shadow: 0 0 0 10px rgba(255,122,69,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,122,69,0); }
        }
        .vibe-pulse { animation: vibe-pulse-ring 2.4s infinite; }
        @keyframes eq-bar {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        .eq-bar { animation: eq-bar 0.9s ease-in-out infinite; }
      `}</style>

      {/* TRIGGER — default big FAB, or a custom one (e.g. a compact
          header icon) when the caller supplies renderTrigger. */}
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="min-w-[80px] flex flex-col items-center gap-1 shrink-0"
        >
          <div className="vibe-pulse w-16 h-16 rounded-full border-2 border-dashed border-[#FF7A45] bg-gradient-to-br from-[#FF7A45]/10 to-[#FFB238]/10 flex items-center justify-center text-[#FF9457] text-2xl">
            +
          </div>
          <span className="text-xs text-white truncate w-16">Your Vibe</span>
        </button>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageChosen}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onVideoChosen}
      />

      {open && (
        <div className="fixed inset-0 bg-[#0B1220] z-[60] flex flex-col text-white overflow-hidden">
          {/* -------- STEP 1: TYPE SELECT -------- */}
          {step === "select" && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between p-4 shrink-0">
                <button onClick={resetAndClose} className="text-xl">✕</button>
                <p className="font-semibold">New smile moment</p>
                <div className="w-6" />
              </div>
              {error && <p className="text-center text-red-400 text-sm px-4">{error}</p>}
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
                <button
                  onClick={() => pickFile("image")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-8 py-4 w-full max-w-xs"
                >
                  📷 Photo
                </button>
                <button
                  onClick={() => pickFile("video")}
                  disabled={pickingVideo}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-8 py-4 w-full max-w-xs disabled:opacity-50"
                >
                  {pickingVideo ? "Checking video…" : "🎬 Video"}
                </button>
                <button
                  onClick={() => pickFile("text")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-8 py-4 w-full max-w-xs"
                >
                  💬 Text
                </button>
              </div>
            </div>
          )}

          {/* -------- STEP 1.5: TRIM (only when the picked video is over MAX_VIDEO_SECONDS) -------- */}
          {step === "trim" && sourceVideoFile && (
            <VideoTrimmer
              file={sourceVideoFile}
              maxDurationSeconds={MAX_VIDEO_SECONDS}
              maxFileSizeBytes={MAX_VIDEO_MB * 1024 * 1024}
              onConfirm={handleTrimConfirm}
              onCancel={handleTrimCancel}
            />
          )}

          {/* -------- STEP 2: EDITOR -------- */}
          {step === "edit" && (
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
              {/* MOBILE TOP BAR */}
              <div className="lg:hidden flex items-center justify-between p-3 border-b border-white/10 shrink-0">
                <button onClick={resetAndClose} className="text-xl">✕</button>
                <p className="font-semibold text-sm">Smile moment</p>
                <button
                  onClick={publish}
                  className="bg-gradient-to-r from-[#FF7A45] to-[#FFB238] rounded-full px-4 py-1.5 text-xs font-semibold"
                >
                  Share
                </button>
              </div>
              {error && (
                <p className="lg:hidden text-center text-red-400 text-xs px-4 pt-2">{error}</p>
              )}

              {/* DESKTOP LEFT RAIL */}
              <div className="hidden lg:flex w-72 bg-[#0F1729] border-r border-white/10 p-5 flex-col shrink-0">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={resetAndClose} className="text-xl">✕</button>
                  <h2 className="font-semibold text-lg">Your smile moment</h2>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  {user?.avatar_url && (
                    <img src={user.avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" />
                  )}
                  <span className="text-sm font-medium">{user?.username || "You"}</span>
                </div>

                <div className="space-y-1">
                  <ToolButton toolKey="music" icon="🎵" label="Add music" />
                  <ToolButton toolKey="mood" icon="🙂" label="Add mood" />
                  <ToolButton toolKey="poll" icon="📊" label="Add poll" />
                  <ToolButton toolKey="time" icon="⏱" label="Add time" />
                </div>

                {type === "video" && (
                  <button
                    onClick={() => {
                      // Re-open the trimmer against the file currently
                      // loaded in the editor. Works whether that file
                      // is the original (untrimmed, <= MAX_VIDEO_SECONDS)
                      // clip or an already-trimmed one — VideoTrimmer
                      // just reads whatever Blob/File it's given.
                      setSourceVideoFile(file);
                      setStep("trim");
                    }}
                    className="mt-4 flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/5 transition"
                  >
                    <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-base">
                      ✂️
                    </span>
                    Re-trim video
                  </button>
                )}

                {track && (
                  <div className="mt-4 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
                    <span className="text-[#FFB238]">🎵</span>
                    <span className="truncate flex-1">
                      {track.title} — {track.artist}
                    </span>
                    <button onClick={() => setTrack(null)} className="text-slate-400 hover:text-white">
                      ✕
                    </button>
                  </div>
                )}

                {moodTag && (
                  <div className="mt-2 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
                    <span>{moodTag.emoji}</span>
                    <span className="truncate flex-1">{moodTag.label}</span>
                    <button onClick={() => setMoodTag(null)} className="text-slate-400 hover:text-white">
                      ✕
                    </button>
                  </div>
                )}

                {pollEnabled && pollQuestion.trim() && (
                  <div className="mt-2 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
                    <span>📊</span>
                    <span className="truncate flex-1">{pollQuestion.trim()}</span>
                    <button onClick={() => setPollEnabled(false)} className="text-slate-400 hover:text-white">
                      ✕
                    </button>
                  </div>
                )}

                {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    onClick={resetAndClose}
                    className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2.5 text-sm font-medium"
                  >
                    Discard
                  </button>
                  <button
                    onClick={publish}
                    className="flex-1 bg-gradient-to-r from-[#FF7A45] to-[#FFB238] hover:opacity-90 rounded-lg py-2.5 text-sm font-semibold"
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* CENTER PREVIEW */}
              <div className="flex-1 flex flex-col items-center justify-center bg-[#0B1220] relative p-4 lg:p-6 min-h-0 overflow-y-auto">
                <div
                  className={`relative w-full max-w-[380px] aspect-[9/16] rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ${
                    type === "text" ? `bg-gradient-to-br ${bgGradient}` : "bg-[#111A2C]"
                  }`}
                >
                  {type === "image" && previewUrl && (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                  )}
                  {type === "video" && previewUrl && (
                    <video src={previewUrl} className="w-full h-full object-cover" controls muted />
                  )}
                  {type === "text" && (
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Type something that'll make someone smile..."
                      maxLength={200}
                      className="bg-transparent text-white text-2xl font-semibold text-center w-4/5 h-1/2 resize-none outline-none placeholder-white/60"
                    />
                  )}

                  {type !== "text" && (
                    <input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption..."
                      maxLength={150}
                      className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur px-3 py-2 rounded-lg text-white outline-none text-sm"
                    />
                  )}

                  {track && (
                    <div className="absolute top-3 left-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-xs">
                      🎵 <span className="truncate">{track.title} — {track.artist}</span>
                    </div>
                  )}

                  {moodTag && (
                    <div
                      className="absolute top-3 right-3 bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-xs"
                      style={track ? { top: "2.75rem" } : undefined}
                    >
                      {moodTag.emoji} {moodTag.label}
                    </div>
                  )}

                  {pollEnabled && pollQuestion.trim() && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-20 w-4/5 bg-black/60 backdrop-blur rounded-xl p-3 text-center">
                      <p className="text-sm font-medium mb-2">{pollQuestion.trim()}</p>
                      <div className="flex gap-2">
                        {pollOptions.map((opt, i) => (
                          <div key={i} className="flex-1 bg-white/10 rounded-full py-1.5 text-xs truncate px-2">
                            {opt.trim() || `Option ${i + 1}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Background picker — only for text moments, always visible */}
                {type === "text" && (
                  <div className="flex gap-2 justify-center py-4 shrink-0">
                    {BG_GRADIENTS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setBgGradient(g)}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} ${
                          bgGradient === g ? "ring-2 ring-white" : ""
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Mobile-only re-trim entry point (desktop has it in the left rail) */}
                {type === "video" && (
                  <button
                    onClick={() => {
                      setSourceVideoFile(file);
                      setStep("trim");
                    }}
                    className="lg:hidden text-xs text-[#FF9457] font-semibold py-2"
                  >
                    ✂️ Re-trim video
                  </button>
                )}
              </div>

              {/* DESKTOP RIGHT PANEL */}
              {activeTool && (
                <div className="hidden lg:flex w-96 bg-[#0F1729] border-l border-white/10 p-4 flex-col shrink-0">
                  {panelTitle && (
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold text-sm">{panelTitle}</p>
                      <button
                        onClick={() => setActiveTool(null)}
                        className="text-slate-400 hover:text-white text-lg"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {panelBody}
                </div>
              )}

              {/* MOBILE BOTTOM TOOLBAR */}
              <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-white/10 shrink-0 bg-[#0F1729]">
                <ToolButton toolKey="music" icon="🎵" label="Music" compact />
                <ToolButton toolKey="mood" icon="🙂" label="Mood" compact />
                <ToolButton toolKey="poll" icon="📊" label="Poll" compact />
                <ToolButton toolKey="time" icon="⏱" label="Time" compact />
              </div>

              {/* MOBILE BOTTOM SHEET */}
              {activeTool && (
                <div
                  className="lg:hidden fixed inset-x-0 bottom-0 z-10 max-h-[75vh] bg-[#0F1729] border-t border-white/10 rounded-t-3xl p-4 flex flex-col"
                  style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                >
                  <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 shrink-0" />
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <p className="font-semibold text-sm">{panelTitle || "Add music"}</p>
                    <button
                      onClick={() => setActiveTool(null)}
                      className="text-slate-400 hover:text-white text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">{panelBody}</div>
                </div>
              )}
            </div>
          )}

          {/* -------- STEP 3: UPLOADING / POSTING -------- */}
          {step === "uploading" && (
            <UploadStatusPanel
              hasMedia={!!uploadPathRef.current}
              uploadStatus={upload.status}
              progress={upload.progress}
              uploadError={upload.error}
              insertFailed={insertFailed}
              insertError={error}
              onPause={upload.pause}
              onResume={upload.resume}
              onRetryUpload={upload.retry}
              onRetryPost={retryInsert}
              onCancel={handleCancelUpload}
            />
          )}
        </div>
      )}
    </>
  );
}