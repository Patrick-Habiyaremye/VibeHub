import { useState, useCallback } from "react";
import { sendSupport } from "../../../../api/supportApi";

export default function useSupport() {
  const [loading, setLoading] = useState(false);

  const support = useCallback(async (postId, amount) => {
    setLoading(true);

    try {
      await sendSupport({ postId, amount });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    support,
    loading,
  };
}