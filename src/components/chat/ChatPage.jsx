// import { useState } from "react";
// import { ArrowLeft } from "lucide-react";

// import { useAuth } from "../../context/AuthContext";

// import ChatSidebar from "./ChatSidebar";
// import ChatWindow from "./ChatWindow";

// export default function ChatPage() {
//   const { user } = useAuth();

//   const [selectedConversation, setSelectedConversation] =
//     useState(null);

//   const [showConversation, setShowConversation] =
//     useState(false);

//   const handleSelectConversation = (
//     conversation
//   ) => {
//     setSelectedConversation(conversation);

//     setShowConversation(true);
//   };

//   const handleBack = () => {
//     setShowConversation(false);
//   };

//   return (
//     <div
//       className="
//       h-[calc(100vh-64px)]
//       bg-slate-950
//       flex
//       overflow-hidden
//       "
//     >
//       {/* ==========================
//             Desktop Sidebar
//       ========================== */}

//       <div
//         className={`
//         hidden
//         md:flex
//         w-80
//         border-r
//         border-slate-800
//         `}
//       >
//         <ChatSidebar
//           user={user}
//           selectedChat={selectedConversation}
//           onSelect={handleSelectConversation}
//         />
//       </div>

//       {/* ==========================
//             Mobile Sidebar
//       ========================== */}

//       {!showConversation && (
//         <div
//           className="
//           md:hidden
//           w-full
//           "
//         >
//           <ChatSidebar
//             user={user}
//             selectedChat={selectedConversation}
//             onSelect={handleSelectConversation}
//           />
//         </div>
//       )}

//       {/* ==========================
//             Desktop Chat
//       ========================== */}

//       <div
//         className="
//         hidden
//         md:flex
//         flex-1
//         "
//       >
//         <ChatWindow
//           user={user}
//           receiver={selectedConversation}
//         />
//       </div>

//       {/* ==========================
//             Mobile Chat
//       ========================== */}

//       {showConversation && (
//         <div
//           className="
//           md:hidden
//           w-full
//           flex
//           flex-col
//           "
//         >
//           {/* Mobile Header */}

//           <div
//             className="
//             h-16
//             bg-slate-900
//             border-b
//             border-slate-800
//             flex
//             items-center
//             px-4
//             "
//           >
//             <button
//               onClick={handleBack}
//               className="
//               mr-3
//               text-white
//               "
//             >
//               <ArrowLeft size={22} />
//             </button>

//             <h2
//               className="
//               text-white
//               font-semibold
//               "
//             >
//               {selectedConversation?.username}
//             </h2>
//           </div>

//           <div className="flex-1">
//             <ChatWindow
//               user={user}
//               receiver={selectedConversation}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// 

import { useEffect, useState, useCallback } from "react";

import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import useRealtime from "../../hooks/useRealtime"

import { supabase } from "../../supabaseClient";

export default function ChatPage({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mobileView, setMobileView] = useState("sidebar"); // sidebar | chat

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

  // 📥 Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("conversations_view") // recommended VIEW
      .select("*")
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setConversations(data || []);
  }, [user?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 📱 handle mobile selection
  const handleSelect = (conversation) => {
    setSelected(conversation);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("sidebar");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">

      {/* 📂 SIDEBAR */}
      <div
        className={`
          w-full md:w-80 border-r border-slate-800
          ${mobileView === "chat" ? "hidden md:flex" : "flex"}
          flex-col
        `}
      >
        <ChatSidebar
          conversations={conversations}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {/* 💬 CHAT WINDOW */}
      <div
        className={`
          flex-1
          ${mobileView === "sidebar" ? "hidden md:flex" : "flex"}
        `}
      >
        <ChatWindow
          user={user}
          receiver={selected}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}v