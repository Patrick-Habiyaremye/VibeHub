// FILE: src/features/support/hooks/useSupportStats.js

import { useEffect, useState } from "react";
import { getSupporterCount, getSupportingCount } from "../../../../api/supportApi";

export default function useSupportStats(userId) {
  const [supporters, setSupporters] = useState(0);
  const [supporting, setSupporting] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;

    setLoading(true);
    Promise.all([getSupporterCount(userId), getSupportingCount(userId)])
      .then(([supporterCount, supportingCount]) => {
        if (!cancelled) {
          setSupporters(supporterCount);
          setSupporting(supportingCount);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { supporters, supporting, loading };
}