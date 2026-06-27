// import { supabase } from "../supabaseClient";

// export async function getPosts() {
//   const { data, error } = await supabase
//     .from("posts")
//     .select(`
//       *,
//       profiles (
//         username,
//         avatar_url,
//         bio
//       )
//     `)
//     .order("created_at", {
//       ascending: false,
//     });

//   if (error) {
//     console.error(error);
//     return [];
//   }

//   return data;
// }

import { supabase } from "../supabaseClient";

export async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles(
        username,
        avatar_url,
        bio
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function createPost(post) {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deletePost(postId) {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;
}