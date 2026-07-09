import {
  useState,
  useEffect,
  useCallback,
  memo,
} from "react";

import {
  MessageCircle,
  Bookmark,
  Share2,
} from "lucide-react";

const REACTIONS = [
  {
    id: "smile",
    emoji: "😊",
  },
  {
    id: "inspire",
    emoji: "💡",
  },
  {
    id: "respect",
    emoji: "🙌",
  },
  {
    id: "hope",
    emoji: "🌈",
  },
  {
    id: "kind",
    emoji: "💛",
  },
];

function ReelActions({
  reel,
  onComment,
  onReact,
  onShare,
  onSave,

  initialReaction = null,
}) {
  const [selected, setSelected] =
    useState(initialReaction);

  const [pending, setPending] =
    useState(false);

  const [saved, setSaved] =
    useState(reel?.saved ?? false);

  useEffect(() => {
    setSelected(initialReaction);
  }, [initialReaction]);

  useEffect(() => {
    setSaved(reel?.saved ?? false);
  }, [reel?.saved]);

  //-----------------------------------
  // React
  //-----------------------------------

  const handleReaction = useCallback(
    async (reaction) => {
      if (pending) return;

      const previous = selected;
      const next =
        previous === reaction
          ? null
          : reaction;

      setSelected(next);
      setPending(true);

      try {
        await onReact?.({
          reelId: reel.id,
          reaction: next,
        });
      } catch (err) {
        console.error(err);
        setSelected(previous);
      } finally {
        setPending(false);
      }
    },
    [
      pending,
      selected,
      reel?.id,
      onReact,
    ]
  );

  //-----------------------------------
  // Save
  //-----------------------------------

  const handleSave = async () => {
    const next = !saved;

    setSaved(next);

    try {
      await onSave?.({
        reelId: reel.id,
        saved: next,
      });
    } catch {
      setSaved(!next);
    }
  };

  //-----------------------------------
  // Share
  //-----------------------------------

  const handleShare = () => {
    onShare?.(reel);
  };

  //-----------------------------------

  return (
    <aside
      className="
      absolute
      right-3
      bottom-28

      z-30

      flex
      flex-col
      items-center
      gap-5
    "
    >
      {/* REACTIONS */}

      {REACTIONS.map((item) => {
        const active =
          selected === item.id;

        return (
          <button
            key={item.id}
            onClick={() =>
              handleReaction(item.id)
            }
            disabled={pending}
            aria-label={item.id}
            aria-pressed={active}
            className="
              flex
              flex-col
              items-center
              transition-all
              duration-200
            "
          >
            <span
              className={`
                text-[30px]
                transition-all
                duration-200

                ${
                  active
                    ? "scale-125"
                    : "hover:scale-110"
                }

                ${
                  pending
                    ? "opacity-60"
                    : ""
                }
              `}
            >
              {item.emoji}
            </span>

            <span className="text-[10px] text-white/80 mt-1">
              {reel?.reactionCounts?.[
                item.id
              ] ?? 0}
            </span>
          </button>
        );
      })}

      {/* COMMENTS */}

      <button
        onClick={onComment}
        className="
          flex
          flex-col
          items-center
          text-white
          hover:scale-110
          transition
        "
      >
        <MessageCircle size={30} />

        <span className="text-[11px] mt-1">
          {reel?.commentsCount ?? 0}
        </span>
      </button>

      {/* SAVE */}

      <button
        onClick={handleSave}
        className="
          flex
          flex-col
          items-center
          text-white
          hover:scale-110
          transition
        "
      >
        <Bookmark
          size={28}
          fill={saved ? "white" : "none"}
        />

        <span className="text-[11px] mt-1">
          Save
        </span>
      </button>

      {/* SHARE */}

      <button
        onClick={handleShare}
        className="
          flex
          flex-col
          items-center
          text-white
          hover:scale-110
          transition
        "
      >
        <Share2 size={28} />

        <span className="text-[11px] mt-1">
          Share
        </span>
      </button>
    </aside>
  );
}

export default memo(ReelActions);