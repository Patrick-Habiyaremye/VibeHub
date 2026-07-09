export default function ReelDescription({
  content = "",
  hashtags = [],
}) {
  // Ensure hashtags are always safe
  const safeTags = Array.isArray(hashtags)
    ? hashtags.filter(Boolean)
    : [];

  return (
    <div className="mt-2 space-y-2">

      {/* CAPTION */}
      {caption && (
        <p className="text-white text-sm leading-relaxed break-words">
          {caption}
        </p>
      )}

      {/* HASHTAGS */}
      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeTags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="
                text-blue-400
                text-xs
                font-medium
                hover:text-blue-300
                cursor-pointer
                transition
              "
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

    </div>
  );
}