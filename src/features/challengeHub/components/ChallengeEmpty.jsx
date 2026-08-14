// components/ChallengeEmpty.jsx

import React from "react";

export default function ChallengeEmpty({
  message = "No challenges found.",
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: 40,
        opacity: 0.6,
      }}
    >
      <h3>😕</h3>
      <p>{message}</p>
    </div>
  );
}