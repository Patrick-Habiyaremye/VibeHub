// features/messaging/hooks/useConversation.js

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getOrCreateConversation,
} from "../api/conversations.api";

export default function useConversation(
  otherUserId
) {
  const [conversation, setConversation] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const openConversation =
    useCallback(async () => {
      if (!otherUserId) {
        setConversation(null);
        return null;
      }

      setLoading(true);

      try {
        const result =
          await getOrCreateConversation(
            otherUserId
          );

        setConversation(result);

        return result;
      } finally {
        setLoading(false);
      }
    }, [otherUserId]);

  useEffect(() => {
    openConversation();
  }, [openConversation]);

  return {
    conversation,
    loading,
    openConversation,
  };
}