import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import NotificationBadge from "./NotificationBadge";
import NotificationDropdown from "./NotificationDropdown";
import NotificationModal from "./NotificationModal";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, loading, handleRead, handleDelete, handleReadAll } = useNotifications();

  // Close on outside click (desktop dropdown)
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape (keyboard users — matters most on small screens with no mouse)
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  // Lock background scroll while the mobile modal is open
  useEffect(() => {
    if (!open) return;
    const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobileViewport) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Notifications only apply to signed-in users
  if (!user) return null;

  return (
    <div className="relative z-50" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-slate-300 hover:text-white"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <Bell size={22} />
        <NotificationBadge count={unreadCount} />
      </button>

      {open && (
        <div className="hidden md:block">
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            loading={loading}
            onRead={handleRead}
            onDelete={handleDelete}
            onReadAll={handleReadAll}
          />
        </div>
      )}

      <div className="md:hidden">
        <NotificationModal
          open={open}
          onClose={() => setOpen(false)}
          notifications={notifications}
          onRead={handleRead}
          onDelete={handleDelete}
          onReadAll={handleReadAll}
        />
      </div>
    </div>
  );
}