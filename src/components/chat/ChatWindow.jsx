import { useState } from "react";
import { Send } from "lucide-react";

export default function ChatWindow() {

  const [message, setMessage] = useState("");

  const messages = [
    {
      sender: "Alice",
      text: "Great job today 💛",
    },
    {
      sender: "You",
      text: "Thank you 😊",
    },
    {
      sender: "Alice",
      text: "You inspired me 🌟",
    },
  ];

  const handleSend = () => {
    if (!message.trim()) return;

    console.log(message);

    setMessage("");
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-900">

      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl text-white font-bold">
          Alice
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xs p-3 rounded-xl ${
              msg.sender === "You"
                ? "bg-yellow-500 text-black ml-auto"
                : "bg-slate-700 text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}

      </div>

      <div className="border-t border-slate-700 p-4">

        <div className="flex gap-2 mb-3">

          <button className="bg-slate-700 px-3 py-2 rounded-lg text-white text-sm">
            Great job 💛
          </button>

          <button className="bg-slate-700 px-3 py-2 rounded-lg text-white text-sm">
            Keep going 🌟
          </button>

          <button className="bg-slate-700 px-3 py-2 rounded-lg text-white text-sm">
            You inspired me 😊
          </button>

        </div>

        <div className="flex gap-2">

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Send a message..."
            className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-3 outline-none"
          />

          <button
            onClick={handleSend}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 rounded-lg"
          >
            <Send size={18}/>
          </button>

        </div>

      </div>

    </div>
  );
}