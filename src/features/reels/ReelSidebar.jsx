// features/reels/ReelSidebar.jsx
//
// One real fix: the avatar fallback chain led with `reel.thumbnail_url` —
// that's the reel's own video poster/thumbnail, not the uploader's
// profile picture. Whenever a reel had a thumbnail but no avatar on the
// profile, this would render the video's poster frame as the user's
// avatar. Removed it from the avatar chain; if you do want a thumbnail
// somewhere, it belongs on the video itself (ReelPlayer's `poster` prop),
// not here.

import { memo, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, MapPin, Music2 } from "lucide-react";

function ReelSidebar({ reel }) {
  const [expanded, setExpanded] = useState(false);

  const username = reel?.username || reel?.user?.username || "Unknown";

  const avatar =
  reel?.avatar ||
  reel?.user?.avatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

  const caption = reel?.caption || reel?.content || "";

  const hashtags = useMemo(() => caption.match(/#\w+/g) || [], [caption]);

  const MAX = 120;
  const isLong = caption.length > MAX;
  const visibleText = expanded ? caption : caption.slice(0, MAX);

  const createdAt = reel?.created_at
    ? new Date(reel.created_at).toLocaleDateString()
    : "";

  return (
    <div className="absolute bottom-6 left-4 right-24 z-20 text-white">
      {/* USER */}
      <Link
        to={reel?.user_id ? `/profile/${reel.user_id}` : "#"}
        className="flex items-center gap-3 w-fit"
      >
        <img
          src={avatar}
          alt={username}
          loading="lazy"
          className="h-11 w-11 rounded-full object-cover border border-white/20 shadow-lg"
        />

        <div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">@{username}</span>

            {reel?.verified && <CheckCircle size={16} className="text-sky-400" />}
          </div>

          {createdAt && <p className="text-xs text-white/60">{createdAt}</p>}
        </div>
      </Link>

      {/* CAPTION */}
      {caption && (
        <div className="mt-3">
          <p className="text-sm leading-6 text-white/95 whitespace-pre-wrap">
            {visibleText}

            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="ml-2 font-medium text-yellow-400"
              >
                {expanded ? "less" : "...more"}
              </button>
            )}
          </p>

          {/* HASHTAGS */}
          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <span key={tag} className="text-sm text-sky-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OPTIONAL INFO */}
      {(reel?.music || reel?.location) && (
        <div className="mt-4 space-y-1 text-xs text-white/70">
          {reel.music && (
            <div className="flex items-center gap-2">
              <Music2 size={14} />
              <span>{reel.music}</span>
            </div>
          )}

          {reel.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{reel.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ReelSidebar);