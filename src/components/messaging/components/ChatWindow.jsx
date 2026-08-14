// src/features/messaging/components/ChatWindow.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  MoreVertical,
} from "lucide-react";

import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import ReplyPreview from "./ReplyPreview";
import TypingIndicator from "./TypingIndicator";
import EmptyConversation from "./EmptyConversation";

import useConversation from "../hooks/useConversation";
import useTyping from "../hooks/useTyping";
import usePresence from "../hooks/usePresence";
import useReadReceipts from "../hooks/useReadReceipts";
import useMessageActions from "../hooks/useMessageActions";

import normalizeParticipant from "../normalizers/normalizeParticipant";

/**
 * ChatWindow
 *
 * Responsible for one active conversation.
 *
 * IMPORTANT:
 * This component does not directly talk to Supabase.
 *
 * Data flow:
 *
 * MessagingShell
 *      ↓
 * ChatWindow
 *      ↓
 * useConversation
 *      ↓
 * useTyping
 * usePresence
 * useReadReceipts
 * useMessageActions
 *      ↓
 * services / realtime / api
 */
export default function ChatWindow({
  user,
  conversation,
  onBack,
  onConversationChanged,
}) {
  const [replyTo, setReplyTo] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  /**
   * ---------------------------------------------------------
   * BASIC GUARDS
   * ---------------------------------------------------------
   */
  const userId = user?.id;
  const conversationId = conversation?.id;

  /**
   * ---------------------------------------------------------
   * PARTICIPANT
   * ---------------------------------------------------------
   *
   * Normalization keeps UI independent from database shape.
   */
  const participant = useMemo(() => {
    if (!conversation || !userId) {
      return null;
    }

    return normalizeParticipant(
      conversation.participant ||
        conversation.otherUser ||
        conversation.user ||
        conversation
    );
  }, [conversation, userId]);

  const receiverId = participant?.id;

  /**
   * ---------------------------------------------------------
   * CONVERSATION DATA
   * ---------------------------------------------------------
   *
   * useConversation owns:
   * - messages
   * - loading
   * - errors
   * - pagination
   * - realtime message updates
   *
   * Your exact hook can expose additional values.
   */
  const {
    messages = [],
    loading,
    error,
    hasMore = false,
    loadMore,
    sendMessage,
    refresh,
  } = useConversation({
    conversationId,
    userId,
    receiverId,
  });

  /**
   * ---------------------------------------------------------
   * PRESENCE
   * ---------------------------------------------------------
   */
  const isOnline = usePresence(receiverId);

  /**
   * ---------------------------------------------------------
   * TYPING
   * ---------------------------------------------------------
   */
  const {
    typingUsers = [],
    startTyping,
    stopTyping,
  } = useTyping({
    conversationId,
    userId,
  });

  /**
   * Never show current user as typing.
   */
  const otherTypingUsers = useMemo(() => {
    return typingUsers.filter(
      (typingUser) =>
        typingUser.user_id !== userId
    );
  }, [typingUsers, userId]);

  /**
   * ---------------------------------------------------------
   * READ RECEIPTS
   * ---------------------------------------------------------
   */
  const {
    markConversationSeen,
  } = useReadReceipts({
    conversationId,
    userId,
    receiverId,
  });

  /**
   * ---------------------------------------------------------
   * MESSAGE ACTIONS
   * ---------------------------------------------------------
   */
  const {
    editMessage,
    deleteMessage,
    reactToMessage,
    removeReaction,
  } = useMessageActions({
    userId,
    conversationId,
  });

  /**
   * ---------------------------------------------------------
   * MARK CONVERSATION SEEN
   * ---------------------------------------------------------
   *
   * Whenever the conversation is opened, unread messages
   * belonging to the current user should be marked seen.
   */
  useEffect(() => {
    if (!conversationId || !userId) {
      return;
    }

    markConversationSeen?.();
  }, [
    conversationId,
    userId,
    markConversationSeen,
  ]);

  /**
   * ---------------------------------------------------------
   * SEND MESSAGE
   * ---------------------------------------------------------
   */
  const handleSendMessage = useCallback(
    async (payload) => {
      if (!sendMessage) {
        console.error(
          "ChatWindow: sendMessage is unavailable."
        );
        return;
      }

      try {
        await sendMessage({
          ...payload,

          /**
           * Reply metadata.
           *
           * Your MessageModel/API should decide how this
           * becomes reply_to_message_id or equivalent DB field.
           */
          replyToId:
            replyTo?.id || null,
        });

        setReplyTo(null);
        stopTyping?.();

        onConversationChanged?.();
      } catch (err) {
        console.error(
          "ChatWindow: failed to send message",
          err
        );

        throw err;
      }
    },
    [
      sendMessage,
      replyTo,
      stopTyping,
      onConversationChanged,
    ]
  );

  /**
   * ---------------------------------------------------------
   * REPLY
   * ---------------------------------------------------------
   */
  const handleReply = useCallback((message) => {
    if (!message?.id) return;

    setReplyTo(message);
  }, []);

  /**
   * ---------------------------------------------------------
   * EDIT
   * ---------------------------------------------------------
   */
  const handleEdit = useCallback(
    async (messageId, content) => {
      if (!messageId || !content?.trim()) {
        return;
      }

      try {
        await editMessage?.(
          messageId,
          content.trim()
        );

        await refresh?.();
      } catch (err) {
        console.error(
          "ChatWindow: failed to edit message",
          err
        );
      }
    },
    [editMessage, refresh]
  );

  /**
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */
  const handleDelete = useCallback(
    async (messageId) => {
      if (!messageId) return;

      try {
        await deleteMessage?.(messageId);

        await refresh?.();
        onConversationChanged?.();
      } catch (err) {
        console.error(
          "ChatWindow: failed to delete message",
          err
        );
      }
    },
    [
      deleteMessage,
      refresh,
      onConversationChanged,
    ]
  );

  /**
   * ---------------------------------------------------------
   * REACTION
   * ---------------------------------------------------------
   */
  const handleReaction = useCallback(
    async (messageId, reaction) => {
      if (!messageId || !reaction) {
        return;
      }

      try {
        await reactToMessage?.(
          messageId,
          reaction
        );
      } catch (err) {
        console.error(
          "ChatWindow: reaction failed",
          err
        );
      }
    },
    [reactToMessage]
  );

  /**
   * ---------------------------------------------------------
   * REMOVE REACTION
   * ---------------------------------------------------------
   */
  const handleRemoveReaction = useCallback(
    async (messageId, reaction) => {
      if (!messageId || !reaction) {
        return;
      }

      try {
        await removeReaction?.(
          messageId,
          reaction
        );
      } catch (err) {
        console.error(
          "ChatWindow: remove reaction failed",
          err
        );
      }
    },
    [removeReaction]
  );

  /**
   * ---------------------------------------------------------
   * LOAD MORE
   * ---------------------------------------------------------
   */
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || !loadMore) {
      return;
    }

    try {
      await loadMore();
    } catch (err) {
      console.error(
        "ChatWindow: failed to load older messages",
        err
      );
    }
  }, [hasMore, loadMore]);

  /**
   * ---------------------------------------------------------
   * HEADER STATUS
   * ---------------------------------------------------------
   */
  const statusText = useMemo(() => {
    if (otherTypingUsers.length > 0) {
      return "typing...";
    }

    if (isOnline) {
      return "online";
    }

    return "offline";
  }, [
    otherTypingUsers.length,
    isOnline,
  ]);

  /**
   * ---------------------------------------------------------
   * EMPTY / INVALID STATE
   * ---------------------------------------------------------
   */
  if (!conversation || !participant) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-950">
        <EmptyConversation />
      </div>
    );
  }

  /**
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */
  return (
    <section
      className="
        relative
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
        bg-slate-950
      "
      aria-label={`Conversation with ${
        participant.username || participant.name || "user"
      }`}
    >
      {/* =====================================================
          HEADER
          ===================================================== */}
      <header
        className="
          relative
          z-20
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-800
          bg-slate-900
          px-3
          py-3
          sm:px-4
        "
      >
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile back */}
          <button
            type="button"
            onClick={onBack}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-slate-800
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-yellow-500/50
              md:hidden
            "
            aria-label="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-slate-700
                text-sm
                font-semibold
                text-white
              "
            >
              {participant.avatar_url ? (
                <img
                  src={participant.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (
                  participant.username ||
                  participant.name ||
                  "?"
                )
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            {isOnline && (
              <span
                className="
                  absolute
                  bottom-0
                  right-0
                  h-3
                  w-3
                  rounded-full
                  border-2
                  border-slate-900
                  bg-green-500
                "
                aria-label="Online"
              />
            )}
          </div>

          {/* Identity */}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white sm:text-base">
              {participant.username ||
                participant.name ||
                "User"}
            </h2>

            <p
              className={`
                truncate
                text-xs

                ${
                  otherTypingUsers.length
                    ? "text-yellow-400"
                    : isOnline
                    ? "text-green-400"
                    : "text-slate-500"
                }
              `}
            >
              {statusText}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center gap-1">
          {/* Future: voice call */}
          <button
            type="button"
            disabled
            className="
              hidden
              rounded-lg
              p-2
              text-slate-500
              opacity-60
              md:inline-flex
            "
            aria-label="Voice call coming soon"
            title="Voice calls coming soon"
          >
            {/* Keep header clean until calling is implemented */}
          </button>

          <button
            type="button"
            onClick={() =>
              setShowMenu((current) => !current)
            }
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-slate-800
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-yellow-500/50
            "
            aria-label="Conversation options"
            aria-expanded={showMenu}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <>
              {/* Click-away layer */}
              <button
                type="button"
                aria-label="Close menu"
                className="
                  fixed
                  inset-0
                  z-30
                  cursor-default
                "
                onClick={() =>
                  setShowMenu(false)
                }
              />

              {/* Menu */}
              <div
                className="
                  absolute
                  right-0
                  top-11
                  z-40
                  min-w-[180px]
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900
                  py-1
                  shadow-2xl
                "
              >
                <button
                  type="button"
                  className="
                    w-full
                    px-4
                    py-2.5
                    text-left
                    text-sm
                    text-slate-300
                    transition
                    hover:bg-slate-800
                    hover:text-white
                  "
                  onClick={() => {
                    setShowMenu(false);
                    // Reserved:
                    // open participant profile
                  }}
                >
                  View profile
                </button>

                <button
                  type="button"
                  className="
                    w-full
                    px-4
                    py-2.5
                    text-left
                    text-sm
                    text-slate-300
                    transition
                    hover:bg-slate-800
                    hover:text-white
                  "
                  onClick={() => {
                    setShowMenu(false);
                    // Reserved:
                    // mute conversation
                  }}
                >
                  Mute notifications
                </button>

                <button
                  type="button"
                  className="
                    w-full
                    px-4
                    py-2.5
                    text-left
                    text-sm
                    text-red-400
                    transition
                    hover:bg-red-500/10
                  "
                  onClick={() => {
                    setShowMenu(false);
                    // Reserved:
                    // report / block
                  }}
                >
                  Report conversation
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* =====================================================
          ERROR
          ===================================================== */}
      {error && (
        <div
          className="
            shrink-0
            border-b
            border-red-500/20
            bg-red-500/10
            px-4
            py-2
            text-sm
            text-red-300
          "
          role="alert"
        >
          <div className="flex items-center justify-between gap-3">
            <span>
              Unable to load this conversation.
            </span>

            <button
              type="button"
              onClick={refresh}
              className="
                rounded-md
                px-2
                py-1
                text-xs
                font-medium
                text-red-200
                hover:bg-red-500/10
              "
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          MESSAGE AREA
          ===================================================== */}
      <div className="min-h-0 flex-1">
        <MessageList
          messages={messages}
          user={user}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReact={handleReaction}
          onRemoveReaction={
            handleRemoveReaction
          }
        />
      </div>

      {/* =====================================================
          TYPING
          ===================================================== */}
      {otherTypingUsers.length > 0 && (
        <div className="shrink-0">
          <TypingIndicator
            typingUsers={otherTypingUsers}
          />
        </div>
      )}

      {/* =====================================================
          REPLY PREVIEW
          ===================================================== */}
      {replyTo && (
        <div className="shrink-0 px-3 pt-2 sm:px-4">
          <ReplyPreview
            replyTo={replyTo}
            onCancel={() =>
              setReplyTo(null)
            }
          />
        </div>
      )}

      {/* =====================================================
          COMPOSER
          ===================================================== */}
      <div
        className="
          shrink-0
          border-t
          border-slate-800
          bg-slate-900
          p-3
          sm:p-4
        "
      >
        <MessageComposer
          conversationId={conversationId}
          receiverId={receiverId}
          userId={userId}
          onSend={handleSendMessage}
          onTyping={startTyping}
          onStopTyping={stopTyping}
        />
      </div>
    </section>
  );
}