// components/ChallengeDifficulty.jsx

import React from "react";

const DIFFICULTY = ["EASY", "MEDIUM", "HARD"];

export default function ChallengeDifficulty({
  value,
  onChange,
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {DIFFICULTY.map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border:
              value === level
                ? "2px solid #000"
                : "1px solid #ddd",
            background:
              value === level ? "#000" : "#fff",
            color:
              value === level ? "#fff" : "#000",
            cursor: "pointer",
          }}
        >
          {level}
        </button>
      ))}
    </div>
  );
}