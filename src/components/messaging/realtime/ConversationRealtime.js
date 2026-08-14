// src/features/messaging/realtime/ConversationRealtime.js

import { supabase } from "../../../supabaseClient";

export default class ConversationRealtime {
  constructor({
    userId,
    onInsert,
    onUpdate,
    onDelete,
  } = {}) {
    this.userId = userId;
    this.onInsert = onInsert;
    this.onUpdate = onUpdate;
    this.onDelete = onDelete;
    this.channel = null;
  }

  subscribe() {
    if (!this.userId) {
      return () => {};
    }

    const filterOne =
      `user1_id=eq.${this.userId}`;

    const filterTwo =
      `user2_id=eq.${this.userId}`;

    this.channel = supabase
      .channel(
        `messaging-conversations-${this.userId}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: filterOne,
        },
        (payload) => {
          this.onInsert?.(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: filterTwo,
        },
        (payload) => {
          this.onInsert?.(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: filterOne,
        },
        (payload) => {
          this.onUpdate?.(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: filterTwo,
        },
        (payload) => {
          this.onUpdate?.(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "conversations",
          filter: filterOne,
        },
        (payload) => {
          this.onDelete?.(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "conversations",
          filter: filterTwo,
        },
        (payload) => {
          this.onDelete?.(payload);
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