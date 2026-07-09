import { supabase } from "../supabaseClient";

/**
 * Send watch / skip / like / engagement signals
 */
export async function trackInteraction({
  postId,
  userId,
  type, // view_start | view_end | like | skip
  watchTime = 0,
  completed = false,
}) {
  const { data, error } = await supabase
    .from("interactions")
    .insert([
      {
        post_id: postId,
        user_id: userId,
        type,
        watch_time: watchTime,
        completed,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}