import { useState } from "react";
import { Search, Bell, MessageCircle, Plus, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../notification/NotificationDropdown";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const username =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">

        <Link to="/feed" className="text-2xl font-bold text-yellow-400">
          😊 VibeHub
        </Link>

        <div className="hidden md:flex items-center bg-slate-800 rounded-lg px-3 py-2 w-96">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search people, posts, challenges..."
            className="bg-transparent outline-none px-2 w-full text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((v) => !v)}
                  className="text-slate-300 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell />
                </button>
                {showNotifications && <NotificationDropdown />}
              </div>

              <Link
                to="/messages"
                className="text-slate-300 hover:text-white"
                aria-label="Messages"
              >
                <MessageCircle />
              </Link>

              <Link
                to="/feed"
                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-black font-semibold flex items-center gap-2"
              >
                <Plus size={18} />
                Create
              </Link>

              <Link to="/profile">
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>

              <button
                onClick={handleSignOut}
                className="text-slate-300 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="px-4 py-2 text-white border border-slate-600 rounded-lg hover:bg-slate-800">
                  Login
                </button>
              </Link>

              <Link to="/register">
                <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-600">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
