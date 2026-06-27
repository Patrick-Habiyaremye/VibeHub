// import { supabase } from "../supabaseClient";

// export async function addReaction(
//   postId,
//   userId,
//   type
// ) {
//   const { data, error } =
//     await supabase
//       .from("reactions")
//       .insert({
//         post_id: postId,
//         user_id: userId,
//         type,
//       });

//   if (error) {
//     console.error(error);
//   }

//   return data;
// }
import { supabase } from "../supabaseClient";

export async function addReaction(
  postId,
  userId,
  type
) {
  const { data, error } = await supabase
    .from("reactions")
    .upsert({
      post_id: postId,
      user_id: userId,
      type,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function removeReaction(
  postId,
  userId
) {
  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function reactToPost(
postId,
userId,
type
){

const { error } =
await supabase.rpc(
"handle_reaction",
{
p_post_id:postId,
p_user_id:userId,
p_type:type
}
);

if(error) throw error;

}