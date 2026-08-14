import { useEffect, useRef } from "react";
import NotificationItem from "./NotificationItem";

export default function NotificationModal({
  open,
  onClose,
  notifications = [],
  onRead,
  onDelete,
  onReadAll,
}) {
  const closeBtnRef = useRef(null);

  // Send focus into the modal when it opens (keyboard/screen-reader users)
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-center items-end md:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 w-full md:w-[400px] h-[80%] md:h-auto md:max-h-[80vh] rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 id="notification-modal-title" className="font-bold text-white">
            Notifications
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={onReadAll} className="text-sm text-yellow-400 hover:text-yellow-300">
              Mark all read
            </button>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close notifications"
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[max(env(safe-area-inset-bottom),0px)]">
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-slate-400">No notifications</p>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={onRead} onDelete={onDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}