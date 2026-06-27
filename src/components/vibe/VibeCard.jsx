// components/vibe/VibeCard.jsx

export default function VibeCard({
  vibeScore = 4250,
  level = "✨ Joy Creator",
  challenges = 27,
  streak = 12,
}) {

  return (

    <div className="
      bg-slate-800
      border
      border-slate-700
      rounded-xl
      p-5
    ">

      <h2 className="
        text-xl
        font-bold
        text-yellow-400
        mb-5
      ">
        ⭐ Your Vibe
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between">

          <span className="text-slate-300">
            Vibe Score
          </span>

          <span className="
            text-white
            font-bold
          ">
            {vibeScore}
          </span>

        </div>


        <div className="flex justify-between">

          <span className="text-slate-300">
            Level
          </span>

          <span className="
            text-yellow-400
            font-semibold
          ">
            {level}
          </span>

        </div>


        <div className="flex justify-between">

          <span className="text-slate-300">
            Challenges Completed
          </span>

          <span className="text-white">

            {challenges}

          </span>

        </div>


        <div className="flex justify-between">

          <span className="text-slate-300">
            Positivity Streak
          </span>

          <span className="
            text-green-400
            font-semibold
          ">
            🔥 {streak} days
          </span>

        </div>

      </div>

    </div>

  );

}