// features/reels/components/ReelVibe.jsx
//
// NEW FILE. VibeHub's category badge (§10). Deliberately derives from
// reel.tags — the one real field normalizeReel already passes through —
// rather than a dedicated `vibe` column that doesn't exist in the schema
// yet. Matches the first tag (case-insensitive) against a known vibe
// vocabulary; renders nothing if no tag matches, per spec's explicit
// "gracefully hide" instruction. No fabricated percentages/stats — ever.

import { memo, useMemo } from "react";

const VIBE_MAP = {
  funny: { emoji: "😂", label: "Comedy" },
  comedy: { emoji: "😂", label: "Comedy" },
  faith: { emoji: "🙏", label: "Faith" },
  motivation: { emoji: "🔥", label: "Motivation" },
  education: { emoji: "💡", label: "Education" },
  music: { emoji: "🎵", label: "Music" },
  sports: { emoji: "⚽", label: "Sports" },
  culture: { emoji: "🌍", label: "Culture" },
  tech: { emoji: "💻", label: "Tech" },
  inspiration: { emoji: "✨", label: "Inspiration" },
  emotional: { emoji: "❤️", label: "Emotional" },
  lifestyle: { emoji: "🌿", label: "Lifestyle" },
};

function ReelVibe({ tags }) {
  const vibe = useMemo(() => {
    if (!Array.isArray(tags)) return null;
    for (const tag of tags) {
      const key = String(tag).trim().toLowerCase().replace(/^#/, "");
      if (VIBE_MAP[key]) return VIBE_MAP[key];
    }
    return null;
  }, [tags]);

  if (!vibe) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90 bg-white/10 backdrop-blur px-2 py-1 rounded-full">
      <span aria-hidden="true">{vibe.emoji}</span>
      {vibe.label}
    </span>
  );
}

export default memo(ReelVibe);