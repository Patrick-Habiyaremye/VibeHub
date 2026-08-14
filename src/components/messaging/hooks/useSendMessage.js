// features/messaging/hooks/useSendMessage.js

import {
  useCallback,
  useState,
} from "react";

import {
  sendMessage,
} from "../api/messages.api";

export default function useSendMessage({
  conversationId,
  senderId,
  receiverId,
  onOptimistic,
  onSuccess,
  onError,
}) {
  const [sending, setSending] =
    useState(false);

  const send = useCallback(
    async ({
      content,
      mediaUrl = null,
      mediaType = null,
    }) => {
      if (!conversationId) {
        throw new Error(
          "Conversation is required"
        );
      }

      const tempId =
        crypto.randomUUID();

      const optimisticMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content?.trim() || "",
        media_url: mediaUrl,
        media_type: mediaType,
        created_at:
          new Date().toISOString(),
        optimistic: true,
        sending: true,
      };

      onOptimistic?.(
        optimisticMessage
      );

      setSending(true);

      try {
        const message =
          await sendMessage({
            conversationId,
            senderId,
            receiverId,
            content,
            mediaUrl,
            mediaType,
          });

        onSuccess?.(
          optimisticMessage,
          message
        );

        return message;
      } catch (error) {
        onError?.(
          optimisticMessage,
          error
        );

        throw error;
      } finally {
        setSending(false);
      }
    },
    [
      conversationId,
      senderId,
      receiverId,
      onOptimistic,
      onSuccess,
      onError,
    ]
  );

  return {
    send,
    sending,
  };
}