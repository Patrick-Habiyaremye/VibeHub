// features/saved/SavedSkeleton.jsx
export default function SavedSkeleton() {
  return (
    <div className="space-y-4 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}