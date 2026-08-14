// src/features/messaging/realtime/PresenceRealtime.js

import { supabase } from "../../../supabaseClient";

export default class PresenceRealtime {
  constructor({
    userId,
    onChange,
  } = {}) {
    this.userId = userId;
    this.onChange = onChange;
    this.channel = null;
  }

  subscribe() {
    if (!this.userId) {
      return () => {};
    }

    this.channel = supabase
      .channel(
        `messaging-presence-${this.userId}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter:
            `user_id=eq.${this.userId}`,
        },
        (payload) => {
          this.onChange?.(
            payload.new ?? payload.old ?? null,
            payload
          );
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