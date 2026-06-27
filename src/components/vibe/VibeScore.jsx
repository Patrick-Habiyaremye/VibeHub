// components/vibe/VibeScore.jsx

export default function VibeScore({

  score = 4250,

}) {

  return (

    <div className="
      bg-slate-800
      border
      border-slate-700
      rounded-xl
      p-5
      text-center
    ">

      <p className="
        text-slate-400
        mb-2
      ">
        ⭐ Vibe Score
      </p>

      <h1 className="
        text-5xl
        font-bold
        text-yellow-400
      ">

        {score}

      </h1>

    </div>

  );

}