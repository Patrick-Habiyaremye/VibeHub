import { Bell } from "lucide-react";
import { useState } from "react";

export default function NotificationDropdown() {

  const [open, setOpen] = useState(false);

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="text-white" />

        <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1">
          3
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">

          <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-bold">
              Notifications
            </h3>
          </div>

          <div className="p-4 space-y-4">

            <div>
              <p className="text-white">
                😊 John smiled at your post
              </p>

              <span className="text-xs text-slate-400">
                2 minutes ago
              </span>
            </div>

            <div>
              <p className="text-white">
                💛 Sarah left a kind comment
              </p>

              <span className="text-xs text-slate-400">
                10 minutes ago
              </span>
            </div>

            <div>
              <p className="text-white">
                🌟 Challenge completed
              </p>

              <span className="text-xs text-slate-400">
                Today
              </span>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}