// components/vibe/PositivityStreak.jsx

export default function PositivityStreak({

  days = 12,

}) {

  return (

    <div className="
      bg-slate-800
      border
      border-slate-700
      rounded-xl
      p-4
    ">

      <h2 className="
        text-slate-400
        mb-2
      ">
        Positivity Streak
      </h2>

      <p className="
        text-4xl
        font-bold
        text-green-400
      ">

        🔥 {days}

      </p>

      <p className="
        text-slate-300
        mt-2
      ">

        days spreading positivity

      </p>

    </div>

  );

}