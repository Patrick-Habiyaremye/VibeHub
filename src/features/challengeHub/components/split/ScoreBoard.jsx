// src/features/challengeHub/components/ScoreBoard.jsx

export default function ScoreBoard({
  score = 0,
  xp = 0,
  accuracy = 0,
  streak = 0,
  combo = 0,
}) {
  const cards = [
    {
      label: "Score",
      value: score,
    },
    {
      label: "XP",
      value: xp,
    },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
    },
    {
      label: "Combo",
      value: combo,
    },
    {
      label: "Streak",
      value: streak,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

      {cards.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-white p-5 shadow"
        >
          <p className="text-sm text-gray-500">
            {item.label}
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {item.value}
          </h2>
        </div>
      ))}

    </div>
  );
}