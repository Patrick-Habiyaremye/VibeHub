// hooks/useDailyChallenge.js

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "./apiClient";

export const useDailyChallenge = () => {
  return useQuery({
    queryKey: ["dailyChallenge"],
    queryFn: () => fetcher("/challenges/daily"),
    staleTime: 1000 * 60 * 5,
  });
};