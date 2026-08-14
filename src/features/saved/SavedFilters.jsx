// features/saved/SavedFilters.jsx
import { SAVE_CONTENT_TYPES } from "../../api/savesApi";

const FILTERS = [
  { value: null, label: "All" },
  { value: SAVE_CONTENT_TYPES.POST, label: "Posts" },
  { value: SAVE_CONTENT_TYPES.REEL, label: "Reels" },
  { value: SAVE_CONTENT_TYPES.MOMENT, label: "Moments" },
];

export default function SavedFilters({ active, onChange }) {
  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.label}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
            active === f.value ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}