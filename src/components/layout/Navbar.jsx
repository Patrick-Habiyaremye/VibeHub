import { Search, Bell, MessageCircle, Plus } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">

        <h1 className="text-2xl font-bold text-yellow-400">
          😊 VibeHub
        </h1>

        <div className="hidden md:flex items-center bg-slate-800 rounded-lg px-3 py-2 w-96">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search people, posts, challenges..."
            className="bg-transparent outline-none px-2 w-full text-white"
          />
        </div>

        <div className="flex items-center gap-4">

          <button className="text-slate-300 hover:text-white">
            <Bell />
          </button>

          <button className="text-slate-300 hover:text-white">
            <MessageCircle />
          </button>

          <button className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-black font-semibold flex items-center gap-2">
            <Plus size={18} />
            Create
          </button>

          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-10 h-10 rounded-full"
          />

        </div>

      </div>
    </header>
  );
}