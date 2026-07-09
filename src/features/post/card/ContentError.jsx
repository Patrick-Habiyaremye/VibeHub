export default function ContentError({
  message = "Something went wrong.",
  onRetry,
  minimal = false,
}) {
  return (
    <div
      className={`
        bg-red-500/10 border border-red-500/30
        rounded-lg p-4 text-center
        ${minimal ? "p-2 text-sm" : ""}
      `}
    >
      <p className="text-red-400 mb-2">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="
            px-3 py-1 rounded
            bg-red-500 text-white text-sm
            hover:bg-red-600 transition
          "
        >
          Retry
        </button>
      )}
    </div>
  );
}