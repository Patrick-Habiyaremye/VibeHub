// FILE: src/components/card/ShareButton.jsx

export default function ShareButton({ onShare, sharing }) {
  return (
    <button
      type="button"
      onClick={onShare}
      disabled={sharing}
      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
    >
      🔗 Share
    </button>
  );
}