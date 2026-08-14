// components/WeeklyChallenge.jsx

import React from "react";
import ChallengeCard from "./ChallengeCard";

export default function WeeklyChallenge({
  challenge,
}) {
  if (!challenge) return null;

  return (
    <div>
      <h2>🏆 Weekly Challenge</h2>
      <ChallengeCard challenge={challenge} />
    </div>
  );
}