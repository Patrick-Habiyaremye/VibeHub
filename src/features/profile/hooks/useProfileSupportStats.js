import { useCallback, useEffect, useState } from "react";
import { getProfileSupportStats } from "../services/profileSupportService";

export function useProfileSupportStats(profileId) {
  const [stats, setStats] = useState({
    supportersCount: 0,
    supportingCount: 0,
  });

  const [loading, setLoading] = useState(Boolean(profileId));
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!profileId) {
      setStats({
        supportersCount: 0,
        supportingCount: 0,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextStats = await getProfileSupportStats(profileId);

      setStats(nextStats);

      return nextStats;
    } catch (err) {
      console.error("Failed to load profile support stats:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!profileId) {
        setStats({
          supportersCount: 0,
          supportingCount: 0,
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextStats = await getProfileSupportStats(profileId);

        if (!cancelled) {
          setStats(nextStats);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Failed to load profile support stats:",
            err
          );

          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  return {
    ...stats,
    loading,
    error,
    reload,
  };
}