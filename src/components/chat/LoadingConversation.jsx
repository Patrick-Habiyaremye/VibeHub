export default function LoadingConversation() {
  return (
    <div className="flex flex-col h-full animate-pulse bg-slate-950">

      {/* header skeleton */}
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="w-40 h-4 bg-slate-700 rounded" />
      </div>

      {/* messages */}
      <div className="flex-1 p-4 space-y-4">
        <div className="w-2/3 h-10 bg-slate-800 rounded-lg" />
        <div className="w-1/2 h-10 bg-slate-800 rounded-lg ml-auto" />
        <div className="w-3/4 h-10 bg-slate-800 rounded-lg" />
      </div>

      {/* input */}
      <div className="p-4 border-t border-slate-800">
        <div className="w-full h-10 bg-slate-800 rounded-lg" />
      </div>

    </div>
  );
}