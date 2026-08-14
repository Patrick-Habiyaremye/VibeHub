import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";

export default function ChatHeader({
  conversation,
  currentUserId,
  onBack,
  onCall,
  onVideoCall,
  onMenu,
  isOnline = false,
  isTyping = false,
}) {
  if (!conversation) return null;

  const participant =
    conversation.participant ||
    conversation.otherUser ||
    conversation;

  const username =
    participant?.username ||
    participant?.name ||
    "Unknown user";

  const avatarUrl = participant?.avatar_url;

  const initials = username
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header
      className="
        flex
        items-center
        justify-between
        gap-3
        px-3
        sm:px-4
        py-3
        bg-slate-900
        border-b
        border-slate-800
        shrink-0
        z-20
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="
            md:hidden
            shrink-0
            p-2
            rounded-full
            text-slate-300
            hover:text-white
            hover:bg-slate-800
            transition
          "
        >
          <ArrowLeft size={20} />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="
              w-10
              h-10
              rounded-full
              overflow-hidden
              bg-slate-700
              flex
              items-center
              justify-center
              text-white
              font-semibold
            "
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {isOnline && (
            <span
              className="
                absolute
                right-0
                bottom-0
                w-3
                h-3
                rounded-full
                bg-emerald-500
                border-2
                border-slate-900
              "
              aria-label="Online"
            />
          )}
        </div>

        {/* USER INFO */}
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-white truncate">
            {username}
          </h2>

          <p className="text-xs text-slate-400 truncate">
            {isTyping ? (
              <span className="text-yellow-400">
                typing...
              </span>
            ) : isOnline ? (
              "Online"
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onCall}
          disabled={!onCall}
          aria-label="Start voice call"
          className="
            hidden
            sm:flex
            p-2
            rounded-full
            text-slate-300
            hover:text-white
            hover:bg-slate-800
            disabled:opacity-40
            transition
          "
        >
          <Phone size={18} />
        </button>

        <button
          type="button"
          onClick={onVideoCall}
          disabled={!onVideoCall}
          aria-label="Start video call"
          className="
            hidden
            sm:flex
            p-2
            rounded-full
            text-slate-300
            hover:text-white
            hover:bg-slate-800
            disabled:opacity-40
            transition
          "
        >
          <Video size={19} />
        </button>

        <button
          type="button"
          onClick={onMenu}
          aria-label="Conversation options"
          className="
            p-2
            rounded-full
            text-slate-300
            hover:text-white
            hover:bg-slate-800
            transition
          "
        >
          <MoreVertical size={19} />
        </button>
      </div>
    </header>
  );
}