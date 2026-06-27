// import { useEffect, useState } from "react";
// import { supabase } from "../../supabaseClient";

// export default function Users() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     load();
//   }, []);

//   async function load() {
//     const { data } = await supabase
//       .from("profiles")
//       .select("*")
//       .order("created_at", { ascending: false });

//     setUsers(data || []);
//   }

//   async function banUser(id) {
//     await supabase.from("profiles").update({ banned: true }).eq("id", id);
//     load();
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">👤 Users</h1>

//       <div className="space-y-3">
//         {users.map((u) => (
//           <div
//             key={u.id}
//             className="bg-slate-800 p-4 rounded-xl flex justify-between items-center"
//           >
//             <div>
//               <p className="font-bold">{u.username || "No name"}</p>
//               <p className="text-slate-400 text-sm">{u.email}</p>
//             </div>

//             <button
//               onClick={() => banUser(u.id)}
//               className="bg-red-500 px-3 py-1 rounded"
//             >
//               Ban
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import AdminLayout from "../AdminLayout";
import useUsers from "../hooks/useUsers";
import UserRow from "../components/UserRow";

export default function Users() {
  const { users, banUser, changeRole } = useUsers();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      {users.map((u) => (
        <UserRow
          key={u.id}
          user={u}
          onBan={banUser}
          onRole={changeRole}
        />
      ))}
    </AdminLayout>
  );
}