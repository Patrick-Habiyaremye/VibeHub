import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { ProfileEngine } from "../engine/ProfileEngine";

export function useProfile(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bundle = await ProfileEngine.load(userId);

      setData(bundle);
    } catch (err) {
      console.error(
        "[useProfile] Profile load error:",
        err
      );

      setError(
        err?.message ||
          "We couldn't load this profile."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
    setData,
  };
}