// src/features/messaging/components/MessagingShell.jsx

import { useCallback, useEffect, useMemo, useState } from "react";

import ConversationList from "./ConversationList";
import ConversationSearch from "./ConversationSearch";
import ChatWindow from "./ChatWindow";
import EmptyConversation from "./EmptyConversation";

import useConversations from "../hooks/useConversations";

/**
 * MessagingShell
 *
 * Top-level messaging layout.
 *
 * Responsibilities:
 * - Load/manage conversation list
 * - Manage selected conversation
 * - Manage mobile navigation state
 * - Search conversations
 * - Coordinate ConversationList <-> ChatWindow
 *
 * Does NOT:
 * - Query Supabase directly
 * - Send messages
 * - Subscribe to message realtime
 * - Manage typing
 * - Manage presence
 * - Manage read receipts
 */
export default function MessagingShell({
  user,
  initialConversationId = null,
}) {
  const [selectedConversationId, setSelectedConversationId] =
    useState(initialConversationId);

  const [mobileView, setMobileView] = useState("conversations");
  // "conversations" | "chat"

  const [search, setSearch] = useState("");

  /**
   * ---------------------------------------------------------
   * CONVERSATIONS
   * ---------------------------------------------------------
   *
   * Your useConversations hook should own:
   * - fetching
   * - realtime updates
   * - unread counts
   * - sorting
   * - refresh
   */
  const {
    conversations = [],
    loading,
    error,
    refresh,
  } = useConversations(user?.id);

  /**
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   *
   * Search is intentionally kept at UI level.
   *
   * For very large systems, move this to server-side search.
   */
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const participant =
        conversation.participant ||
        conversation.otherUser ||
        conversation.user ||
        {};

      const username =
        participant.username ||
        conversation.username ||
        "";

      const name =
        participant.name ||
        conversation.name ||
        "";

      return (
        username.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query)
      );
    });
  }, [conversations, search]);

  /**
   * ---------------------------------------------------------
   * SELECTED CONVERSATION
   * ---------------------------------------------------------
   */
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) {
      return null;
    }

    return (
      conversations.find(
        (conversation) =>
          conversation.id === selectedConversationId
      ) || null
    );
  }, [conversations, selectedConversationId]);

  /**
   * ---------------------------------------------------------
   * INITIAL CONVERSATION
   * ---------------------------------------------------------
   *
   * If a conversation disappears because it was deleted/blocked,
   * don't leave the UI pointing at a dead conversation.
   */
  useEffect(() => {
    if (!selectedConversationId) return;

    const exists = conversations.some(
      (conversation) =>
        conversation.id === selectedConversationId
    );

    if (!exists && !loading) {
      setSelectedConversationId(null);
    }
  }, [
    conversations,
    selectedConversationId,
    loading,
  ]);

  /**
   * ---------------------------------------------------------
   * SELECT CONVERSATION
   * ---------------------------------------------------------
   */
  const handleSelectConversation = useCallback(
    (conversation) => {
      if (!conversation?.id) return;

      setSelectedConversationId(conversation.id);

      // Mobile switches from conversation list -> chat.
      setMobileView("chat");
    },
    []
  );

  /**
   * ---------------------------------------------------------
   * BACK TO CONVERSATIONS
   * ---------------------------------------------------------
   */
  const handleBack = useCallback(() => {
    setMobileView("conversations");
  }, []);

  /**
   * ---------------------------------------------------------
   * CONVERSATION UPDATED
   * ---------------------------------------------------------
   *
   * ChatWindow can tell the shell that something changed.
   *
   * Example:
   * - message sent
   * - message deleted
   * - conversation archived
   *
   * The hook remains the source of truth.
   */
  const handleConversationChanged = useCallback(() => {
    refresh?.();
  }, [refresh]);

  /**
   * ---------------------------------------------------------
   * AUTH GUARD
   * ---------------------------------------------------------
   */
  if (!user?.id) {
    return (
      <div className="flex h-full min-h-[100dvh] items-center justify-center bg-slate-950 text-slate-400">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-300">
            Sign in to use messages
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Your conversations will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="
        flex
        h-[100dvh]
        min-h-0
        w-full
        overflow-hidden
        bg-slate-950
        text-white
      "
      aria-label="Messaging"
    >
      {/* =====================================================
          CONVERSATION PANEL
          ===================================================== */}
      <aside
        className={`
          flex
          h-full
          w-full
          shrink-0
          flex-col
          border-r
          border-slate-800
          bg-slate-900

          md:w-[320px]
          lg:w-[360px]

          ${
            mobileView === "chat"
              ? "hidden md:flex"
              : "flex"
          }
        `}
      >
        {/* Header */}
        <div
          className="
            shrink-0
            border-b
            border-slate-800
            px-4
            py-4
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Messages
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                Your conversations
              </p>
            </div>

            {/* Optional future action:
                New conversation / compose */}
            <button
              type="button"
              className="
                rounded-lg
                px-3
                py-2
                text-xs
                font-medium
                text-slate-400
                transition
                hover:bg-slate-800
                hover:text-white
                focus:outline-none
                focus:ring-2
                focus:ring-yellow-500/50
              "
              onClick={() => {
                // Reserved for future "New Message" flow.
              }}
            >
              New
            </button>
          </div>
        </div>

        {/* Search */}
        <div
          className="
            shrink-0
            border-b
            border-slate-800
            p-3
          "
        >
          <ConversationSearch
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Conversation list */}
        <div className="min-h-0 flex-1">
          <ConversationList
            conversations={filteredConversations}
            selectedConversationId={
              selectedConversationId
            }
            loading={loading}
            error={error}
            onSelect={handleSelectConversation}
            currentUserId={user.id}
            onRetry={refresh}
          />
        </div>
      </aside>

      {/* =====================================================
          CHAT PANEL
          ===================================================== */}
      <main
        className={`
          min-w-0
          flex-1

          ${
            mobileView === "conversations"
              ? "hidden md:flex"
              : "flex"
          }
        `}
      >
        {selectedConversation ? (
          <ChatWindow
            key={selectedConversation.id}
            user={user}
            conversation={selectedConversation}
            onBack={handleBack}
            onConversationChanged={
              handleConversationChanged
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <EmptyConversation
              title="No conversation selected"
            />
          </div>
        )}
      </main>
    </section>
  );
}