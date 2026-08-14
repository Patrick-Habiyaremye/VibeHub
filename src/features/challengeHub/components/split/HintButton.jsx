// src/features/challengeHub/components/HintButton.jsx

import { Lightbulb } from "lucide-react";

export default function HintButton({
  remaining = 0,
  disabled = false,
  onHint,
}) {
  const unavailable =
    disabled || remaining <= 0;

  return (
    <button
      disabled={unavailable}
      onClick={onHint}
      className={`

        flex items-center gap-2
        rounded-xl px-5 py-3
        transition

        ${
          unavailable
            ? "cursor-not-allowed bg-gray-200 text-gray-500"
            : "bg-yellow-500 text-white hover:bg-yellow-600"
        }

      `}
    >
      <Lightbulb size={18} />

      Hint

      <span className="rounded bg-white/20 px-2 py-1 text-xs">
        {remaining}
      </span>
    </button>
  );
}