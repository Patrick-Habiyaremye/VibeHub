export default function EmptyConversation({ title = "No conversation selected 💛" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
      
      <div className="text-5xl mb-3">💬</div>

      <p className="text-lg font-semibold text-slate-400">
        {title}
      </p>

      <p className="text-sm text-slate-600 mt-2">
        Select a conversation to start chatting
      </p>

    </div>
  );
}