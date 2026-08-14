// pages/Users.jsx
import { useState } from "react";
import useUsers from "../hooks/useUsers";
import UserRow from "../components/UserRow";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorBanner from "../components/ErrorBanner";

export default function Users() {
  const {
    users,
    total,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    loading,
    error,
    load,
    banUser,
    unbanUser,
    changeRole,
  } = useUsers();

  const [pendingBan, setPendingBan] = useState(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <ErrorBanner message={error} onRetry={load} />

      <input
        type="text"
        value={search}
        onChange={(e) => {
          setPage(0);
          setSearch(e.target.value);
        }}
        placeholder="Search by username or email..."
        className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 mb-4"
      />

      {loading ? (
        <div className="text-slate-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-slate-400">No users found.</div>
      ) : (
        users.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            onBan={setPendingBan}
            onUnban={unbanUser}
            onRole={changeRole}
          />
        ))
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingBan}
        title="Ban this user?"
        description={
          pendingBan &&
          `${pendingBan.username} won't be able to log in until an admin unbans them.`
        }
        confirmLabel="Ban user"
        danger
        onConfirm={() => {
          banUser(pendingBan.id);
          setPendingBan(null);
        }}
        onCancel={() => setPendingBan(null)}
      />
    </>
  );
}
