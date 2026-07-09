import { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical } from "lucide-react";

export default function ReelMenu({
  onEdit,
  onDelete,
  onReport,
  isOwner = false,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // --------------------------
  // Close on outside click
  // --------------------------
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        close();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  return (
    <div
      ref={menuRef}
      className="absolute top-4 right-4 z-30"
    >
      {/* TRIGGER */}
      <button
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
        className="
          text-white
          p-2
          rounded-full
          hover:bg-white/10
          transition
        "
      >
        <MoreVertical size={20} />
      </button>

      {/* MENU */}
      {open && (
        <div
          role="menu"
          className="
            mt-2
            w-40
            bg-black/90
            backdrop-blur
            border border-white/10
            rounded-lg
            shadow-lg
            overflow-hidden
          "
        >
          {isOwner ? (
            <>
              <MenuItem onClick={onEdit} label="Edit" />
              <MenuItem onClick={onDelete} label="Delete" danger />
            </>
          ) : (
            <MenuItem onClick={onReport} label="Report" danger />
          )}
        </div>
      )}
    </div>
  );
}

// --------------------------
// Menu Item (isolated for reuse)
// --------------------------
function MenuItem({ onClick, label, danger }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`
        w-full text-left px-4 py-2 text-sm
        transition
        ${danger ? "text-red-400 hover:bg-red-500/10" : "text-white hover:bg-white/10"}
      `}
    >
      {label}
    </button>
  );
}