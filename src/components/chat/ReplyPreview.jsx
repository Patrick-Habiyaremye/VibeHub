export default function ReplyPreview({
  replyTo,
  onCancel,
}) {
  if (!replyTo) return null;

  return (
    <div className="flex items-center justify-between bg-slate-800 border border-slate-700 p-3 rounded-lg mb-2">
      
      <div className="text-sm">
        <p className="text-yellow-400 font-semibold">
          Replying to
        </p>

        <p className="text-slate-300 truncate max-w-[250px]">
          {replyTo.content}
        </p>
      </div>

      <button
        onClick={onCancel}
        className="text-slate-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}