//C:\code\KeshApp\VibeHub\src\components\moments\SmileMomentCard.jsx

import { useRef, useState } from "react";

// ---------------------------------------------------------------------------
// VibeHub "smile moment" ring — design tokens
// ---------------------------------------------------------------------------
const UNSEEN_GRADIENT = "conic-gradient(from 220deg, #FFB238, #FF6F5E, #FF3D77, #FFB238)";
const SEEN_RING_COLOR = "#3A3F4B";

const SIZE_MAP = {
  sm: { ring: 56, avatar: 30, badge: 16 },
  md: { ring: 72, avatar: 38, badge: 18 },
  lg: { ring: 92, avatar: 48, badge: 22 },
};

const MAX_TILT_DEG = 8;

// Exported: the Moments feed widget's "Viewed" entry pill needs the exact
// same avatar-fallback logic to build its stacked-avatar preview, and
// duplicating the ui-avatars URL format elsewhere would drift over time.
export function initialsFallbackUrl(name) {
  const safe = encodeURIComponent(name || "U");
  return `https://ui-avatars.com/api/?background=FF6F5E&color=fff&bold=true&name=${safe}`;
}

function SmileBadge({ size, unseen }) {
  if (!unseen) return null;
  return (
    <div
      className="absolute left-1/2 -bottom-0.5 -translate-x-1/2 rounded-full flex items-center justify-center shadow-[0_0_0_2px_rgba(11,11,15,0.9)]"
      style={{ width: size, height: size, background: "linear-gradient(135deg, #FFB238, #FF6F5E)" }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full bg-[#FF6F5E]/60 animate-vh-smile-pulse motion-reduce:animate-none" />
      <svg viewBox="0 0 20 20" className="relative" style={{ width: size * 0.6, height: size * 0.6 }} fill="none">
        <path d="M5 8.5c0 3 2.2 5 5 5s5-2 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function SmileMomentCard({ group, seen, onClick, size = "md" }) {
  const [avatarErrored, setAvatarErrored] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);
  const videoRef = useRef(null);
  const ringRef = useRef(null);

  const latest = group?.[0];
  const author = latest?.profiles;
  const momentCount = group?.length || 0;

  const isImage = latest?.media_type === "image";
  const isVideo = latest?.media_type === "video";
  const isText = latest?.media_type === "text";

  const dims = SIZE_MAP[size] || SIZE_MAP.md;
  const displayName = author?.username || "Someone";
  const avatarSrc = !avatarErrored && author?.avatar_url ? author.avatar_url : initialsFallbackUrl(displayName);

  const showSegments = momentCount > 1;
  const segmentRing = showSegments
    ? buildSegmentedRingStyle(momentCount, seen)
    : { background: seen ? SEEN_RING_COLOR : UNSEEN_GRADIENT };

  // Subtle mouse-reactive tilt — makes the card feel touchable, not flat.
  const handleMouseMove = (e) => {
    const el = ringRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -MAX_TILT_DEG, y: px * MAX_TILT_DEG });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay can be blocked (rare when muted) — thumbnail just
        // stays on its poster frame, which is a fine fallback.
      });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      aria-label={`${displayName}'s smile moment${momentCount > 1 ? `s (${momentCount})` : ""}${seen ? "" : ", new"}`}
      className="group flex flex-col items-center gap-1.5 focus:outline-none"
      style={{ width: dims.ring + 16 }}
    >
      <div
        ref={ringRef}
        className="relative rounded-full p-[2.5px] transition-transform duration-200 ease-out group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black group-focus-visible:ring-[#FF6F5E]"
        style={{
          width: dims.ring,
          height: dims.ring,
          ...segmentRing,
          transform: `perspective(400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${pressed ? 0.94 : 1})`,
        }}
      >
        {!seen && (
          <div
            className="absolute inset-0 -z-10 rounded-full blur-md opacity-40 animate-vh-glow-breathe motion-reduce:animate-none"
            style={{ background: UNSEEN_GRADIENT }}
            aria-hidden="true"
          />
        )}

        <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0B0B0F]">
          {/* Backdrop: the actual content someone shared, kept sharp
              enough to read — this IS "what the user shared", not just
              decoration behind their face. */}
          <div className="absolute inset-0 scale-110 transition-transform duration-500 group-hover:scale-125">
            {isImage && <img src={latest.media_url} alt="" className="w-full h-full object-cover" />}
            {isVideo && (
              <video
                ref={videoRef}
                src={latest.media_url}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                preload="metadata"
              />
            )}
            {isText && (
              <div className={`w-full h-full bg-gradient-to-br ${latest?.bg_gradient || "from-[#FFB238] to-[#FF3D77]"}`} />
            )}
            {!isImage && !isVideo && !isText && (
              <div className="w-full h-full bg-gradient-to-br from-[#3A3F4B] to-[#0B0B0F]" />
            )}
          </div>

          {/* Light edge vignette only — keeps content visible while
              still letting the centered avatar read clearly. */}
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle, rgba(11,11,15,0) 55%, rgba(11,11,15,0.5) 100%)" }}
            aria-hidden="true"
          />

          {/* Centered author portrait */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-110"
            style={{ width: dims.avatar, height: dims.avatar, boxShadow: "0 0 0 2px rgba(11,11,15,0.9), 0 2px 6px rgba(0,0,0,0.4)" }}
          >
            <img src={avatarSrc} alt="" onError={() => setAvatarErrored(true)} className="w-full h-full object-cover" />
          </div>

          {isText && latest?.caption && (
            <div className="absolute inset-x-1 bottom-1 text-center pointer-events-none">
              <span className="text-[8px] leading-tight font-medium text-white/85 line-clamp-1 drop-shadow">
                {latest.caption}
              </span>
            </div>
          )}
        </div>

        <SmileBadge size={dims.badge} unseen={!seen} />
      </div>

      <p className="text-xs font-medium tracking-tight text-white/90 truncate text-center" style={{ width: dims.ring + 8 }}>
        {displayName}
      </p>

      <style>{`
        @keyframes vh-glow-breathe {
          0%, 100% { opacity: 0.32; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.06); }
        }
        .animate-vh-glow-breathe { animation: vh-glow-breathe 2.6s ease-in-out infinite; }
        @keyframes vh-smile-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.6); }
        }
        .animate-vh-smile-pulse { animation: vh-smile-pulse 1.8s ease-out infinite; }
      `}</style>
    </button>
  );
}

function buildSegmentedRingStyle(count, seen) {
  const gapDeg = 6;
  const segDeg = 360 / count;
  const activeColor = seen ? SEEN_RING_COLOR : "#FF6F5E";
  const stops = [];
  for (let i = 0; i < count; i++) {
    const start = i * segDeg;
    const end = start + segDeg - gapDeg;
    stops.push(`transparent ${start}deg`, `${activeColor} ${start}deg`, `${activeColor} ${end}deg`, `transparent ${end}deg`);
  }
  return { background: `conic-gradient(${stops.join(", ")})` };
}