// src/features/challengeHub/components/TimerBar.jsx

export default function TimerBar({
  remaining = 0,
  total = 1,
  paused = false,
}) {
  const percent =
    total <= 0
      ? 0
      : Math.max(
          0,
          Math.min(100, (remaining / total) * 100)
        );

  const color =
    percent > 50
      ? "bg-green-500"
      : percent > 25
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="space-y-2">

      <div className="flex justify-between text-sm">

        <span className="font-medium">
          Time Remaining
        </span>

        <span>
          {paused ? "Paused" : `${remaining}s`}
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-200">

        <div
          className={`h-full transition-all duration-1000 ${color}`}
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  );
}