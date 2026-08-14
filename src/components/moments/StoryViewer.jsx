// C:\code\KeshApp\VibeHub\src\components\moments\StoryViewer.jsx

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import ViewersSheet from "./ViewersSheet";
import CreateSmileMoment from "./CreateSmileMoment";
import { useStoryPlayer } from "./hooks/useStoryPlayer";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useViewTracker } from "./hooks/useViewTracker";
import { useLiveViewCount } from "./hooks/useLiveViewCount";
import { groupMomentsIntoStories, flatIndexToCoords } from "./utils/groupStories";
import { MAX_VIDEO_SECONDS } from "./momentLimits";

const REACTIONS = ["😄", "❤️", "🔥", "😮", "👏"];
const SWIPE_THRESHOLD = 50;
const REPLY_MAX_LENGTH = 500;
const TOAST_DEFAULT_MS = 1500;

function timeAgo(dateStr) {
  const diffMs = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// Largest-remainder rounding: computing each option's percentage with
// an independent Math.round can land on totals like 33/33/33 = 99%,
// which reads as a broken poll. This distributes the leftover points
// to whichever options have the largest fractional remainder so the
// displayed percentages always sum to exactly 100 once there's at
// least one vote.
function computePollPercentages(options) {
  const votes = options.map((o) => o.votes || 0);
  const total = votes.reduce((sum, v) => sum + v, 0);
  if (total === 0) return options.map(() => 0);

  const raw = votes.map((v) => (v / total) * 100);
  const floors = raw.map(Math.floor);
  const remainder = 100 - floors.reduce((sum, v) => sum + v, 0);
  const byRemainder = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floors];
  for (let k = 0; k < remainder; k++) {
    result[byRemainder[k % byRemainder.length].i] += 1;
  }
  return result;
}

// Best-effort parse of a Supabase public storage URL into
// { bucket, path }. Works for public buckets only — if your bucket
// is private and media_url is a signed URL instead, store the
// bucket/path explicitly as columns on smile_moments at upload time
// and use those directly here instead of parsing the URL. Module-level
// since it depends on nothing from the component — no reason to
// redefine it on every render.
function extractStoragePath(mediaUrl) {
  if (!mediaUrl) return null;
  const marker = "/storage/v1/object/public/";
  const idx = mediaUrl.indexOf(marker);
  if (idx === -1) return null;
  const rest = mediaUrl.slice(idx + marker.length); // "<bucket>/<path...>"
  const slashIdx = rest.indexOf("/");
  if (slashIdx === -1) return null;
  return {
    bucket: decodeURIComponent(rest.slice(0, slashIdx)),
    path: decodeURIComponent(rest.slice(slashIdx + 1)),
  };
}

