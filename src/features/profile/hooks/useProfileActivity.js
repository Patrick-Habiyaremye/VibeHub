import { useCallback, useEffect, useState } from "react";
import { ProfileActivityService } from "../services/ProfileActivityService";
import { buildActivityGroups } from "../engine/ProfileActivityEngine";

// Lazily loads the Activity tab's data - only fetches once the tab is active.
export function useProfileActivity(userId, { enabled }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const items = await ProfileActivityService.getActivity(userId);
      setGroups(buildActivityGroups(items));
      setLoaded(true);
    } catch (err) {
      console.error("Activity load error:", err);
      setError("Couldn't load activity right now.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (enabled && !loaded) load();
  }, [enabled, loaded, load]);

  return { groups, loading, error };
}