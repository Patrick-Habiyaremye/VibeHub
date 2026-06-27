// import {
//   Search,
//   MessageCircle,
// } from "lucide-react";

// import { useState } from "react";

// export default function ChatSidebar({
//   selectedChat,
//   onSelect,
// }) {

//   const [search, setSearch] =
//     useState("");

//   const chats = [
//     {
//       id: 1,
//       username: "Alice",
//       lastMessage:
//         "You inspired me today 😊",
//       unread: 2,
//     },
//     {
//       id: 2,
//       username: "John",
//       lastMessage:
//         "Great challenge 🌟",
//       unread: 0,
//     },
//   ];

//   const filtered =
//     chats.filter(chat =>
//       chat.username
//         .toLowerCase()
//         .includes(
//           search.toLowerCase()
//         )
//     );

//   return (
//     <div
//       className="
//       w-full
//       md:w-80
//       border-r
//       border-slate-800
//       bg-slate-900
//       flex
//       flex-col
//       "
//     >
//       <div className="p-4">

//         <h2
//           className="
//           text-xl
//           font-bold
//           text-white
//           flex
//           items-center
//           gap-2
//           "
//         >
//           <MessageCircle size={22}/>
//           Messages
//         </h2>

//       </div>

//       <div className="px-4 pb-4">

//         <div
//           className="
//           flex
//           items-center
//           bg-slate-800
//           rounded-xl
//           px-3
//           "
//         >
//           <Search
//             size={18}
//             className="text-slate-500"
//           />

//           <input
//             value={search}
//             onChange={(e)=>
//               setSearch(e.target.value)
//             }
//             placeholder="Search..."
//             className="
//             flex-1
//             bg-transparent
//             p-3
//             text-white
//             outline-none
//             "
//           />
//         </div>

//       </div>

//       <div className="flex-1 overflow-y-auto">

//         {filtered.map(chat => (

//           <button
//             key={chat.id}
//             onClick={() =>
//               onSelect(chat)
//             }
//             className={`
//             w-full
//             text-left
//             p-4
//             border-b
//             border-slate-800

//             hover:bg-slate-800

//             ${
//               selectedChat?.id ===
//               chat.id
//                 ? "bg-slate-800"
//                 : ""
//             }
//             `}
//           >

//             <div
//               className="
//               flex
//               justify-between
//               items-center
//               "
//             >
//               <h3
//                 className="
//                 text-white
//                 font-semibold
//                 "
//               >
//                 {chat.username}
//               </h3>

//               {chat.unread > 0 && (
//                 <span
//                   className="
//                   bg-yellow-500
//                   text-black
//                   text-xs
//                   px-2
//                   py-1
//                   rounded-full
//                   "
//                 >
//                   {chat.unread}
//                 </span>
//               )}
//             </div>

//             <p
//               className="
//               text-sm
//               text-slate-400
//               mt-1
//               truncate
//               "
//             >
//               {chat.lastMessage}
//             </p>

//           </button>

//         ))}
//       </div>
//     </div>
//   );
// }

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import ConversationItem from "./ConversationItem";

// YOU WILL IMPLEMENT THIS HOOK NEXT
import useConversation from "../../hooks/useConversation";
import useRealtime from "../../hooks/useRealtime";

export default function ChatSidebar({
  user,
  selectedConversation,
  onSelect,
}) {
  const [search, setSearch] = useState("");

  useRealtime({
  table: "messages",
  event: "INSERT",
  enabled: !!user?.id,
  onChange: async () => {
    // refresh conversations when any message is sent
    loadConversations();
  },
});

useRealtime({
  table: "messages",
  event: "UPDATE",
  enabled: !!user?.id,
  onChange: () => {
    loadConversations(); // updates unread counts + last message
  },
});

  /**
   * REAL DATA SOURCE
   * replaces fake array completely
   */
  const {
    conversations = [],
    loading,
  } = useConversation(user?.id);

  /**
   * SEARCH FILTER
   */
  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;

    return conversations.filter((c) =>
      c.username?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, conversations]);

  return (
    <div className="h-full flex flex-col bg-slate-900">

      {/* ================= HEADER ================= */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-white text-xl font-bold">
          Messages
        </h2>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center bg-slate-800 rounded-xl px-3">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-transparent text-white px-3 py-2 outline-none"
          />
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className="flex-1 overflow-y-auto">

        {/* LOADING STATE */}
        {loading && (
          <div className="p-4 text-slate-400 text-sm">
            Loading conversations...
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredConversations.length === 0 && (
          <div className="p-4 text-slate-500 text-sm">
            No conversations yet 💬
          </div>
        )}

        {/* CONVERSATIONS */}
        {filteredConversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            selected={selectedConversation?.id === conv.id}
            onClick={() => onSelect(conv)}
          />
        ))}
      </div>
    </div>
  );
}