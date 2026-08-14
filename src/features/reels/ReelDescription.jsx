// features/reels/ReelDescription.jsx
//
// Carried over unchanged — no bugs found. Note: not currently rendered
// inside ReelCard (ReelSidebar independently parses hashtags from caption
// itself), so this component is presently unused. Left in place in case
// it's wired in elsewhere or intended for a future layout.

export default function ReelDescription({ content = "", hashtags = [] }) {
  const safeTags = Array.isArray(hashtags) ? hashtags.filter(Boolean) : [];

  return (
    <div className="mt-2 space-y-2">
      {content && (
        <p className="text-white text-sm leading-relaxed break-words">{content}</p>
      )}

      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeTags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="text-blue-400 text-xs font-medium hover:text-blue-300 cursor-pointer transition"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}