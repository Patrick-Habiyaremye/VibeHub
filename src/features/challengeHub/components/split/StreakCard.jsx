// StreakCard.jsx

import { Flame } from "lucide-react";

export default function StreakCard({
  current = 0,
  best = 0,
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow">

      <div className="flex items-center gap-3">

        <Flame size={42} />

        <div>

          <div className="text-3xl font-bold">
            {current} Day Streak
          </div>

          <p className="opacity-90">
            Best: {best} days
          </p>

        </div>

      </div>

    </div>
  );
}