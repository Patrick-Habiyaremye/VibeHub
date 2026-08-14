import { useEffect } from "react";
import { subscribeToMessages } from "../realtime/MessageRealtime";

export default function useMessageRealtime({
  conversationId,
  onInsert,
  onUpdate,
  onDelete,
}) {
  useEffect(() => {
    if (!conversationId) return;

    return subscribeToMessages({
      conversationId,
      onInsert,
      onUpdate,
      onDelete,
    });
  }, [
    conversationId,
    onInsert,
    onUpdate,
    onDelete,
  ]);
}