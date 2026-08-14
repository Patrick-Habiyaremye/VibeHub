// components/ChallengeCategory.jsx

import React from "react";
import {
  ChallengeCategories,
  getCategoryConfig,
} from "../utils/categories";
import { useChallenge } from "../context/ChallengeContext";

export default function ChallengeCategory() {
  const { selectedCategory, setCategory } =
    useChallenge();

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {Object.values(ChallengeCategories).map(
        (cat) => {
          const config = getCategoryConfig(cat);

          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border:
                  selectedCategory === cat
                    ? `2px solid ${config.color}`
                    : "1px solid #ddd",
                background:
                  selectedCategory === cat
                    ? config.color
                    : "#fff",
                color:
                  selectedCategory === cat
                    ? "#fff"
                    : "#000",
                cursor: "pointer",
              }}
            >
              {config.icon} {config.name}
            </button>
          );
        }
      )}
    </div>
  );
}