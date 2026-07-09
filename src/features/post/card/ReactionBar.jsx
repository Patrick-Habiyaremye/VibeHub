import useReactions from "./hooks/useReactions";

const reactions = [

  {
    type: "smile",
    emoji: "😊",
  },

  {
    type: "inspire",
    emoji: "💡",
  },

  {
    type: "respect",
    emoji: "🙌",
  },

  {
    type: "hope",
    emoji: "🌈",
  },

  {
    type: "kind",
    emoji: "💛",
  },

];

export default function ReactionBar({
  post,
}) {

    if (!post?.id) {
    console.warn("ReactionBar: missing post", post);
    return null;
    }
  const {

    loading,

    react,

  } =
  useReactions(
    post.id
  );

  return (

    <div
      className="
        flex
        justify-around
      "
    >

      {

        reactions.map(
          (reaction) => (

            <button

              key={
                reaction.type
              }

              disabled={
                loading
              }

              onClick={() =>

                react(
                  reaction.type
                )

              }

              className="
                text-sm
                rounded-full
                transition
                hover:scale-125
                active:scale-95
              "
            >

              {
                reaction.emoji
              }

            </button>

          )

        )

      }

    </div>

  );

}