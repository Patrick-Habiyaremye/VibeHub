// src/features/messaging/realtime/TypingRealtime.js

import { supabase } from "../../../supabaseClient";

export default class TypingRealtime {
  constructor({
    conversationKey,
    onChange,
  } = {}) {
    this.conversationKey = conversationKey;
    this.onChange = onChange;
    this.channel = null;
  }

  subscribe() {
    if (!this.conversationKey) {
      return () => {};
    }

    this.channel = supabase
      .channel(
        `messaging-typing-${this.conversationKey}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
          filter:
            `conversation_key=eq.${this.conversationKey}`,
        },
        (payload) => {
          const typing = payload.new;

          if (!typing?.user_id) {
            return;
          }

          this.onChange?.(typing, payload);
        }
      )
      .subscribe();

    return () => this.unsubscribe();
  }

  unsubscribe() {
    if (!this.channel) return;

    supabase.removeChannel(this.channel);
    this.channel = null;
  }
}