// components/DailyChallenge.jsx

import React from "react";
import ChallengeCard from "./ChallengeCard";

export default function DailyChallenge({
  challenge,
}) {
  if (!challenge) return null;

  return (
    <div>
      <h2>🔥 Daily Challenge</h2>
      <ChallengeCard challenge={challenge} />
    </div>
  );
}