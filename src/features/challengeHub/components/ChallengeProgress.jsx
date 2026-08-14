// components/ChallengeProgress.jsx

import React from "react";

export default function ChallengeProgress({
  current = 0,
  total = 100,
}) {
  const percentage = Math.min(
    (current / total) * 100,
    100
  );

  return (
    <div>
      <div
        style={{
          height: 10,
          background: "#eee",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "#4D96FF",
          }}
        />
      </div>

      <small>
        {current} / {total}
      </small>
    </div>
  );
}