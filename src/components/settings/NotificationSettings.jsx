import { useState } from "react";

export default function NotificationSettings() {

  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [messages, setMessages] = useState(true);

  return (
    <div className="bg-slate-800 p-5 rounded-xl mb-6">

      <h2 className="text-xl text-white mb-4">
        Notifications 🔔
      </h2>

      <label className="block text-white mb-2">
        <input
          type="checkbox"
          checked={likes}
          onChange={() =>
            setLikes(!likes)
          }
        />
        {" "}
        Smile reactions
      </label>

      <label className="block text-white mb-2">
        <input
          type="checkbox"
          checked={comments}
          onChange={() =>
            setComments(!comments)
          }
        />
        {" "}
        Comments
      </label>

      <label className="block text-white">
        <input
          type="checkbox"
          checked={messages}
          onChange={() =>
            setMessages(!messages)
          }
        />
        {" "}
        Messages
      </label>

    </div>
  );
}