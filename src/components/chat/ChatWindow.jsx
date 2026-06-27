// // features/chat/ChatWindow.jsx

// import {
//   useEffect,
//   useState,
//   useRef,
//   useCallback,
// } from "react";

// import {
//   getMessages,
//   sendMessage,
//   markConversationSeen,
// } from "../../api/messages";

// import useMessages
// from "../../hooks/useMessages";

// import MessageBubble
// from "./MessageBubble";

// import MessageInput
// from "./MessageInput";

// export default function ChatWindow({
//   user,
//   receiver,
// }) {

//   const [messages, setMessages] =
//     useState([]);

//   const [text, setText] =
//     useState("");

//   const [loading, setLoading] =
//     useState(true);

//   const bottomRef =
//     useRef(null);

//   const containerRef =
//     useRef(null);

//   const loadMessages =
//     useCallback(async () => {

//       if (
//         !user?.id ||
//         !receiver?.id
//       ) {
//         return;
//       }

//       try {

//         setLoading(true);

//         const data =
//           await getMessages(
//             user.id,
//             receiver.id
//           );

//         setMessages(data || []);

//       } catch (err) {

//         console.error(
//           "Failed to load messages",
//           err
//         );

//       } finally {

//         setLoading(false);

//       }

//     }, [
//       user?.id,
//       receiver?.id,
//     ]);

//   useEffect(() => {

//     loadMessages();

//   }, [loadMessages]);

//   useMessages({

//     userId:
//       user?.id,

//     receiverId:
//       receiver?.id,

//     onMessage: (msg) => {

//       setMessages(prev => {

//         const exists =
//           prev.some(
//             m =>
//               m.id === msg.id
//           );

//         if (exists)
//           return prev;

//         return [
//           ...prev,
//           msg,
//         ];

//       });

//     },

//   });

//   useEffect(() => {

//     if (
//       !user?.id ||
//       !receiver?.id
//     ) {
//       return;
//     }

//     markConversationSeen(
//       receiver.id,
//       user.id
//     );

//   }, [
//     user?.id,
//     receiver?.id,
//     messages.length,
//   ]);

//   const shouldAutoScroll =
//     () => {

//       const el =
//         containerRef.current;

//       if (!el) {
//         return true;
//       }

//       return (
//         el.scrollHeight -
//           el.scrollTop -
//           el.clientHeight <
//         150
//       );

//     };

//   useEffect(() => {

//     if (
//       shouldAutoScroll()
//     ) {

//       bottomRef.current
//         ?.scrollIntoView({
//           behavior:
//             "smooth",
//         });

//     }

//   }, [messages]);

//   const handleSend =
//     async () => {

//       if (
//         !text.trim() ||
//         !receiver
//       ) {
//         return;
//       }

//       try {

//         await sendMessage(
//           user.id,
//           receiver.id,
//           text.trim()
//         );

//         setText("");

//       } catch (err) {

//         console.error(
//           "Failed to send",
//           err
//         );

//       }

//     };

//   if (!receiver) {

//     return (

//       <div
//         className="
//         flex
//         items-center
//         justify-center
//         h-full
//         bg-slate-950
//         text-slate-500
//         "
//       >
//         Select a conversation 💛
//       </div>

//     );

//   }

//   if (loading) {

//     return (

//       <div
//         className="
//         flex
//         items-center
//         justify-center
//         h-full
//         bg-slate-950
//         text-slate-400
//         "
//       >
//         Loading messages...
//       </div>

//     );

//   }

//   return (

//     <div
//       className="
//       flex
//       flex-col
//       h-full
//       "
//     >

//       {/* Header */}

//       <div
//         className="
//         p-4
//         border-b
//         border-slate-800
//         bg-slate-900
//         sticky
//         top-0
//         z-10
//         "
//       >

//         <div
//           className="
//           flex
//           items-center
//           gap-3
//           "
//         >

//           <div
//             className="
//             w-10
//             h-10
//             rounded-full
//             bg-slate-700
//             "
//           />

//           <div>

//             <h2
//               className="
//               text-white
//               font-bold
//               "
//             >
//               {receiver.username}
//             </h2>

//             <p
//               className="
//               text-xs
//               text-slate-400
//               "
//             >
//               Supporter
//             </p>

//           </div>

//         </div>

//       </div>

//       {/* Messages */}

//       <div
//         ref={containerRef}
//         className="
//         flex-1
//         overflow-y-auto
//         p-4
//         space-y-3
//         bg-slate-950
//         "
//       >

//         {messages.length === 0 && (

