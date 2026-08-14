// FILE: src/components/card/hooks/useReports.js

import { useCallback, useState } from "react";
import { reportContent } from "../../../../api/reportsApi";

export default function useReports(contentId, contentType = "post") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const report = useCallback(
    async (reason, description = "") => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportContent({ contentId, contentType, reason, description });
        return { success: true, data };
      } catch (err) {
        setError(err);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [contentId, contentType]
  );

  return { report, loading, error };
}