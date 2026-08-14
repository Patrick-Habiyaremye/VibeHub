// hooks/useChallengeProgress.js

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "./apiClient";

export const useChallengeProgress = (challengeId) => {
  return useQuery({
    queryKey: ["progress", challengeId],
    queryFn: () => fetcher(`/progress/${challengeId}`),
    enabled: !!challengeId,
  });
};