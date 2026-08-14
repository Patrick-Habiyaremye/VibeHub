// import {
//   useCallback,
//   useEffect,
//   useState,
// } from "react";

// import { getMessages } from "../api/messages.api";
// import normalizeMessage from "../normalizers/normalizeMessage";

// export default function useMessages(conversationId) {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingOlder, setLoadingOlder] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   const loadInitial = useCallback(async () => {
//     if (!conversationId) {
//       setMessages([]);
//       return;
//     }

//     setLoading(true);

//     try {
//       const data = await getMessages({
//         conversationId,
//         limit: 50,
//       });

//       const normalized =
//         data.map(normalizeMessage);

//       setMessages(normalized);
//       setHasMore(data.length === 50);
//     } finally {
//       setLoading(false);
//     }
//   }, [conversationId]);

//   const loadOlder = useCallback(async () => {
//     if (
//       !conversationId ||
//       loadingOlder ||
//       !hasMore ||
//       !messages.length
//     ) {
//       return;
//     }

//     setLoadingOlder(true);

//     try {
//       const oldest = messages[0];

//       const data = await getMessages({
//         conversationId,
//         limit: 50,
//         before: oldest.createdAt,
//       });

//       const normalized =
//         data.map(normalizeMessage);

//       setMessages((current) => [
//         ...normalized,
//         ...current,
//       ]);

//       setHasMore(data.length === 50);
//     } finally {
//       setLoadingOlder(false);
//     }
//   }, [
//     conversationId,
//     loadingOlder,
//     hasMore,
//     messages,
//   ]);

//   useEffect(() => {
//     loadInitial();
//   }, [loadInitial]);

//   const addMessage = useCallback((message) => {
//     setMessages((current) => {
//       if (
//         current.some(
//           (item) => item.id === message.id
//         )
//       ) {
//         return current;
//       }

//       return [
//         ...current,
//         normalizeMessage(message),
//       ];
//     });
//   }, []);

//   const replaceOptimistic = useCallback(
//     (optimisticId, serverMessage) => {
//       setMessages((current) =>
//         current.map((message) =>
//           message.id === optimisticId
//             ? normalizeMessage(serverMessage)
//             : message
//         )
//       );
//     },
//     []
//   );

//   const removeMessage = useCallback(
//     (id) => {
//       setMessages((current) =>
//         current.filter(
//           (message) => message.id !== id
//         )
//       );
//     },
//     []
//   );

//   return {
//     messages,
//     loading,
//     loadingOlder,
//     hasMore,
//     loadOlder,
//     addMessage,
//     replaceOptimistic,
//     removeMessage,
//     reload: loadInitial,
//   };
// }

// features/messaging/hooks/useMessages.js

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMessages,
  markConversationSeen,
} from "../api/messages.api";

import {
  subscribeToMessages,
} from "../realtime/MessageRealtime";

export default function useMessages({
  conversationId,
  userId,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);

    try {
      const data =
        await getMessages(conversationId);

      setMessages(data);
    } catch (error) {
      console.error(
        "[useMessages]",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!conversationId) return;

    return subscribeToMessages(
      conversationId,
      async (payload) => {
        if (payload.eventType === "INSERT") {
          const message = payload.new;

          setMessages((current) => {
            if (
              current.some(
                (item) =>
                  item.id === message.id
              )
            ) {
              return current;
            }

            return [
              ...current,
              message,
            ];
          });

          if (
            message.receiver_id === userId
          ) {
            await markConversationSeen(
              conversationId,
              userId
            );
          }
        }

        if (payload.eventType === "UPDATE") {
          setMessages((current) =>
            current.map((message) =>
              message.id === payload.new.id
                ? {
                    ...message,
                    ...payload.new,
                  }
                : message
            )
          );
        }

        if (payload.eventType === "DELETE") {
          setMessages((current) =>
            current.filter(
              (message) =>
                message.id !==
                payload.old.id
            )
          );
        }
      }
    );
  }, [
    conversationId,
    userId,
  ]);

  return {
    messages,
    loading,
    reload: loadMessages,
  };
}