import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  async function loadUsers() {
    const { data } = await supabase.from("profiles").select("*");
    setUsers(data || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function banUser(id, banned) {
    await supabase
      .from("profiles")
      .update({ is_banned: !banned })
      .eq("id", id);

    loadUsers();
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Users</h1>

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-slate-800 p-3 rounded flex justify-between"
          >
            <div>
              <p>{u.full_name || "No name"}</p>
              <p className="text-sm text-slate-400">{u.role}</p>
            </div>

            <button
              onClick={() => banUser(u.id, u.is_banned)}
              className={`px-3 py-1 rounded ${
                u.is_banned
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {u.is_banned ? "Unban" : "Ban"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}