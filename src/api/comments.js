import { supabase } from "../supabaseClient";

export async function getComments(
  postId
) {
  const { data, error } =
    await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", {
        ascending: true,
      });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}