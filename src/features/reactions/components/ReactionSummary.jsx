// FILE: src/features/reactions/components/ReactionSummary.jsx

import { memo } from "react";

function ReactionSummary({ total = 0, onClick }) {
  if (total <= 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-slate-300 hover:text-white hover:underline"
    >
      😊 {total} {total === 1 ? "Smile" : "Smiles"} created
    </button>
  );
}

export default memo(ReactionSummary);