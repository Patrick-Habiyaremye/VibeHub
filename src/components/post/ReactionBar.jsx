import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ReactionBar({
  post,
}) {
  const [score, setScore] = useState(
    post.smile_score || 0
  );

  const react = async (type) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login");
      return;
    }

    const weights = {
      laugh: 2,
      love: 3,
      fire: 1,
      respect: 2,
    };

    const value = weights[type];

    await supabase
      .from("reactions")
      .insert({
        user_id: user.id,
        post_id: post.id,
        type,
      });

    const newScore =
      score + value;

    setScore(newScore);

    await supabase
      .from("posts")
      .update({
        smile_score: newScore,
      })
      .eq("id", post.id);
  };

  return (
    <div className="mt-4">

      <div className="flex gap-4 text-2xl">

        <button
          onClick={() =>
            react("laugh")
          }
        >
          😂
        </button>

        <button
          onClick={() =>
            react("love")
          }
        >
          💛
        </button>

        <button
          onClick={() =>
            react("fire")
          }
        >
          🔥
        </button>

        <button
          onClick={() =>
            react("respect")
          }
        >
          🙌
        </button>

      </div>

      <p className="mt-3 text-yellow-400 font-semibold">
        😊 {score} Smiles
      </p>

    </div>
  );
}