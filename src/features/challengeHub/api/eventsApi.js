import { supabase } from "../../../supabaseClient";

function handle(error) {
  if (error) throw error;
}

export async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from("challenge_events")
    .select("*")
    .gte(
      "start_date",
      new Date().toISOString()
    )
    .order("start_date");

  handle(error);

  return data ?? [];
}

export async function getLiveEvents() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("challenge_events")
    .select("*")
    .lte("start_date", now)
    .gte("end_date", now);

  handle(error);

  return data ?? [];
}

export async function joinEvent(eventId, userId) {
  const { data, error } = await supabase
    .from("challenge_event_participants")
    .insert({
      event_id: eventId,
      user_id: userId,
    })
    .select()
    .single();

  handle(error);

  return data;
}