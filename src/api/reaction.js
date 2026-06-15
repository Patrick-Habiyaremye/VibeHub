import { supabase } from "../supabaseClient";

export async function addReaction(
  postId,
  userId,
  type
) {
  const { data, error } =
    await supabase
      .from("reactions")
      .insert({
        post_id: postId,
        user_id: userId,
        type,
      });

  if (error) {
    console.error(error);
  }

  return data;
}