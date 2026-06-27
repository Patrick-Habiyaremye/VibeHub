// export default function SuggestedSupporters() {

//   const users = [
//     {
//       id: 1,
//       name: "Sarah",
//     },
//     {
//       id: 2,
//       name: "John",
//     },
//     {
//       id: 3,
//       name: "Grace",
//     },
//   ];

//   return (
//     <div className="
//       bg-slate-800
//       rounded-xl
//       p-4
//       mb-6
//       border
//       border-slate-700
//     ">

//       <h3 className="text-white font-semibold mb-4">
//         Suggested Supporters 💛
//       </h3>

//       <div className="space-y-3">

//         {users.map((user) => (
//           <div
//             key={user.id}
//             className="
//               flex
//               justify-between
//               items-center
//             "
//           >

//             <span className="text-white">
//               {user.name}
//             </span>

//             <button
//               className="
//                 bg-yellow-500
//                 text-black
//                 px-3
//                 py-1
//                 rounded
//               "
//             >
//               Support
//             </button>

//           </div>
//         ))}

//       </div>

//     </div>
//   );
// }

// components/feed/SuggestedSupporters.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function SuggestedSupporters() {

  const [users, setUsers] =
    useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {

    const { data } =
      await supabase
        .from("profiles")
        .select("*")
        .limit(5);

    setUsers(data || []);
  }

  return (
    <div className="
      bg-slate-900
      rounded-xl
      p-4
      mb-6
    ">

      <h2 className="
        text-white
        font-bold
        mb-4
      ">
        Suggested Supporters 🤝
      </h2>

      {users.map((user) => (

        <div
          key={user.id}
          className="
            flex
            items-center
            justify-between
            mb-3
          "
        >

          <div>

            <p className="text-white">
              {user.username}
            </p>

            <p className="
              text-xs
              text-slate-400
            ">
              {user.kindness_score || 0}
              {" "}
              Kindness Points
            </p>

          </div>

          <button
            className="
              bg-yellow-500
              px-3
              py-1
              rounded
              text-black
            "
          >
            Support
          </button>

        </div>

      ))}

    </div>
  );
}