// components/ChallengeFilters.jsx

import React from "react";
import ChallengeDifficulty from "./ChallengeDifficulty";
import ChallengeSearch from "./ChallengeSearch";

export default function ChallengeFilters({
  search,
  onSearch,
  difficulty,
  onDifficultyChange,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <ChallengeSearch
        value={search}
        onChange={onSearch}
      />

      <ChallengeDifficulty
        value={difficulty}
        onChange={onDifficultyChange}
      />
    </div>
  );
}