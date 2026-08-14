// src/features/messaging/index.js

export * from "./api/messaging.api";

export {
  default as MessagingShell,
} from "./components/MessagingShell";

export {
  default as ConversationList,
} from "./components/ConversationList";

export {
  default as ConversationListItem,
} from "./components/ConversationListItem";

export {
  default as ChatWindow,
} from "./components/ChatWindow";

export {
  default as ChatHeader,
} from "./components/ChatHeader";

export {
  default as MessageList,
} from "./components/MessageList";

export {
  default as MessageBubble,
} from "./components/MessageBubble";

export {
  default as MessageComposer,
} from "./components/MessageComposer";

export {
  default as useConversations,
} from "./hooks/useConversations";

export {
  default as useConversation,
} from "./hooks/useConversation";

export {
  default as useMessages,
} from "./hooks/useMessages";

export {
  default as useTyping,
} from "./hooks/useTyping";

export {
  default as usePresence,
} from "./hooks/usePresence";