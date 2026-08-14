// src/features/messaging/hooks/useOwnPresence.js

import { useEffect } from "react";
import PresenceService from "../services/PresenceService";

export default function useOwnPresence(
  userId
) {
  useEffect(() => {
    if (!userId) return;

    PresenceService.start(userId);

    return () => {
      PresenceService.stop();
      PresenceService.setOffline(userId);
    };
  }, [userId]);
}