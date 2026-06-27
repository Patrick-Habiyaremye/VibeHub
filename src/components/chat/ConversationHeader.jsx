// import usePresence from "../../hooks/usePresence";
// import useTyping from "../../hooks/useTyping";

// export default function ConversationHeader({

// receiver,

// conversationKey

// }){

// const online =
// usePresence(receiver.id);

// const typing =
// useTyping({

// conversationKey

// });

// return(

// <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">

// <div className="flex items-center gap-3">

// <img

// src={
// receiver.avatar_url ||
// "/avatar.png"
// }

// className="w-11 h-11 rounded-full object-cover"
// />

// <div>

// <h2 className="text-white font-semibold">

// {receiver.username}

// </h2>

// <p className="text-xs text-slate-400">

// {

// typing

// ?

// "Typing..."

// :

// online

// ?

// "Online"

// :

// receiver.last_seen

// ?

// `Last seen ${receiver.last_seen}`

// :

// "Offline"

// }

// </p>

// </div>

// </div>

// </div>

// );

// }

import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import usePresence from "../../hooks/usePresence";
import useTyping from "../../hooks/useTyping";

export default function ConversationHeader({
  receiver,
  onBack,
  conversationKey, // unique key: `${userId}-${receiverId}`
}) {
  const isOnline = usePresence(receiver?.id);

//   const isTyping = useTyping({
//     conversationKey,
//   });
const { typingUsers } = useTyping({
  conversationKey,
  userId: receiver.id,
});

const isTyping = typingUsers.some(
  (u) => u.user_id === receiver.id
);

  if (!receiver) return null;

  return (
    <div
      className="
        flex items-center justify-between
        px-4 py-3
        border-b border-slate-800
        bg-slate-900
        sticky top-0 z-20
      "
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="md:hidden text-white"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-white font-bold">
            {receiver.avatar_url ? (
              <img
                src={receiver.avatar_url}
                alt={receiver.username}
                className="w-full h-full object-cover"
              />
            ) : (
              receiver.username?.charAt(0)?.toUpperCase()
            )}
          </div>

          {/* Online dot */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
          )}
        </div>

        {/* Name + status */}
        <div className="min-w-0">
          <h2 className="text-white font-semibold truncate">
            {receiver.username}
          </h2>

          {/* Status line */}
          <p className="text-xs text-slate-400">
            {isTyping ? (
              <span className="text-yellow-400 animate-pulse">
                typing...
              </span>
            ) : isOnline ? (
              "online"
            ) : (
              "offline"
            )}
          </p>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-3 text-slate-300">
        <button className="hover:text-white transition">
          <Phone size={18} />
        </button>

        <button className="hover:text-white transition">
          <Video size={18} />
        </button>

        <button className="hover:text-white transition">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}