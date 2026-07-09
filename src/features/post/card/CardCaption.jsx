import { useMemo, useState } from "react";

const MAX_LENGTH = 220;

export default function CardCaption({
  text,
}) {

  const [expanded, setExpanded] =
    useState(false);

  const shouldCollapse =
    text?.length > MAX_LENGTH;

  const displayText =
    useMemo(() => {

      if (
        expanded ||
        !shouldCollapse
      )
        return text;

      return (
        text.slice(0, MAX_LENGTH) +
        "..."
      );

    }, [
      expanded,
      shouldCollapse,
      text,
    ]);

  if (!text?.trim()) return null;

  return (

    <div className="px-4 pb-4">

      <p
        className="
          text-[15px]
          leading-7
          text-slate-200
          whitespace-pre-wrap
          break-words
        "
      >

        {displayText}

      </p>

      {shouldCollapse && (

        <button

          onClick={() =>

            setExpanded(
              !expanded
            )

          }

          className="
            mt-2
            text-sm
            font-medium
            text-yellow-400
            hover:text-yellow-300
            transition
          "
        >

          {

            expanded

              ? "Show less"

              : "Read more"

          }

        </button>

      )}

    </div>

  );

}