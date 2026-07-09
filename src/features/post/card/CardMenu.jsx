import {
  MoreHorizontal,
  Bookmark,
  Flag,
  Copy,
  Trash2,
  Pencil,
} from "lucide-react";

import {
  useState,
  useRef,
  useEffect,
} from "react";

export default function CardMenu({
  canEdit = false,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] =
    useState(false);

  const menuRef =
    useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handler
      );
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      window.location.href
    );

    setOpen(false);
  };

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="
          p-2
          rounded-full
          hover:bg-slate-800
          transition
        "
      >
        <MoreHorizontal
          size={20}
        />
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            mt-2
            w-56
            rounded-xl
            border
            border-slate-700
            bg-slate-900
            shadow-xl
            overflow-hidden
            z-50
          "
        >

          <MenuItem
            icon={<Bookmark size={18} />}
            label="Save post"
          />

          <MenuItem
            icon={<Copy size={18} />}
            label="Copy link"
            onClick={copyLink}
          />

          <MenuItem
            icon={<Flag size={18} />}
            label="Report"
          />

          {canEdit && (
            <>
              <MenuItem
                icon={<Pencil size={18} />}
                label="Edit"
                onClick={onEdit}
              />

              <MenuItem
                icon={
                  <Trash2 size={18} />
                }
                label="Delete"
                danger
                onClick={onDelete}
              />
            </>
          )}

        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-3
        px-4
        py-3
        text-left
        transition
        hover:bg-slate-800
        ${
          danger
            ? "text-red-400"
            : "text-slate-200"
        }
      `}
    >
      {icon}

      <span>
        {label}
      </span>
    </button>
  );
}