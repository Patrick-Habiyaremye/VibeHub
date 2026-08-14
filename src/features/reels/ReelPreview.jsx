// features/reels/ReelPreview.jsx
//
// One real fix: this read `reel.videoUrl` (camelCase), but every reel row
// actually has `video_url` (snake_case — see uploadWorker.js's insert and
// ReelSidebar's `reel.video_url` usage patterns elsewhere). With the
// mismatched field name every preview thumbnail in this carousel would
// have rendered as a blank/broken <video> with no source at all.

export default function ReelPreview({ reels = [], loading }) {
  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-32 h-48 rounded-xl bg-slate-800 animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  if (!reels || reels.length === 0) {
    return <p className="text-slate-400 text-sm mb-4">No reels available yet 🎥</p>;
  }

  return (
    <div className="mb-5">
      <h2 className="text-slate-300 text-sm mb-2 font-medium">🔥 Trending Reels</h2>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="relative w-32 h-48 shrink-0 snap-start rounded-xl overflow-hidden group"
          >
            <video
              src={reel.video_url}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center text-white text-xl opacity-80 group-hover:scale-110 transition">
              ▶
            </div>

            <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
              <p className="truncate">{reel.content || "Smile moment"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}