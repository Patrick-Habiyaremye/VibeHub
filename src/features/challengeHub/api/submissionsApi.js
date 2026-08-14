import { supabase } from "../../../supabaseClient";

const TABLE = "challenge_submissions";

function handle(error) {
  if (error) throw error;
}

export async function submitChallenge(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  handle(error);

  return data;
}

export async function updateSubmission(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  handle(error);

  return data;
}

export async function getSubmission(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  handle(error);

  return data;
}

export async function getUserSubmissions(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  handle(error);

  return data ?? [];
}

export async function getChallengeSubmissions(challengeId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("challenge_id", challengeId);

  handle(error);

  return data ?? [];
}

export async function hasCompleted(userId, challengeId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .eq("status", "approved")
    .maybeSingle();

  handle(error);

  return !!data;
}