export default function StoryViewer({
  moments,
  startIndex = 0,
  user,
  onClose,
  onMomentViewed,
  onMomentPosted, // called after CreateSmileMoment successfully posts a moment from inside the viewer — wire this to your feed's refetch (e.g. refetchMoments)
  onMomentDeleted, // called after a moment is successfully deleted — wire this to remove it from your feed's local state
}) {
  // ---------------------------------------------------------------
  // GROUPING — flat moments in, per-user stories out. `moments` prop
  // stays flat so existing callers (feed grid, notification links)
  // don't need to change; this component owns the grouping.
  // ---------------------------------------------------------------
  const stories = useMemo(() => groupMomentsIntoStories(moments), [moments]);
  const initialCoords = useMemo(
    () => flatIndexToCoords(stories, startIndex, moments),
    // Only compute once on mount — stories/startIndex are stable for
    // the lifetime of a single viewer session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [exiting, setExiting] = useState(false);
  const closeTimeoutRef = useRef(null);
  const handleClose = useCallback(() => {
    setExiting(true);
    closeTimeoutRef.current = setTimeout(onClose, 180);
  }, [onClose]);

  // If every moment in the viewer disappears out from under us (all
  // expired / deleted while open, or an empty initial set), fall back
  // to closing instead of rendering a blank/crashing modal.
  useEffect(() => {
    if (stories.length === 0) handleClose();
  }, [stories.length, handleClose]);

  // Lock background scroll while the modal is open; restore on exit.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Clear any in-flight close timer on unmount so it never fires
  // against an already-unmounted parent.
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // ---------------------------------------------------------------
  // OPTIMISTIC VIEW COUNTS — local overlay on top of moment.views_count,
  // keyed by moment id so it survives navigating back and forth without
  // re-incrementing (useViewTracker's Set already prevents duplicate
  // network calls; this map just drives the UI number).
  // ---------------------------------------------------------------
  const [viewBumps, setViewBumps] = useState({});
  const { recordView } = useViewTracker({
    userId: user?.id,
    onOptimisticView: (momentId) => {
      setViewBumps((prev) => ({
        ...prev,
        [momentId]: (prev[momentId] || 0) + 1,
      }));
      onMomentViewed?.(momentId);
    },
  });

  const player = useStoryPlayer({
    stories,
    initialStoryIndex: initialCoords.storyIndex,
    initialMomentIndex: initialCoords.momentIndex,
    onExit: handleClose,
    onMomentChange: (moment) => recordView(moment),
  });

  const {
    activeStory,
    activeMoment,
    activeStoryIndex,
    activeMomentIndex,
    progress,
    paused,
    direction,
    goNext,
    goPrev,
    togglePause,
    setGate,
    reportVideoProgress,
  } = player;

  const isOwn = user && activeMoment && activeMoment.user_id === user.id;

  // ---------------------------------------------------------------
  // LIVE VIEW COUNT (owner only) — fetches exact count on open and
  // subscribes to realtime inserts so the number ticks while viewing.
  // ---------------------------------------------------------------
  const liveViews = useLiveViewCount(
    activeMoment?.id,
    activeMoment?.views_count || 0,
    { enabled: !!isOwn }
  );
  const displayViews = isOwn
    ? liveViews
    : (activeMoment?.views_count || 0) + (viewBumps[activeMoment?.id] || 0);

  // ---------------------------------------------------------------
  // AUDIO / MUTE
  // ---------------------------------------------------------------
  const [muted, setMuted] = useState(false);
  useAudioPlayer({ moment: activeMoment, muted, paused });

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  // Single source of truth for driving the <video> element: mute,
  // pause, and play all live here so there's exactly one place that
  // decides playback state instead of two effects racing each other.
  // Also handles the case where the browser blocks autoplay-with-sound
  // (common on first load before any user gesture) — instead of
  // silently freezing on the first frame, we retry muted and flip the
  // UI's mute indicator to match reality.
  const videoRef = useRef(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (paused) {
      v.pause();
      return;
    }
    const playPromise = v.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        if (!muted) {
          v.muted = true;
          setMuted(true);
          v.play().catch(() => {});
        }
      });
    }
  }, [paused, muted, activeMoment?.id]);

  // ---------------------------------------------------------------
  // POLL / REACTIONS / REPLY / DELETE
  // ---------------------------------------------------------------
  const [myVote, setMyVote] = useState(null);
  const [pollState, setPollState] = useState(null);
  const [voting, setVoting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false); // tracks CreateSmileMoment's modal so we can gate the story timer
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reactionSummary, setReactionSummary] = useState({
    total: 0,
    topEmojis: [],
  });
  const [myReaction, setMyReaction] = useState(null);
  const [mediaError, setMediaError] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);

  // Toast helper — clears any pending dismiss before scheduling a new
  // one so two toasts fired in quick succession can't race and leave
  // the second one dismissed early (or the first stuck forever).
  const toastTimeoutRef = useRef(null);
  const showToast = useCallback((message, duration = TOAST_DEFAULT_MS) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  // Track every floating-reaction removal timer so we can clear them
  // all on unmount instead of leaking timers that fire against a
  // gone component.
  const floatingTimeoutsRef = useRef(new Set());
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      floatingTimeoutsRef.current.forEach(clearTimeout);
      floatingTimeoutsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const poll = activeMoment?.poll || null;
    setPollState(poll);
    // If the poll payload tracks who voted for what (poll.voters as a
    // { [userId]: optionIndex } map), adopt it so re-opening a poll
    // you already voted on shows results instead of an open ballot.
    // No-op if the field isn't present in your schema.
    setMyVote(
      user && poll?.voters && poll.voters[user.id] !== undefined
        ? poll.voters[user.id]
        : null
    );
    setViewersOpen(false);
    setConfirmDeleteOpen(false);
    setMediaError(false);
    setMediaLoading(true);
    setRetryToken(0);
  }, [activeMoment?.id, user]);

  // Gate the story's auto-advance timer while the viewers sheet, the
  // add-moment composer, OR the delete confirmation is open — any of
  // these being open means the person is doing something other than
  // watching, so the countdown shouldn't keep running underneath them.
  // Without confirmDeleteOpen here, a story could auto-advance to a
  // DIFFERENT moment while someone is still deciding whether to delete
  // the current one — tapping "Delete" would then remove the wrong
  // moment out from under them.
  useEffect(() => {
    setGate(viewersOpen || composerOpen || confirmDeleteOpen);
  }, [viewersOpen, composerOpen, confirmDeleteOpen, setGate]);

  // Fetch the viewer's existing reaction whenever the moment changes
  useEffect(() => {
    setMyReaction(null);
    if (!user || !activeMoment || isOwn) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("smile_moment_reactions")
        .select("reaction")
        .eq("moment_id", activeMoment.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setMyReaction(data?.reaction || null);
    })();

    return () => {
      cancelled = true;
    };
  }, [activeMoment?.id, user, isOwn]);

  // Owner reaction summary — fetches on open AND subscribes to
  // realtime changes, mirroring the live view-count pattern, so the
  // emoji stack updates while the owner is watching instead of only
  // reflecting whatever was true when the viewer opened.
  useEffect(() => {
    if (!activeMoment || !isOwn) {
      setReactionSummary({ total: 0, topEmojis: [] });
      return;
    }
    let cancelled = false;

    const fetchSummary = async () => {
      const { data, error } = await supabase
        .from("smile_moment_reactions")
        .select("reaction")
        .eq("moment_id", activeMoment.id);

      if (cancelled || error) return;

      const counts = {};
      for (const row of data || [])
        counts[row.reaction] = (counts[row.reaction] || 0) + 1;
      const topEmojis = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([emoji]) => emoji);

      setReactionSummary({ total: data?.length || 0, topEmojis });
    };

    fetchSummary();

    const channel = supabase
      .channel(`moment-reactions-${activeMoment.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "smile_moment_reactions",
          filter: `moment_id=eq.${activeMoment.id}`,
        },
        fetchSummary
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeMoment?.id, isOwn]);

  // Toggle reaction: upsert on first tap, delete on same-emoji re-tap
  const reactToStory = async (reaction) => {
    if (!user || !activeMoment || isOwn) return;

    const removing = myReaction === reaction;
    const previous = myReaction;
    setMyReaction(removing ? null : reaction);

    if (!removing) {
      const id = `${Date.now()}-${Math.random()}`;
      setFloatingReactions((prev) => [
        ...prev,
        { id, emoji: reaction, x: 20 + Math.random() * 60 },
      ]);
      const timeoutId = setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
        floatingTimeoutsRef.current.delete(timeoutId);
      }, 1400);
      floatingTimeoutsRef.current.add(timeoutId);
    }

    const { error } = removing
      ? await supabase
          .from("smile_moment_reactions")
          .delete()
          .eq("moment_id", activeMoment.id)
          .eq("user_id", user.id)
      : await supabase.from("smile_moment_reactions").upsert(
          {
            moment_id: activeMoment.id,
            user_id: user.id,
            reaction,
          },
          { onConflict: "moment_id,user_id" }
        );

    if (error) {
      console.error("Reaction failed:", error);
      setMyReaction(previous);
      showToast("Reaction didn't go through");
    }
  };

  // Deletes the currently active moment: storage object first (best
  // effort), then the row (authoritative — this is what actually
  // removes it everywhere). Only the owner can trigger this; the
  // button that calls it is itself owner-gated, and the query below
  // adds a matching `.eq("user_id", user.id)` as defense in depth
  // alongside the RLS delete policy.
  const deleteMoment = async () => {
    if (!isOwn || !activeMoment || deleting) return;
    setDeleting(true);
    const moment = activeMoment;

    try {
      const parsed = extractStoragePath(moment.media_url);
      if (parsed) {
        const { error: storageError } = await supabase.storage
          .from(parsed.bucket)
          .remove([parsed.path]);
        if (storageError) console.warn("Storage cleanup failed:", storageError);
      }
    } catch (err) {
      console.warn("Storage cleanup threw:", err);
    }

    const { error } = await supabase
      .from("smile_moments")
      .delete()
      .eq("id", moment.id)
      .eq("user_id", user.id);

    setDeleting(false);
    setConfirmDeleteOpen(false);

    if (error) {
      console.error("Delete failed:", error);
      showToast("Couldn't delete. Try again.");
      return;
    }

    onMomentDeleted?.(moment.id);
    showToast("Moment deleted");

    // Move off the now-gone moment. If nothing's left at all,
    // useStoryPlayer's own stories.length === 0 guard closes the
    // viewer once `stories` recomputes from the parent's updated list.
    goNext();
  };

  const votePoll = async (optionIndex) => {
    if (!user || !activeMoment || isOwn || myVote !== null || voting) return;
    setVoting(true);
    setGate(true);

    setMyVote(optionIndex);
    setPollState((prev) => {
      if (!prev) return prev;
      const options = prev.options.map((o, i) =>
        i === optionIndex ? { ...o, votes: (o.votes || 0) + 1 } : o
      );
      return { ...prev, options };
    });

    const { error } = await supabase.rpc("cast_poll_vote", {
      p_moment_id: activeMoment.id,
      p_option_index: optionIndex,
    });

    setVoting(false);
    setGate(viewersOpen || composerOpen || confirmDeleteOpen);

    if (error) {
      console.error("Poll vote failed:", error);
      setMyVote(null);
      setPollState(activeMoment.poll);
      showToast("Vote didn't go through");
    }
  };

  const pollPercentages = useMemo(
    () => (pollState?.options ? computePollPercentages(pollState.options) : []),
    [pollState]
  );

  // Live poll sync — without this, votePoll's optimistic update only
  // lands in the voter's own tab. Everyone else looking at the same
  // moment stays frozen on whatever the poll looked like the moment
  // they opened it, which is exactly the "I voted but nothing shows
  // up for anyone else" symptom. Subscribing to the moment row and
  // adopting the server's poll JSON as the source of truth fixes that
  // for every concurrent viewer, not just the one who just voted.
  // NOTE: confirm "smile_moments" is the actual table name your
  // moments live in and that `poll` is the JSON column cast_poll_vote
  // writes to — adjust if your schema names differ.
  useEffect(() => {
    if (!activeMoment?.id) return;
    let cancelled = false;

    const channel = supabase
      .channel(`moment-poll-${activeMoment.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "smile_moments",
          filter: `id=eq.${activeMoment.id}`,
        },
        (payload) => {
          if (cancelled) return;
          const nextPoll = payload.new?.poll;
          if (!nextPoll) return;
          setPollState(nextPoll);
          if (user && nextPoll.voters && nextPoll.voters[user.id] !== undefined) {
            setMyVote(nextPoll.voters[user.id]);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeMoment?.id, user]);

  const sendReply = async () => {
    const trimmed = replyText.trim();
    if (!user || !activeMoment || isOwn || !trimmed || sending) return;
    setSending(true);
    setGate(true);

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeMoment.user_id,
      content: trimmed.slice(0, REPLY_MAX_LENGTH),
      story_id: activeMoment.id,
    });

    setSending(false);
    setGate(viewersOpen || composerOpen || confirmDeleteOpen);

    if (error) {
      console.error("Reply failed:", error);
      showToast("Couldn't send. Try again.");
    } else {
      setReplyText("");
      showToast("Sent to chat ✓");
    }
  };

  // ---------------------------------------------------------------
  // PRELOAD NEXT MOMENT'S MEDIA
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!activeStory) return;
    let next = activeStory.moments[activeMomentIndex + 1];
    if (!next) next = stories[activeStoryIndex + 1]?.moments[0];
    if (!next?.media_url) return;

    if (next.media_type === "image") {
      const img = new Image();
      img.src = next.media_url;
      return;
    }

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = next.media_url;
    document.head.appendChild(link);
    return () => link.remove();
  }, [stories, activeStory, activeStoryIndex, activeMomentIndex]);

  // ---------------------------------------------------------------
  // INPUT — keyboard, swipe, tap zones, hold-to-pause
  // ---------------------------------------------------------------
  const touchStartX = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (confirmDeleteOpen) {
          setConfirmDeleteOpen(false);
          return;
        }
        handleClose();
        return;
      }
      // Don't hijack keystrokes while the person is typing a reply —
      // "m" or space in the reply box shouldn't toggle mute/pause.
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (confirmDeleteOpen) return; // don't navigate/pause behind the confirm dialog

      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") {
        e.preventDefault();
        togglePause();
      }
      if (e.key === "m" || e.key === "M") toggleMute();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, handleClose, togglePause, toggleMute, confirmDeleteOpen]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setGate(true);
  };
  const onTouchEnd = (e) => {
    setGate(viewersOpen || composerOpen || confirmDeleteOpen);
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  };

  const handleMediaError = useCallback(() => {
    setMediaLoading(false);
    setMediaError(true);
  }, []);
  const retryMedia = useCallback(() => {
    setMediaError(false);
    setMediaLoading(true);
    setRetryToken((t) => t + 1);
  }, []);

  if (!activeMoment) return null;

  const bgStyle =
    activeMoment.media_type === "text"
      ? undefined
      : { backgroundImage: `url(${activeMoment.media_url})` };
  const hasAudio =
    activeMoment.media_type === "video" || !!activeMoment.music_url;
  const ownerName = isOwn
    ? "You"
    : activeStory?.profile?.username ||
      activeMoment.profiles?.username ||
      "Someone";
  const ownerAvatar =
    activeStory?.profile?.avatar_url || activeMoment.profiles?.avatar_url;
  const replyRemaining = REPLY_MAX_LENGTH - replyText.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Story from ${ownerName}`}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes vh-float-up { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 15% { opacity: 1; transform: translateY(-10px) scale(1.1); } 100% { transform: translateY(-220px) scale(1); opacity: 0; } }
        .vh-float { animation: vh-float-up 1.4s ease-out forwards; }
        @keyframes vh-eq { 0%, 100% { height: 3px; } 50% { height: 11px; } }
        .vh-eq-bar { animation: vh-eq 0.8s ease-in-out infinite; }
        @keyframes vh-slide-next { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes vh-slide-prev { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
        .vh-slide-next { animation: vh-slide-next 0.22s ease-out; }
        .vh-slide-prev { animation: vh-slide-prev 0.22s ease-out; }
        @keyframes vh-spin { to { transform: rotate(360deg); } }
        .vh-spinner { animation: vh-spin 0.8s linear infinite; }
        @keyframes vh-dialog-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .vh-dialog-in { animation: vh-dialog-in 0.16s ease-out; }
      `}</style>

      <div className="absolute inset-0 bg-[#0B1220]" onClick={handleClose}>
        {activeMoment.media_type !== "text" && activeMoment.media_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-3xl scale-110"
            style={bgStyle}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      <button
        onClick={handleClose}
        aria-label="Close"
        className="absolute top-4 right-4 lg:top-6 lg:right-6 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg"
      >
        ✕
      </button>

      <button
        onClick={goPrev}
        aria-label="Previous story"
        disabled={activeStoryIndex === 0 && activeMomentIndex === 0}
        className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-0 backdrop-blur items-center justify-center text-white text-xl transition"
      >
        ‹
      </button>
      <button
        onClick={goNext}
        aria-label="Next story"
        className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur items-center justify-center text-white text-xl transition"
      >
        ›
      </button>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full h-full lg:h-[92vh] lg:max-h-[820px] lg:w-[420px] lg:rounded-3xl overflow-hidden flex flex-col bg-[#0F1729] lg:shadow-2xl lg:shadow-black/60 ${
          direction === "next" ? "vh-slide-next" : "vh-slide-prev"
        }`}
        key={activeMoment.id}
      >
        {/* PROGRESS BARS — one segment per moment in the active story */}
        <div className="flex gap-1 px-3 pt-3 shrink-0">
          {activeStory.moments.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden"
            >
              {i === activeMomentIndex && (
                <div
                  className="h-full bg-gradient-to-r from-[#FF7A45] to-[#FFB238]"
                  style={{ width: `${progress}%` }}
                />
              )}
              {i < activeMomentIndex && (
                <div className="h-full w-full bg-gradient-to-r from-[#FF7A45] to-[#FFB238]" />
              )}
            </div>
          ))}
        </div>

        {/* HEADER */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 shrink-0">
          <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#FF7A45] to-[#FFB238] shrink-0">
            {ownerAvatar ? (
              <img
                src={ownerAvatar}
                className="w-full h-full rounded-full object-cover border-2 border-[#0F1729]"
                alt={`${ownerName}'s avatar`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-700 border-2 border-[#0F1729]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {ownerName}
            </p>
            <p className="text-[11px] text-slate-400">
              {timeAgo(activeMoment.created_at)} ago
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Add moment — lets the signed-in user post a new moment
                without leaving the viewer. Reuses the single, full-
                featured composer (CreateSmileMoment) instead of a
                separate parallel implementation, so there's exactly
                one upload path / bucket / insert shape for moments
                whether they're posted from the feed or from here.
                renderTrigger swaps its default big FAB for a compact
                header icon; onOpenChange feeds composerOpen above so
                the story timer pauses while the composer is up (see
                the setGate(...) effect). */}
            {user && (
              <CreateSmileMoment
                user={user}
                onOpenChange={setComposerOpen}
                onCreated={() => onMomentPosted?.()}
                renderTrigger={(openComposer) => (
                  <button
                    onClick={openComposer}
                    aria-label="Add a moment"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-base"
                  >
                    +
                  </button>
                )}
              />
            )}
            {isOwn && (
              <button
                onClick={() => setConfirmDeleteOpen(true)}
                aria-label="Delete this moment"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm"
              >
                🗑️
              </button>
            )}
            {hasAudio && (
              <button
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                aria-pressed={muted}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm"
              >
                {muted ? "🔇" : "🔊"}
              </button>
            )}
            <button
              onClick={togglePause}
              aria-label={paused ? "Play" : "Pause"}
              aria-pressed={paused}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm"
            >
              {paused ? "▶" : "⏸"}
            </button>
          </div>
        </div>

        {/* TAP ZONES (mobile) */}
        <div className="lg:hidden absolute inset-x-0 top-16 bottom-24 flex z-10">
          <button
            className="flex-1"
            aria-label="Previous"
            onClick={goPrev}
          />
          <div
            className="flex-1"
            onMouseDown={() => setGate(true)}
            onMouseUp={() => setGate(viewersOpen || composerOpen || confirmDeleteOpen)}
            onTouchStart={() => setGate(true)}
            onTouchEnd={() => setGate(viewersOpen || composerOpen || confirmDeleteOpen)}
          />
          <button
            className="flex-1"
            aria-label="Next"
            onClick={goNext}
          />
        </div>

        {/* CONTENT */}
        <div
          className={`flex-1 flex items-center justify-center relative min-h-0 ${
            activeMoment.media_type === "text"
              ? `bg-gradient-to-br ${
                  activeMoment.bg_gradient || "from-[#FF7A45] to-[#FFB238]"
                }`
              : "bg-black"
          }`}
        >
          {mediaLoading && !mediaError && activeMoment.media_type !== "text" && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full vh-spinner" />
            </div>
          )}

          {mediaError && activeMoment.media_type !== "text" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 px-6 text-center">
              <p className="text-sm text-slate-300">
                This moment couldn't load.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={retryMedia}
                  className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-2"
                >
                  Retry
                </button>
                <button
                  onClick={goNext}
                  className="text-xs font-semibold text-[#FF9457] bg-white/10 hover:bg-white/20 rounded-full px-4 py-2"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {activeMoment.media_type === "image" && !mediaError && (
            <img
              key={retryToken}
              src={activeMoment.media_url}
              className="w-full h-full object-cover"
              alt={activeMoment.caption || "Story image"}
              onLoad={() => setMediaLoading(false)}
              onError={handleMediaError}
            />
          )}
          {activeMoment.media_type === "video" && !mediaError && (
            <video
              key={retryToken}
              ref={videoRef}
              src={activeMoment.media_url}
              muted={muted}
              playsInline
              autoPlay
              className="w-full h-full object-cover"
              onLoadedMetadata={() => setMediaLoading(false)}
              onError={handleMediaError}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                reportVideoProgress(v.currentTime, v.duration);
                // Safety net for any pre-existing/out-of-range video —
                // MAX_VIDEO_SECONDS now comes from the shared
                // momentLimits module, so this always matches whatever
                // CreateSmileMoment/VideoTrimmer actually allow.
                if (v.currentTime >= MAX_VIDEO_SECONDS) goNext();
              }}
              onEnded={goNext}
            />
          )}
          {activeMoment.media_type === "text" && (
            <p className="text-2xl font-semibold p-8 text-center text-white leading-snug">
              {activeMoment.caption}
            </p>
          )}

          {activeMoment.media_type !== "text" && activeMoment.caption && (
            <p className="absolute bottom-3 left-3 right-3 text-center text-sm bg-black/40 backdrop-blur rounded-xl px-3 py-2 text-white">
              {activeMoment.caption}
            </p>
          )}

          {activeMoment.mood_tag && (
            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur rounded-full px-3 py-1 text-xs text-white">
              {activeMoment.mood_tag}
            </div>
          )}

          {activeMoment.music_title && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur rounded-full pl-1.5 pr-3 py-1 max-w-[65%]">
              {activeMoment.music_artwork ? (
                <img
                  src={activeMoment.music_artwork}
                  className="w-5 h-5 rounded-full object-cover"
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xs">🎵</span>
              )}
              <span className="flex items-end gap-[2px] h-2.5 shrink-0">
                <span
                  className="w-[2px] bg-[#FFB238] vh-eq-bar"
                  style={{ animationDelay: "0s" }}
                />
                <span
                  className="w-[2px] bg-[#FFB238] vh-eq-bar"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-[2px] bg-[#FFB238] vh-eq-bar"
                  style={{ animationDelay: "0.3s" }}
                />
              </span>
              <span className="text-[11px] text-white truncate">
                {activeMoment.music_title}
              </span>
            </div>
          )}

          {pollState?.question && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-16 w-[88%] bg-black/50 backdrop-blur-md rounded-2xl p-3">
              <p className="text-sm font-semibold text-white mb-2 text-center">
                {pollState.question}
              </p>
              <div className="space-y-1.5">
                {pollState.options.map((opt, i) => {
                  const pct = pollPercentages[i] || 0;
                  const picked = myVote === i;
                  const showResults = myVote !== null || isOwn;

                  return (
                    <button
                      key={i}
                      onClick={() => votePoll(i)}
                      disabled={isOwn || myVote !== null || voting}
                      aria-label={`Vote ${opt.text}${
                        showResults ? `, ${pct} percent` : ""
                      }`}
                      className={`relative w-full text-left rounded-full overflow-hidden text-xs px-3 py-2 transition ${
                        picked ? "ring-1 ring-[#FF9457]" : ""
                      } ${
                        isOwn || myVote !== null
                          ? "cursor-default"
                          : "cursor-pointer hover:bg-white/5"
                      }`}
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      {showResults && (
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF7A45]/50 to-[#FFB238]/50"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <span className="relative flex items-center justify-between text-white">
                        <span className="truncate">{opt.text}</span>
                        {showResults && (
                          <span className="ml-2 shrink-0">{pct}%</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {floatingReactions.map((r) => (
            <span
              key={r.id}
              className="absolute bottom-16 text-3xl vh-float pointer-events-none"
              style={{ left: `${r.x}%` }}
            >
              {r.emoji}
            </span>
          ))}
        </div>

        {/* FOOTER */}
        {!isOwn ? (
          <div className="flex items-center gap-2 p-3 shrink-0 relative z-10">
            <input
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value.slice(0, REPLY_MAX_LENGTH))
              }
              onFocus={() => setGate(true)}
              onBlur={() => setGate(viewersOpen || composerOpen || confirmDeleteOpen)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              placeholder="Send a reply..."
              maxLength={REPLY_MAX_LENGTH}
              aria-label="Reply to this story"
              className="flex-1 bg-white/10 backdrop-blur rounded-full px-4 py-2.5 outline-none text-sm text-white placeholder-slate-400"
            />
            {replyText.trim() ? (
              <button
                onClick={sendReply}
                disabled={sending || replyRemaining < 0}
                className="text-[#FF9457] font-semibold text-sm disabled:opacity-50 px-1 shrink-0"
              >
                Send
              </button>
            ) : (
              <div className="flex gap-1 shrink-0">
                {REACTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => reactToStory(r)}
                    aria-label={`React with ${r}`}
                    aria-pressed={myReaction === r}
                    className={`text-lg transition-transform ${
                      myReaction === r ? "scale-125" : "hover:scale-110"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setViewersOpen(true)}
            aria-label="View who watched and reacted"
            className="w-full flex items-center justify-between gap-3 p-3 shrink-0 text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {reactionSummary.topEmojis.length > 0 && (
                <span className="flex -space-x-1 shrink-0">
                  {reactionSummary.topEmojis.map((emoji, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full bg-black/50 ring-1 ring-[#0F1729] flex items-center justify-center text-[11px]"
                    >
                      {emoji}
                    </span>
                  ))}
                </span>
              )}
              <span className="text-xs text-slate-300 truncate">
                {reactionSummary.total > 0
                  ? `${reactionSummary.total} ${
                      reactionSummary.total === 1 ? "reaction" : "reactions"
                    }`
                  : "No reactions yet"}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
              <span className="flex items-center gap-1">👁 {displayViews}</span>
              <span>
                expires{" "}
                {new Date(activeMoment.expires_at).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </button>
        )}

        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1.5 rounded-full text-xs text-white z-20"
          >
            {toast}
          </div>
        )}
      </div>

      {isOwn && viewersOpen && (
        <ViewersSheet
          momentId={activeMoment.id}
          onClose={() => setViewersOpen(false)}
        />
      )}

      {isOwn && confirmDeleteOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm delete"
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => !deleting && setConfirmDeleteOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="vh-dialog-in w-[85%] max-w-xs rounded-2xl bg-[#151F33] p-5 text-center shadow-xl"
          >
            <p className="text-white font-semibold text-sm mb-1">Delete this moment?</p>
            <p className="text-slate-400 text-xs mb-4">This can't be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
                className="flex-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteMoment}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-500/90 hover:bg-red-500 text-white text-sm py-2 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}