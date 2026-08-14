import ConversationListItem from "./ConversationListItem";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}) {
  if (loading) {
    return (
      <div className="p-4 text-sm text-slate-400">
        Loading conversations...
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          active={
            selectedId === conversation.id
          }
          onClick={() =>
            onSelect(conversation)
          }
        />
      ))}
    </div>
  );
}