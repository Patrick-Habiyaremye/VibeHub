// src/features/messaging/hooks/useReadReceipts.js

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../supabaseClient";

export default function useReadReceipts({
  messageIds = [],
  userId,
}) {
  const [receipts, setReceipts] =
    useState({});

  const loadReceipts = useCallback(
    async () => {
      if (!userId || !messageIds.length) {
        setReceipts({});
        return;
      }

      const { data, error } =
        await supabase
          .from("message_receipts")
          .select(
            "message_id,user_id,delivered_at,seen_at"
          )
          .in("message_id", messageIds);

      if (error) {
        console.error(
          "[useReadReceipts]",
          error
        );
        return;
      }

      const map = {};

      for (const receipt of data || []) {
        map[receipt.message_id] = receipt;
      }

      setReceipts(map);
    },
    [messageIds, userId]
  );

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(
        `message-receipts-${userId}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_receipts",
        },
        (payload) => {
          const receipt = payload.new;

          if (
            !receipt ||
            !messageIds.includes(
              receipt.message_id
            )
          ) {
            return;
          }

          setReceipts((previous) => ({
            ...previous,
            [receipt.message_id]:
              receipt,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageIds, userId]);

  const getReceipt = useCallback(
    (messageId) =>
      receipts[messageId] || null,
    [receipts]
  );

  return {
    receipts,
    getReceipt,
    reload: loadReceipts,
  };
}