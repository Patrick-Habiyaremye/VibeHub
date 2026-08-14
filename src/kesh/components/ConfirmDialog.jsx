// kesh/components/ConfirmDialog.jsx
//
// Generic confirm modal. Use before any destructive/irreversible admin action
// (ban, delete, role change to admin, etc).
//
// Usage:
//   const [pending, setPending] = useState(null); // e.g. { id, username }
//   <ConfirmDialog
//     open={!!pending}
//     title="Ban this user?"
//     description={`${pending?.username} won't be able to log in until unbanned.`}
//     confirmLabel="Ban user"
//     danger
//     onConfirm={() => { banUser(pending.id); setPending(null); }}
//     onCancel={() => setPending(null)}
//   />

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-white font-bold text-lg mb-2">
          {title}
        </h2>

        {description && (
          <p className="text-slate-400 text-sm mb-5">{description}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
