// components/ChallengeReward.jsx

import React from "react";

export default function ChallengeReward({
  reward,
}) {
  if (!reward) return null;

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        background: "#FFF7E6",
        border: "1px solid #FFD93D",
      }}
    >
      <strong>🎁 Reward</strong>
      <p>{reward}</p>
    </div>
  );
}