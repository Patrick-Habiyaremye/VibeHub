import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  X,
  Heart,
  MessageCircle,
  Volume2,
  VolumeX,
  Quote as QuoteIcon,
} from "lucide-react";

import { resolveQuoteBackground } from "../../post/create/engines/StyleEngine";
import { useProfileContext } from "../context/ProfileContext";

const RENDER_WINDOW = 1; // render current post ± this many neighbours

export default function ProfilePostViewer({ posts, initialPostId, onClose }) {
  const { profile } = useProfileContext();

  const initialIndex = useMemo(() => {
    const idx = posts.findIndex((p) => p.id === initialPostId);
    return idx === -1 ? 0 : idx;
  }, [posts, initialPostId]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(true);

  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const videoRefs = useRef({});
  const didInitialScroll = useRef(false);

  // ------------------------------------------------------------
  // Lock body scroll + keyboard nav while the viewer is open
  // ------------------------------------------------------------
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") scrollToIndex(activeIndex + 1);
      if (event.key === "ArrowUp") scrollToIndex(activeIndex - 1);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // ------------------------------------------------------------
  // Device/browser back button closes the viewer instead of
  // navigating the app away from the profile page.
  // ------------------------------------------------------------
  useEffect(() => {
    window.history.pushState({ postViewer: true }, "");
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------
  // Jump instantly to the clicked post on mount (no animation)
  // ------------------------------------------------------------
  useEffect(() => {
    if (didInitialScroll.current) return;
    const node = slideRefs.current[initialIndex];
    if (node) {
      node.scrollIntoView({ block: "start" });
      didInitialScroll.current = true;
    }
  }, [initialIndex]);

  // ------------------------------------------------------------
  // Track which post is centered in the viewport
  // ------------------------------------------------------------
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          const idx = Number(mostVisible.target.dataset.index);
          setActiveIndex((current) => (current === idx ? current : idx));
        }
      },
      { root, threshold: 0.6 }
    );

    slideRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [posts.length]);

  // ------------------------------------------------------------
  // Play only the active video, pause everything else
  // ------------------------------------------------------------
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
      if (!videoEl) return;
      const isActive = posts[activeIndex]?.id === id;
      if (isActive) {
        videoEl.play?.().catch(() => {
          /* autoplay can be blocked — user can tap to unmute/play */
        });
      } else {
        videoEl.pause?.();
      }
    });
  }, [activeIndex, posts]);

  const scrollToIndex = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(idx, slideRefs.current.length - 1));
    slideRefs.current[clamped]?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
      >
        <X size={20} />
      </button>

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-16 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div
        ref={containerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth"
      >
        {posts.map((post, index) => {
          const withinWindow = Math.abs(index - activeIndex) <= RENDER_WINDOW;

          return (
            <div
              key={post.id}
              ref={(el) => (slideRefs.current[index] = el)}
              data-index={index}
              className="flex h-screen w-full snap-start items-center justify-center"
            >
              {withinWindow ? (
                <PostSlide
                  post={post}
                  isActive={index === activeIndex}
                  muted={muted}
                  registerVideoRef={(el) => {
                    videoRefs.current[post.id] = el;
                  }}
                  authorName={profile?.fullName || profile?.username}
                  authorAvatar={profile?.avatarUrl}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------------------------------------------
// SINGLE POST SLIDE
// --------------------------------------------------

function PostSlide({
  post,
  isActive,
  muted,
  registerVideoRef,
  authorName,
  authorAvatar,
}) {
  const media = post.media;
  const kind = media?.kind;

  return (
    <div className="relative flex h-full w-full max-w-lg items-center justify-center bg-black">
      {kind === "image" && (media?.url || media?.thumbnail) && (
        <img
          src={media.url || media.thumbnail}
          alt=""
          className="max-h-full max-w-full object-contain"
        />
      )}

      {kind === "video" && media?.url && (
        <video
          ref={registerVideoRef}
          src={media.url}
          muted={muted}
          loop
          playsInline
          preload={isActive ? "auto" : "none"}
          className="max-h-full max-w-full object-contain"
        />
      )}

      {kind === "quote" && (
        <div
          className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-white"
          style={{ background: resolveQuoteBackground(post.style?.background) }}
        >
          <QuoteIcon size={28} className="mb-4 opacity-80" />
          <p className="max-w-md text-xl font-medium leading-relaxed">
            {post.content}
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
        <div className="flex items-center gap-2 min-w-0">
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          )}
          <span className="truncate text-sm font-semibold">{authorName}</span>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-sm font-semibold">
          {typeof post.reaction_count === "number" && (
            <span className="flex items-center gap-1.5">
              <Heart size={16} fill="currentColor" />
              {post.reaction_count}
            </span>
          )}
          {typeof post.comment_count === "number" && (
            <span className="flex items-center gap-1.5">
              <MessageCircle size={16} fill="currentColor" />
              {post.comment_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}