// features/reels/ReelSkeleton.jsx
//
// Carried over unchanged — no bugs found.

export default function ReelSkeleton() {
  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <div className="absolute inset-0 bg-slate-800 animate-pulse" />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
        <div className="h-8 w-8 bg-slate-700 rounded-full animate-pulse" />
      </div>

      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-10">
        <div className="h-10 w-10 bg-slate-700 rounded-full animate-pulse" />
        <div className="h-10 w-10 bg-slate-700 rounded-full animate-pulse" />
        <div className="h-10 w-10 bg-slate-700 rounded-full animate-pulse" />
      </div>

      <div className="absolute bottom-6 left-4 right-16 z-10 space-y-3">
        <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-full bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-slate-700 rounded animate-pulse" />
      </div>

      <div className="absolute top-0 left-0 w-full h-1 bg-slate-700 overflow-hidden">
        <div className="h-full w-1/3 bg-slate-500 animate-pulse" />
      </div>
    </div>
  );
}