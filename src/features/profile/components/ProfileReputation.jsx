import { useProfileContext } from "../context/ProfileContext";

export default function ProfileReputation() {
  const { reputationDisplay } = useProfileContext();

  return (
    <div>
      <div className="mt-2 flex items-center gap-3 flex-wrap">
        <span className="font-semibold text-purple-600">Level {reputationDisplay.level}</span>
        <span className="text-gray-500">{reputationDisplay.title}</span>
      </div>

      <div
        className="mt-2 w-48 h-2 bg-gray-200 rounded-full"
        role="progressbar"
        aria-valuenow={reputationDisplay.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-purple-600 rounded-full transition-all"
          style={{ width: `${reputationDisplay.progressPercent}%` }}
        />
      </div>
    </div>
  );
}