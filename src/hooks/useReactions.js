import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { supabase } from "../../supabaseClient";

export default function useReactions(postId) {

  const [stats, setStats] = useState({
    smiles: 0,
    shares: 0,
    comments: 0,
  });

  const [loading, setLoading] =
    useState(false);

  //------------------------------------------------

  const loadStats =
    useCallback(async () => {

      const { data } =
        await supabase
          .from("posts")
          .select(`
            smile_score,
            share_count,
            comments_count
          `)
          .eq("id", postId)
          .single();

      if (!data) return;

      setStats({
        smiles:
          data.smile_score || 0,

        shares:
          data.share_count || 0,

        comments:
          data.comments_count || 0,
      });

    }, [postId]);

  //------------------------------------------------

  useEffect(() => {

    loadStats();

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
          loadStats
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
          loadStats
        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );

    };

  }, [
    postId,
    loadStats,
  ]);

  //------------------------------------------------

  const react =
    useCallback(async (type) => {

      setLoading(true);

      try {

        const {
          data: { user },
        } =
        await supabase
          .auth
          .getUser();

        if (!user) {

          throw new Error(
            "Login required."
          );

        }

        await supabase.rpc(
          "handle_reaction",
          {
            p_post_id: postId,
            p_user_id: user.id,
            p_type: type,
          }
        );

      }

      finally {

        setLoading(false);

      }

    }, [postId]);

  //------------------------------------------------

  const share =
    useCallback(async () => {

      const {
        data: { user },
      } =
      await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from("shares")
        .insert({

          post_id: postId,

          user_id: user.id,

        });

    }, [postId]);

  return {

    loading,

    stats,

    react,

    share,

    refresh:
      loadStats,

  };

}