import { useState } from "react";

export default function useAIModeration() {
  const [loading, setLoading] = useState(false);

  const analyzeText = async (text) => {
    setLoading(true);

    try {
      // simple AI simulation (replace with OpenAI later if you want)
      const lower = text.toLowerCase();

      let score = 0;
      let flags = [];

      if (lower.includes("hate") || lower.includes("kill")) {
        score += 80;
        flags.push("hate speech");
      }

      if (lower.includes("buy now") || lower.includes("click link")) {
        score += 60;
        flags.push("spam");
      }

      if (lower.includes("idiot") || lower.includes("stupid")) {
        score += 40;
        flags.push("harassment");
      }

      return {
        score: Math.min(score, 100),
        flags,
        action:
          score > 70
            ? "DELETE"
            : score > 40
            ? "REVIEW"
            : "ALLOW",
      };
    } finally {
      setLoading(false);
    }
  };

  return { analyzeText, loading };
}