import {
  Search,
  Bell,
  Plus,
  ChevronDown,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

import Logo from "../ui/Logo";
import NotificationDropdown from "../notification/NotificationDropdown";
import NotificationBadge from "../notification/NotificationBadge";
import NotificationModal from "../notification/NotificationModal";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    handleRead,
    handleDelete,
    handleReadAll,
    isPanelOpen,
    togglePanel,
    closePanel,
  } = useNotifications();

  const [search, setSearch] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // 🔍 SEARCH
  const handleSearch = () => {
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ✅ SMART MOBILE DETECTION (NO RESIZE SPAM)
  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");

    const listener = () => setIsMobile(media.matches);
    listener();

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // ✅ OUTSIDE CLICK (FIXED FOR MODAL)
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }

      // ❗ ONLY for desktop dropdown — the mobile modal has its own
      // backdrop-click-to-close and shouldn't also be driven by this.
      if (!isMobile) {
        if (notifRef.current && !notifRef.current.contains(e.target)) {
          closePanel();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, closePanel]);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3">

        {/* Logo */}
        <Logo />

        {/* 🔍 SEARCH (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <button
            onClick={handleSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <Search size={18} />
          </button>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search people, posts, reels..."
            className="w-full rounded-full bg-slate-800 border border-slate-700 focus:border-yellow-500 outline-none pl-11 pr-4 py-2.5 text-white"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {user ? (
            <>
              {/* 🔍 MOBILE SEARCH */}
              <button
                onClick={() => navigate("/search")}
                className="md:hidden text-slate-300 hover:text-white"
              >
                <Search size={21} />
              </button>

              {/* 🔔 NOTIFICATIONS — single shared panel, driven by context */}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    togglePanel();
                    setShowProfileMenu(false);
                  }}
                  className="relative text-slate-300 hover:text-white"
                  aria-haspopup="true"
                  aria-expanded={isPanelOpen}
                  aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                >
                  <Bell size={22} />
                  <NotificationBadge count={unreadCount} />
                </button>

                {isPanelOpen &&
                  (isMobile ? (
                    <NotificationModal
                      open={isPanelOpen}
                      onClose={closePanel}
                      notifications={notifications}
                      onRead={handleRead}
                      onDelete={handleDelete}
                      onReadAll={handleReadAll}
                    />
                  ) : (
                    <NotificationDropdown
                      notifications={notifications}
                      unreadCount={unreadCount}
                      loading={loading}
                      onRead={handleRead}
                      onDelete={handleDelete}
                      onReadAll={handleReadAll}
                    />
                  ))}
              </div>

              {/* 💬 MESSAGES */}
              {/* <Link
                to="/messages"
                className="text-slate-300 hover:text-white"
              >
                <MessageCircle size={22} />
              </Link> */}

              {/* ➕ CREATE (Mobile / Tablet — icon only) */}
              <button
                onClick={() => navigate("/create")}
                className="lg:hidden flex items-center justify-center text-slate-300 hover:text-white"
                aria-label="Create"
              >
                <Plus size={22} />
              </button>

              {/* ➕ CREATE (Desktop — labeled) */}
              <button
                onClick={() => navigate("/create")}
                className="hidden lg:flex items-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 px-4 py-2 font-semibold text-black"
              >
                <Plus size={18} />
                Create
              </button>

              {/* 👤 PROFILE */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    closePanel(); // ✅ prevent overlap
                  }}
                  className="flex items-center gap-2"
                >
                  <img
                    src={
                      profile?.avatar_url ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-yellow-500 object-cover"
                  />

                  <ChevronDown className="hidden sm:block text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-48 sm:w-56 max-w-[90vw] rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl overflow-hidden">
                    <Link
                      to={`/profile/${user.id}`}
                      className="block px-4 py-3 hover:bg-slate-700 text-white"
                    >
                      My Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="block px-4 py-3 hover:bg-slate-700 text-white"
                    >
                      Settings
                    </Link>

                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700 text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="rounded-lg border border-slate-600 px-3 py-2 text-white hover:bg-slate-800">
                  Login
                </button>
              </Link>

              <Link to="/register">
                <button className="rounded-lg bg-yellow-500 hover:bg-yellow-400 px-3 py-2 font-semibold text-black">
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