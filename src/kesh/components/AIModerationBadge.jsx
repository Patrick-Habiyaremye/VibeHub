export default function AIModerationBadge({ result }) {
  if (!result) return null;

  const color =
    result.score > 70
      ? "text-red-500"
      : result.score > 40
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div className="mt-2 text-sm">
      <div className={color}>
        ⚠ Risk Score: {result.score}
      </div>

      <div className="text-slate-400">
        Flags: {result.flags.join(", ") || "none"}
      </div>

      <div className="text-white mt-1">
        Action: <strong>{result.action}</strong>
      </div>
    </div>
  );
}