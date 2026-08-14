// hooks/useChallengeRealtime.js

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useChallengeRealtime = (socket) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleEvent = (event) => {
      switch (event.type) {
        case "PROGRESS_COMPLETED":
          queryClient.invalidateQueries(["progress", event.challengeId]);
          queryClient.invalidateQueries(["leaderboard"]);
          break;

        case "REWARD_GRANTED":
          queryClient.invalidateQueries(["user"]);
          break;

        case "LEVEL_UP":
          queryClient.invalidateQueries(["user"]);
          break;

        default:
          break;
      }
    };

    socket.on("event", handleEvent);

    return () => {
      socket.off("event", handleEvent);
    };
  }, [socket, queryClient]);
};