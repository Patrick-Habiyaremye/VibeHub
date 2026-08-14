// api/reelInteractionsApi.js — setReelSaved removed, everything else unchanged
import { supabase } from "../supabaseClient";

const REACTIONS_TABLE = "reel_reactions";

function handle(result, operation) {
  if (!result?.error) return;
  console.error(`[reelInteractionsApi] ${operation}`, result.error);
  throw result.error;
}

export async function setReelReaction({ reelId, userId, reaction }) {
  if (!reelId) throw new Error("reelId is required");
  if (!userId) throw new Error("userId is required");

  if (reaction === null) {
    const result = await supabase
      .from(REACTIONS_TABLE)
      .delete()
      .eq("reel_id", reelId)
      .eq("user_id", userId);
    handle(result, "setReelReaction:clear");
    return true;
  }

  const result = await supabase
    .from(REACTIONS_TABLE)
    .upsert(
      { reel_id: reelId, user_id: userId, reaction_type: reaction },
      { onConflict: "reel_id,user_id" }
    );
  handle(result, "setReelReaction:set");
  return true;
}