// components/LiveTicker.jsx

// 

import { useState, useEffect } from "react";
import useRealtimeAdmin from "../hooks/useRealtimeAdmin";

export default function LiveTicker() {
  const [events, setEvents] = useState([]);

  useRealtimeAdmin({
    table: "posts",
    onChange: (payload) => {
      setEvents((prev) => [
        {
          id: crypto.randomUUID(),
          text: `New post created`,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    },
  });

  return (
    <div className="bg-slate-800 p-4 rounded-xl h-64 overflow-y-auto">
      <h2 className="text-yellow-400 font-bold mb-2">Live Activity</h2>

      {events.map((e) => (
        <div key={e.id} className="text-sm text-slate-300 border-b border-slate-700 py-2">
          {e.text} — {e.time}
        </div>
      ))}
    </div>
  );
}