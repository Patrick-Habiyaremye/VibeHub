// LeaderboardPreview.jsx

import { Crown } from "lucide-react";

export default function LeaderboardPreview({
  players = [],
  onViewAll,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <div className="mb-6 flex items-center justify-between">

        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Crown className="text-yellow-500" />
          Leaderboard
        </h2>

        <button
          onClick={onViewAll}
          className="text-purple-600"
        >
          View All
        </button>

      </div>

      <div className="space-y-4">

        {players.slice(0, 5).map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div className="flex items-center gap-4">

              <span className="font-bold">
                #{index + 1}
              </span>

              <img
                src={player.avatar}
                alt=""
                className="h-10 w-10 rounded-full"
              />

              <span>
                {player.name}
              </span>

            </div>

            <span className="font-bold">
              {player.score}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}