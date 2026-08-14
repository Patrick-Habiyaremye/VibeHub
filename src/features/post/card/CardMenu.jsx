import { useState, useRef, useEffect, useCallback } from "react";
import {
  MoreHorizontal,
  Bookmark,
  Flag,
  Copy,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";

export default function CardMenu({
  canDelete = false,
  onDelete,
  onSave,
  onReport,
  postId,
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const menuRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  /* ----------------------------------------
     OUTSIDE CLICK + ESC
  ---------------------------------------- */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
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

  /* ----------------------------------------
     SAFE ACTION RUNNER (ANTI-SPAM)
  ---------------------------------------- */
  const runAction = async (name, fn) => {
    if (!fn || loadingAction) return;

    try {
      setLoadingAction(name);
      await fn();
      close();
    } catch (err) {
      console.error(`${name} failed:`, err);
      alert("Something went wrong.");
    } finally {
      setLoadingAction(null);
    }
  };

  /* ----------------------------------------
     COPY LINK (IMPROVED UX)
  ---------------------------------------- */
  const copyLink = async () => {
    if (!postId) return;

    try {
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);

      setCopied(true);

      // reset state cleanly
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Failed to copy link");
    }

    setTimeout(close, 500);
  };

  /* ----------------------------------------
     DELETE (WITH HARD LOCK)
  ---------------------------------------- */
  const handleDelete = () => {
    if (loadingAction) return;
    runAction("delete", onDelete);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER */}
      <button
        onClick={() => setOpen((s) => !s)}
        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={20} />
      </button>

      {/* MENU */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden z-50"
          role="menu"
        >
          {/* 1. SAVE */}
          <MenuItem
            icon={
              loadingAction === "save" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Bookmark size={18} />
              )
            }
            label="Save post"
            onClick={() => runAction("save", onSave)}
            disabled={!!loadingAction}
          />

          {/* 2. COPY LINK */}
          <MenuItem
            icon={copied ? <Check size={18} /> : <Copy size={18} />}
            label={copied ? "Link copied" : "Copy link"}
            onClick={copyLink}
          />

          {/* 3. DELETE (owner only) */}
          {canDelete && (
            <MenuItem
              icon={
                loadingAction === "delete" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )
              }
              label={
                loadingAction === "delete" ? "Deleting..." : "Delete"
              }
              danger
              disabled={!!loadingAction}
              onClick={handleDelete}
            />
          )}

          {/* 4. REPORT (last) */}
          <MenuItem
            icon={
              loadingAction === "report" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Flag size={18} />
              )
            }
            label="Report"
            onClick={() => runAction("report", onReport)}
            disabled={!!loadingAction}
          />
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------
   MENU ITEM (HARDENED)
---------------------------------------- */
function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      role="menuitem"
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition
        ${danger ? "text-red-400" : "text-slate-200"}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-slate-800 active:scale-[0.98]"
        }
      `}
    >
      {icon}
      <span className="flex-1">{label}</span>
    </button>
  );
}