import { supabase }
from "../supabaseClient";

export async function getDailyChallenge() {

  const {
    data,
    error,
  } = await supabase

    .from("daily_challenges")

    .select("*")

    .order(
      "created_at",
      {
        ascending: false,
      }
    )

    .limit(1)

    .maybeSingle();

  if (error) throw error;

  return data;
}