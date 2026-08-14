// kesh/components/ErrorBanner.jsx

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-200 underline underline-offset-2 hover:text-white ml-4 shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}
