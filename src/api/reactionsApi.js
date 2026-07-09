import { supabase }
from "../supabaseClient";


//--------------------------------------------------
// AUTH USER
//--------------------------------------------------

async function getUser() {

  const {

    data: { user },

    error,

  } =
  await supabase
    .auth
    .getUser();

  if (error || !user) {

    throw new Error(
      "Login required."
    );

  }

  return user;

}


//--------------------------------------------------
// LOAD COUNTS
//--------------------------------------------------

export async function getReactionStats(
  postId
) {

  const {

    data,

    error,

  } =
  await supabase

    .from("posts")

    .select(`
      smile_score,
      share_count,
      comments_count
    `)

    .eq("id", postId)

    .single();

  if (error)
    throw error;

  return {

    smiles:
      data.smile_score || 0,

    shares:
      data.share_count || 0,

    comments:
      data.comments_count || 0,

  };

}


//--------------------------------------------------
// REACT
//--------------------------------------------------

export async function reactToPost({

  postId,

  type,

}) {

  const user =
    await getUser();

  const { error } =
    await supabase.rpc(
      "handle_reaction",
      {

        p_post_id:
          postId,

        p_user_id:
          user.id,

        p_type:
          type,

      }
    );

  if (error)
    throw error;

}


//--------------------------------------------------
// SHARE
//--------------------------------------------------

export async function sharePost(
  postId
) {

  const user =
    await getUser();

  const { error } =
    await supabase

      .from("shares")

      .insert({

        post_id:
          postId,

        user_id:
          user.id,

      });

  if (error)
    throw error;

}


//--------------------------------------------------
// REALTIME
//--------------------------------------------------

export function subscribeToPostReactions(

  postId,

  callback

) {

  const channel =
    supabase

      .channel(
        `post-${postId}`
      )

      .on(
        "postgres_changes",
        {

          event: "*",

          schema: "public",

          table: "reactions",

          filter:
            `post_id=eq.${postId}`,

        },

        callback

      )

      .on(
        "postgres_changes",
        {

          event: "*",

          schema: "public",

          table: "shares",

          filter:
            `post_id=eq.${postId}`,

        },

        callback

      )

      .subscribe();

  return () =>

    supabase.removeChannel(
      channel
    );

}