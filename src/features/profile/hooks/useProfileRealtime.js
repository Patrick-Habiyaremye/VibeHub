import { useEffect } from "react";
import { subscribeToProfile } from "../realtime/ProfileRealtime";

// Merges realtime profile events into local state. Safe to use even when no
// realtime backend is configured - subscribeToProfile no-ops in that case.
export function useProfileRealtime(userId, setData) {
  useEffect(() => {
    if (!userId) return undefined;

    const unsubscribe = subscribeToProfile(userId, (event) => {
      if (!event) return;
      setData((prev) => {
        if (!prev) return prev;
        if (event.type === "profile_updated" && event.profile) {
          return { ...prev, profile: { ...prev.profile, ...event.profile } };
        }
        if (event.type === "reputation_updated" && event.reputation) {
          return { ...prev, reputation: { ...prev.reputation, ...event.reputation } };
        }
        return prev;
      });
    });

    return unsubscribe;
  }, [userId, setData]);
}