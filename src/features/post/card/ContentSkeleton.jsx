export default function ContentSkeleton({
  lines = 3,
  avatar = true,
  media = false,
}) {
  return (
    <div className="animate-pulse space-y-3 p-4 bg-slate-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-3">
        {avatar && (
          <div className="w-10 h-10 rounded-full bg-slate-700" />
        )}

        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-slate-700 rounded" />
          <div className="h-2 w-20 bg-slate-700 rounded" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-slate-700 rounded"
            style={{
              width: `${90 - i * 10}%`,
            }}
          />
        ))}
      </div>

      {/* Optional media */}
      {media && (
        <div className="h-48 bg-slate-700 rounded-lg" />
      )}
    </div>
  );
}