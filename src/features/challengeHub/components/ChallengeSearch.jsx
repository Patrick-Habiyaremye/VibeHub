// components/ChallengeSearch.jsx

import React from "react";

export default function ChallengeSearch({
  value,
  onChange,
}) {
  return (
    <input
      type="text" className="text-white"
      placeholder="Search challenges..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: 10,
        borderRadius: 10,
        border: "1px solid #ddd",
      }}
    />
  );
}