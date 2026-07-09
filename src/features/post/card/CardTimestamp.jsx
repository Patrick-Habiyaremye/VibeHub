import { Clock3 } from "lucide-react";

export default function CardTimestamp({
  date,
}) {
  if (!date) return null;

  const formatTime = () => {
    const now = new Date();
    const created = new Date(date);

    const diff =
      Math.floor(
        (now - created) / 1000
      );

    if (diff < 60)
      return "Just now";

    if (diff < 3600)
      return `${Math.floor(diff / 60)}m`;

    if (diff < 86400)
      return `${Math.floor(diff / 3600)}h`;

    if (diff < 604800)
      return `${Math.floor(diff / 86400)}d`;

    return created.toLocaleDateString();
  };

  return (
    <div
      className="
        flex
        items-center
        gap-1
        text-xs
        text-slate-400
      "
    >
      <Clock3 size={13} />

      <span>
        {formatTime()}
      </span>
    </div>
  );
}