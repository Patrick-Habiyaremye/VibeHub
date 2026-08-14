export default function ReadReceipt({
  message,
  delivered = false,
  seen = false,
}) {
  if (!message) return null;

  if (seen || message.seen_at) {
    return (
      <span
        className="text-xs font-semibold text-blue-400"
        aria-label="Seen"
        title="Seen"
      >
        ✓✓
      </span>
    );
  }

  if (delivered || message.delivered_at) {
    return (
      <span
        className="text-xs text-slate-400"
        aria-label="Delivered"
        title="Delivered"
      >
        ✓✓
      </span>
    );
  }

  return (
    <span
      className="text-xs text-slate-400"
      aria-label="Sent"
      title="Sent"
    >
      ✓
    </span>
  );
}