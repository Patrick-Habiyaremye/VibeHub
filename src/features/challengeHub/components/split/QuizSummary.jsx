// src/features/challengeHub/components/QuizSummary.jsx

import {
  CheckCircle2,
  XCircle,
  Clock3,
  Trophy,
} from "lucide-react";

export default function QuizSummary({
  summary,
  onReplay,
  onContinue,
}) {
  if (!summary) return null;

  const {
    score = 0,
    accuracy = 0,
    correct = 0,
    incorrect = 0,
    duration = 0,
  } = summary;

  const stats = [
    {
      icon: <Trophy size={20} />,
      label: "Score",
      value: score,
      color: "text-yellow-500",
    },
    {
      icon: <CheckCircle2 size={20} />,
      label: "Correct",
      value: correct,
      color: "text-green-600",
    },
    {
      icon: <XCircle size={20} />,
      label: "Incorrect",
      value: incorrect,
      color: "text-red-500",
    },
    {
      icon: <Clock3 size={20} />,
      label: "Time",
      value: `${duration}s`,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">

      <h2 className="mb-2 text-3xl font-bold">
        Challenge Complete 🎉
      </h2>

      <p className="mb-8 text-gray-500">
        Accuracy: {accuracy}%
      </p>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border p-5 text-center"
          >
            <div className={item.color}>
              {item.icon}
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {item.label}
            </p>

            <h3 className="text-2xl font-bold">
              {item.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end gap-4">

        <button
          onClick={onReplay}
          className="rounded-xl border px-6 py-3"
        >
          Play Again
        </button>

        <button
          onClick={onContinue}
          className="rounded-xl bg-purple-600 px-6 py-3 text-white"
        >
          Continue
        </button>

      </div>

    </div>
  );
}