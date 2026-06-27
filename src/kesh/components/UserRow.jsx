// components/UserRow.jsx

// 

export default function UserRow({ user, onBan, onRole }) {
  return (
    <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg mb-2">
      <div>
        <div className="text-white">{user.username}</div>
        <div className="text-slate-400 text-xs">{user.email}</div>
      </div>

      <div className="flex gap-2">
        <select
          value={user.role || "user"}
          onChange={(e) => onRole(user.id, e.target.value)}
          className="bg-slate-700 text-white px-2 py-1 rounded"
        >
          <option>user</option>
          <option>moderator</option>
          <option>admin</option>
        </select>

        <button
          onClick={() => onBan(user.id)}
          className="bg-red-500 px-3 py-1 rounded text-white"
        >
          Ban
        </button>
      </div>
    </div>
  );
}