//           <div
//             className="
//             flex
//             items-center
//             justify-center
//             h-full
//             text-slate-500
//             "
//           >
//             Start your conversation 💛
//           </div>

//         )}

//         {messages.map(msg => (

//           <MessageBubble
//             key={msg.id}
//             message={msg}
//             mine={
//               msg.sender_id ===
//               user.id
//             }
//           />

//         ))}

//         <div ref={bottomRef} />

//       </div>

//       {/* Input */}

//       <div
//         className="
//         p-4
//         border-t
//         border-slate-800
//         bg-slate-900
//         "
//       >

//         <MessageInput
//           value={text}
//           setValue={setText}
//           onSend={handleSend}
//         />

//       </div>

//     </div>

//   );

// }

// 

import { useEffect, useState, useCallback, useRef } from "react";

import {
  getMessages,
  sendMessage,
  markConversationSeen,
} from "../../api/messages";

import useRealtime from "../../hooks/useRealtime";
import useTyping from "../../hooks/useTyping";

import ConversationHeader from "./ConversationHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ReplyPreview from "./ReplyPreview";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({
  user,
  receiver,
  onBack,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);

  const lastSeenRef = useRef(0);

  const conversationKey =
    user?.id && receiver?.id
      ? [user.id, receiver.id].sort().join("-")
      : null;

  // -----------------------------
  // TYPING SYSTEM
  // -----------------------------
  const { typingUsers, startTyping } = useTyping({
    conversationKey,
    userId: user?.id,
  });

  const filteredTypingUsers = typingUsers.filter(
    (u) => u.user_id !== user?.id
  );

  // -----------------------------
  // LOAD MESSAGES
  // -----------------------------
  const loadMessages = useCallback(async () => {
    if (!user?.id || !receiver?.id) return;

    setLoading(true);

    try {
      const data = await getMessages(user.id, receiver.id);
      setMessages(data || []);
    } catch (err) {
      console.error("Load messages error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, receiver?.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // -----------------------------
  // REALTIME MESSAGES
  // -----------------------------
  useRealtime({
    table: "messages",
    event: "INSERT",
    enabled: !!user?.id && !!receiver?.id,

    onChange: (payload) => {
      const msg = payload.new;

      const belongsToChat =
        (msg.sender_id === user.id && msg.receiver_id === receiver.id) ||
        (msg.sender_id === receiver.id && msg.receiver_id === user.id);

      if (!belongsToChat) return;

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.id === msg.id ||
            (m.optimistic && m.content === msg.content)
        );

        if (exists) return prev;

        return [...prev, msg];
      });
    },
  });

  // -----------------------------
  // MARK AS SEEN (SAFE + THROTTLED)
  // -----------------------------
  useEffect(() => {
    if (!user?.id || !receiver?.id) return;

    const now = Date.now();

    if (now - lastSeenRef.current < 4000) return;

    lastSeenRef.current = now;

    markConversationSeen(receiver.id, user.id);
  }, [receiver?.id, user?.id]);

  // -----------------------------
  // SEND MESSAGE (OPTIMISTIC)
  // -----------------------------
  const handleSend = async () => {
    if (!text.trim() || !receiver) return;

    const tempMessage = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      receiver_id: receiver.id,
      content: text.trim(),
      created_at: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    try {
      await sendMessage(user.id, receiver.id, text.trim());
    } catch (err) {
      console.error("Send message failed:", err);

      // rollback optimistic message
      setMessages((prev) =>
        prev.filter((m) => !m.optimistic)
      );
    }
  };

  // -----------------------------
  // UI STATES
  // -----------------------------
  if (!receiver) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950 text-slate-500">
        Select a conversation 💬
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950 text-slate-400">
        Loading messages...
      </div>
    );
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex flex-col h-full bg-slate-950">

      {/* HEADER */}
      <ConversationHeader
        receiver={receiver}
        onBack={onBack}
        conversationKey={conversationKey}
      />

      {/* MESSAGES */}
      <MessageList
        messages={messages}
        user={user}
      />

      {/* TYPING INDICATOR */}
      {filteredTypingUsers.length > 0 && (
        <TypingIndicator typingUsers={filteredTypingUsers} />
      )}

      {/* INPUT */}
      <div className="p-3 border-t border-slate-800 bg-slate-900">

        <ReplyPreview
          replyTo={replyTo}
          onCancel={() => setReplyTo(null)}
        />

        <MessageInput
          value={text}
          setValue={setText}
          onSend={handleSend}
          onTyping={startTyping}
        />

      </div>
    </div>
  );
}