// import { supabase } from "../../../supabaseClient";

// export function subscribeToMessages({
//   conversationId,
//   onInsert,
//   onUpdate,
//   onDelete,
// }) {
//   if (!conversationId) return () => {};

//   const channel = supabase
//     .channel(
//       `messaging:conversation:${conversationId}`
//     )
//     .on(
//       "postgres_changes",
//       {
//         event: "INSERT",
//         schema: "public",
//         table: "messages",
//         filter: `conversation_id=eq.${conversationId}`,
//       },
//       (payload) => {
//         onInsert?.(payload.new);
//       }
//     )
//     .on(
//       "postgres_changes",
//       {
//         event: "UPDATE",
//         schema: "public",
//         table: "messages",
//         filter: `conversation_id=eq.${conversationId}`,
//       },
//       (payload) => {
//         onUpdate?.(payload.new);
//       }
//     )
//     .on(
//       "postgres_changes",
//       {
//         event: "DELETE",
//         schema: "public",
//         table: "messages",
//         filter: `conversation_id=eq.${conversationId}`,
//       },
//       (payload) => {
//         onDelete?.(payload.old);
//       }
//     )
//     .subscribe();

//   return () => {
//     supabase.removeChannel(channel);
//   };
// }

// features/messaging/realtime/MessageRealtime.js

import { supabase } from "../../../supabaseClient";

export function subscribeToMessages(
  conversationId,
  callback
) {
  if (!conversationId) return () => {};

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}