import { Search } from "lucide-react";

export default function ChatSidebar() {
  const chats = [
    {
      id: 1,
      name: "Alice",
      lastMessage: "You inspired me today 😊",
      unread: 2,
    },
    {
      id: 2,
      name: "John",
      lastMessage: "Great challenge progress 🌟",
      unread: 0,
    },
    {
      id: 3,
      name: "Sarah",
      lastMessage: "Keep going 💛",
      unread: 1,
    },
  ];

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">

      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">
          Messages
        </h2>
      </div>

      <div className="p-3">
        <div className="flex items-center bg-slate-700 rounded-lg px-3 py-2">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search chats..."
            className="bg-transparent text-white px-2 outline-none w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {chats.map(chat => (
          <div
            key={chat.id}
            className="p-4 border-b border-slate-700 hover:bg-slate-700 cursor-pointer"
          >

            <div className="flex justify-between">

              <h3 className="text-white font-semibold">
                {chat.name}
              </h3>

              {chat.unread > 0 && (
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                  {chat.unread}
                </span>
              )}

            </div>

            <p className="text-sm text-slate-400 mt-1">
              {chat.lastMessage}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}