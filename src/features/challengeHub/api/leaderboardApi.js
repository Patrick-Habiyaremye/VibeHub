import { supabase } from "../../../supabaseClient";

function handle(error) {
  if (error) throw error;
}

export async function getGlobalLeaderboard(limit = 100) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      avatar_url,
      xp,
      reputation
    `)
    .order("xp", {
      ascending: false,
    })
    .limit(limit);

  handle(error);

  return data ?? [];
}

export async function getChallengeLeaderboard(challengeId) {
  const { data, error } = await supabase
    .from("challenge_submissions")
    .select(`
      score,
      completion_time,
      profiles(
        username,
        avatar_url
      )
    `)
    .eq("challenge_id", challengeId)
    .eq("status", "approved")
    .order("score", {
      ascending: false,
    });

  handle(error);

  return data ?? [];
}