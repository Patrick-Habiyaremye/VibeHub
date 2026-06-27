// import { supabase } from "../supabaseClient";

// export async function getComments(
//   postId
// ) {
//   const { data, error } =
//     await supabase
//       .from("comments")
//       .select("*")
//       .eq("post_id", postId)
//       .order("created_at", {
//         ascending: true,
//       });

//   if (error) {
//     console.error(error);
//     return [];
//   }

//   return data;
// }

import { supabase } from "../supabaseClient";

export async function getComments(postId) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles(
        username,
        avatar_url
      )
    `)
    .eq("post_id", postId)
    .order("created_at");

  if (error) throw error;

  return data;
}

export async function addComment(
  postId,
  userId,
  content
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteComment(id) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function createComment({

user_id,

post_id,

content

}){

const { data,error }

=

await supabase

.from("comments")

.insert({

user_id,

post_id,

content

})

.select()

.single();

if(error) throw error;

return data;

}