// hooks/useReelInteractions.js — save removed
import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { setReelReaction } from "../api/reelInteractionsApi";

export default function useReelInteractions() {
  const { user } = useAuth();

  const react = useCallback(
    async ({ reelId, reaction }) => {
      if (!user?.id) throw new Error("You must be signed in to react.");
      return setReelReaction({ reelId, userId: user.id, reaction });
    },
    [user?.id]
  );

  return { react };
}