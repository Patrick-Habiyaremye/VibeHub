import { supabase } from "../../../supabaseClient";

function handle(error) {
  if (error) throw error;
}

export async function getUserRewards(userId) {
  const { data, error } = await supabase
    .from("challenge_rewards")
    .select("*")
    .eq("user_id", userId);

  handle(error);

  return data ?? [];
}

export async function grantReward(payload) {
  const { data, error } = await supabase
    .from("challenge_rewards")
    .insert(payload)
    .select()
    .single();

  handle(error);

  return data;
}

export async function getXP(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .single();

  handle(error);

  return data?.xp ?? 0;
}