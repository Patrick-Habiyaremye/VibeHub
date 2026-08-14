// hooks/useLeaderboard.js

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "./apiClient";

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetcher("/leaderboard"),
    refetchInterval: 10000, // auto refresh
  });
};