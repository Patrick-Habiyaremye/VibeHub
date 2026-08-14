// XPRewardModal.jsx

import { Award, Star } from "lucide-react";

export default function XPRewardModal({
  open,
  rewards,
  onClose,
}) {
  if (!open) return null;

  const {
    xp = 0,
    level = 1,
    badges = [],
  } = rewards || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-2xl bg-white p-8">

        <div className="text-center">

          <Award
            size={70}
            className="mx-auto text-yellow-500"
          />

          <h2 className="mt-4 text-3xl font-bold">
            Rewards Earned
          </h2>

          <div className="mt-6">

            <div className="text-5xl font-bold text-purple-600">
              +{xp} XP
            </div>

            <div className="mt-2 text-gray-500">
              Level {level}
            </div>

          </div>

          {badges.length > 0 && (
            <div className="mt-8">

              <h3 className="mb-3 font-semibold">
                New Badges
              </h3>

              <div className="flex flex-wrap justify-center gap-3">

                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-xl border p-3"
                  >
                    <Star className="mx-auto text-yellow-500" />

                    <p className="mt-2 text-sm">
                      {badge.name}
                    </p>
                  </div>
                ))}

              </div>

            </div>
          )}

          <button
            onClick={onClose}
            className="mt-8 rounded-xl bg-purple-600 px-6 py-3 text-white"
          >
            Continue
          </button>

        </div>

      </div>

    </div>
  );
}