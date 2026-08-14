// components/ChallengeHero.jsx

import React from "react";
import { useChallenge } from "../context/ChallengeContext";

export default function ChallengeHero() {
  const { categoryConfig } = useChallenge();

  if (!categoryConfig) {
    return <h2>Select a category</h2>;
  }

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 20,
        background: categoryConfig.color,
        color: "#fff",
      }}
    >
      <h1>
        {categoryConfig.icon} {categoryConfig.name}
      </h1>
      <p>{categoryConfig.description}</p>
    </div>
  );
}