import {
  useState,
  useEffect,
} from "react";

import { supabase }
from "../../supabaseClient";

const reactions = [

  {
    type: "smile",
    emoji: "😊"
  },

  {
    type: "inspire",
    emoji: "💡"
  },

  {
    type: "respect",
    emoji: "🙌"
  },

  {
    type: "hope",
    emoji: "🌈"
  },

  {
    type: "kind",
    emoji: "💛"
  },

  {
    type: "share",
    emoji: "📤"
  }

];

export default function ReactionBar({
  post,
}) {

  const [
    score,
    setScore
  ] = useState(
    post?.smile_score || 0
  );

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    shareCount,
    setShareCount
  ] = useState(
    post?.share_count || 0
  );

  useEffect(() => {

    const channel =
      supabase
        .channel(
          `post-${post.id}`
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reactions",
            filter: `post_id=eq.${post.id}`
          },
          loadStats
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shares",
            filter: `post_id=eq.${post.id}`
          },
          loadStats
        )

        .subscribe();

    loadStats();

    return () => {

      supabase.removeChannel(
        channel
      );

    };

  }, [post.id]);

  async function loadStats() {

    const { data } =
      await supabase

        .from("posts")

        .select(
          `
          smile_score,
          share_count
        `
        )

        .eq(
          "id",
          post.id
        )

        .single();

    if (data) {

      setScore(
        data.smile_score || 0
      );

      setShareCount(
        data.share_count || 0
      );

    }

  }

  const react = async(type) => {

    try {

      setLoading(true);

      const {
        data: { user }
      } =
      await supabase
      .auth
      .getUser();

      if (!user) {

        alert(
          "Login first"
        );

        return;

      }

      // SHARE
      if (
        type === "share"
      ) {

        const { error } =
          await supabase

            .from("shares")

            .insert({

              post_id:
                post.id,

              user_id:
                user.id

            });

        if (error)
          throw error;

        return;

      }

      // REACTION
      const { error } =
        await supabase.rpc(
          "handle_reaction",
          {

            p_post_id:
              post.id,

            p_user_id:
              user.id,

            p_type:
              type,

          }
        );

      if (error)
        throw error;

    }

    catch (err) {

      console.error(err);

    }

    finally {

      setLoading(false);

    }

  };

//   if (!user) {
//   return (
//     <div className="text-sm text-slate-400 mt-3">
//       Want to react?{" "}
//       <button
//         onClick={() => navigate("/login")}
//         className="text-yellow-400 hover:underline"
//       >
//         Sign in
//       </button>
//     </div>
//   );
// }

  return (

    <div className="mt-4">

      <div
        className="
          flex
          items-center
          gap-5
          border-t
          border-slate-700
          pt-4
        "
      >

        {

          reactions.map(r => (

            <button

              key={r.type}

              disabled={loading}

              onClick={() =>
                react(
                  r.type
                )
              }

              className="
                text-2xl
                hover:scale-125
                transition
                duration-200
              "
            >

              {r.emoji}

            </button>

          ))

        }

      </div>

      <div
        className="
          mt-4
          flex
          gap-6
          text-sm
        "
      >

        <p
          className="
            text-yellow-400
            font-semibold
          "
        >
          😊 {score} Smiles
        </p>

        <p
          className="
            text-blue-400
            font-semibold
          "
        >
          📤 {shareCount} Shares
        </p>

      </div>

    </div>

  );

}