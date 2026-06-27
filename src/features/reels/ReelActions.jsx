import { useState } from "react";

const reactions = [
  "😊",
  "💡",
  "🙌",
  "🌈",
  "💛",
];

export default function ReelActions({
  reel,
  onComment,
}) {

  const [selected,setSelected] =
    useState(null);

  return (

    <div
      className="
      absolute
      right-4
      bottom-24
      flex
      flex-col
      gap-5
      z-20
    "
    >

      {reactions.map((emoji)=>(

        <button
          key={emoji}
          onClick={()=>
            setSelected(emoji)
          }
          className={`
            text-3xl
            transition
            hover:scale-125
            ${
              selected===emoji
              ? "scale-125"
              : ""
            }
          `}
        >
          {emoji}
        </button>

      ))}

      <button
        onClick={onComment}
        className="text-3xl"
      >
        💬
      </button>

    </div>

  );

}