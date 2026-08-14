// components/common/SaveButton.jsx
//
// NEW FILE. Generic reusable save toggle — used directly by ContentCard.
// ReelActions does NOT use this component (see its own file): it needs a
// custom vertical icon-stack layout that doesn't fit a generic button, so
// it calls useSaves() directly instead. Both paths go through the same
// hook/store/API — this is a UI convenience, not a second save system.

import { memo, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { useSaves } from "../../../hooks/useSaves";

function SaveButton({ contentType, contentId, className = "" }) {
  const { isSaved, isSaving, toggleSave } = useSaves();

  const saved = isSaved(contentType, contentId);
  const saving = isSaving(contentType, contentId);

const handleClick = useCallback(async () => {
  try {
    await toggleSave(contentType, contentId);
  } catch (err) {
    console.error("Save toggle failed:", err);
  }
}, [contentType, contentId, toggleSave]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      aria-label={saved ? "Unsave" : "Save"}
      aria-pressed={saved}
      className={`flex items-center gap-2 text-sm transition disabled:opacity-50 ${
        saved ? "text-yellow-400" : "text-gray-400 hover:text-yellow-300"
      } ${className}`}
    >
      <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export default memo(SaveButton);