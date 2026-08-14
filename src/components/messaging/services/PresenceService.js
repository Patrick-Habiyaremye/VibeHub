// src/features/messaging/services/PresenceService.js

import { supabase } from "../../../supabaseClient";

let heartbeatTimer = null;

const HEARTBEAT_INTERVAL =
  30_000;

export const PresenceService = {
  async setOnline(userId) {
    if (!userId) return;

    const now =
      new Date().toISOString();

    const { error } =
      await supabase
        .from("user_presence")
        .upsert(
          {
            user_id: userId,
            is_online: true,
            last_seen: now,
          },
          {
            onConflict: "user_id",
          }
        );

    if (error) {
      console.error(
        "[PresenceService] online failed:",
        error
      );
    }
  },

  async setOffline(userId) {
    if (!userId) return;

    const now =
      new Date().toISOString();

    const { error } =
      await supabase
        .from("user_presence")
        .upsert(
          {
            user_id: userId,
            is_online: false,
            last_seen: now,
          },
          {
            onConflict: "user_id",
          }
        );

    if (error) {
      console.error(
        "[PresenceService] offline failed:",
        error
      );
    }
  },

  start(userId) {
    if (!userId) return;

    this.stop();

    this.setOnline(userId);

    heartbeatTimer =
      window.setInterval(() => {
        this.setOnline(userId);
      }, HEARTBEAT_INTERVAL);

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          this.setOnline(userId);
        } else {
          this.setOffline(userId);
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    window.__vibeHubPresenceCleanup =
      () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibility
        );
      };
  },

  stop() {
    if (heartbeatTimer) {
      window.clearInterval(
        heartbeatTimer
      );

      heartbeatTimer = null;
    }

    if (
      window.__vibeHubPresenceCleanup
    ) {
      window.__vibeHubPresenceCleanup();
      window.__vibeHubPresenceCleanup =
        null;
    }
  },
};

export default PresenceService;