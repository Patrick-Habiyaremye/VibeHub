import {
  Home,
  Compass,
  Trophy,
  MessageCircle,
  User,
  Settings
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 min-h-screen bg-slate-900 border-r border-slate-700 p-4">

      <nav className="space-y-2">

        <a
          href="/feed"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-white"
        >
          <Home size={20} />
          Home
        </a>

        <a
          href="/discover"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-white"
        >
          <Compass size={20} />
          Discover
        </a>

        <a
          href="/challenges"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-white"
        >
          <Trophy size={20} />
          Challenges
        </a>

        <a
          href="/messages"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-white"
        >
          <MessageCircle size={20} />
          Messages
        </a>

        <a
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-white"
        >
          <User size={20} />
          Profile
        </a>

        <a
          href="/settings"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-white"
        >
          <Settings size={20} />
          Settings
        </a>

      </nav>
    </aside>
  );
}