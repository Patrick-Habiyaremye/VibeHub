// hooks/useSubmitChallenge.js

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export const useSubmitChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiClient.post("/challenges/submit", payload),

    onSuccess: () => {
      queryClient.invalidateQueries(["challenges"]);
      queryClient.invalidateQueries(["progress"]);
      queryClient.invalidateQueries(["leaderboard"]);
    },
  });
};