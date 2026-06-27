// components/vibe/VibeLevel.jsx

export default function VibeLevel({

  score,

}) {

  let level = "🌱 New Spark";

  if(score >= 100)
    level = "😊 Smile Creator";

  if(score >= 500)
    level = "💛 Kindness Giver";

  if(score >= 1000)
    level = "🌈 Hope Builder";

  if(score >= 3000)
    level = "✨ Joy Creator";

  if(score >= 6000)
    level = "⭐ Vibe Legend";


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
        Current Level
      </h2>

      <p className="
        text-2xl
        font-bold
        text-yellow-400
      ">

        {level}

      </p>

    </div>

  );

}