import { Search, X } from "lucide-react";

export default function ConversationSearch({
  value = "",
  onChange,
  onClear,
  placeholder = "Search conversations...",
}) {
  return (
    <div className="px-3 py-3 border-b border-slate-800">
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-3 text-slate-400 pointer-events-none"
        />

        <input
          type="search"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          aria-label="Search conversations"
          className="
            w-full
            bg-slate-800
            text-white
            placeholder:text-slate-500
            rounded-xl
            pl-10
            pr-10
            py-2.5
            text-sm
            outline-none
            border
            border-transparent
            focus:border-yellow-500/50
            focus:ring-2
            focus:ring-yellow-500/10
            transition
          "
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onClear?.();
              if (!onClear) onChange?.("");
            }}
            aria-label="Clear search"
            className="
              absolute
              right-2
              p-1.5
              rounded-lg
              text-slate-400
              hover:text-white
              hover:bg-slate-700
              transition
            "
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}