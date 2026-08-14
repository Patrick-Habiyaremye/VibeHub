export default function ProfileError({ message, onRetry }) {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <p className="text-gray-700 font-semibold mb-4">
          {message || "This profile is unavailable."}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="bg-purple-600 text-white px-5 py-2 rounded-xl">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}