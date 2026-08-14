import NotificationItem from "./NotificationItem";

export default function NotificationDropdown({
  notifications=[],
  unreadCount,
  loading,
  onRead,
  onDelete,
  onReadAll,
}) {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-xl border border-slate-700 shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-white font-bold">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </h3>
        <button onClick={onReadAll} className="text-sm text-yellow-400 hover:text-yellow-300">
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading && <div className="p-4 text-slate-400 text-center">Loading...</div>}
        {!loading && notifications.length === 0 && (
          <div className="p-6 text-center text-slate-400">No notifications yet 😊</div>
        )}
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={onRead} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}