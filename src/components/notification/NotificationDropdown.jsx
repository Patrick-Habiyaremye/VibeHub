import { useAuth } from "../../context/AuthContext";
import useNotifications from "../../hooks/useNotifications";
import NotificationItem from "./NotificationItem";

export default function NotificationDropdown() {
  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    loading,
    handleRead,
    handleDelete,
    handleReadAll,
  } = useNotifications(user);

  if (!notifications) return null;
  if (error) {
  console.error(error);
  return <div>Error loading notifications</div>;
}

  return (
    <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-xl border border-slate-700 shadow-lg z-50 overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-white font-bold">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </h3>

        <button
          onClick={handleReadAll}
          className="text-sm text-yellow-400 hover:text-yellow-300"
        >
          Mark all read
        </button>
      </div>

      {/* BODY */}
      <div className="max-h-96 overflow-y-auto">

        {loading && (
          <div className="p-4 text-slate-400 text-center">
            Loading...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-6 text-center text-slate-400">
            No notifications yet 😊
          </div>
        )}

        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={handleRead}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}