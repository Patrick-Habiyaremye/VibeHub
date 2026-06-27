import {
  Search,
  Bell,
  MessageCircle,
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
import Logo from "../ui/Logo";

export default function Navbar() {
  const {
    user,
    profile,
    signOut,
  } = useAuth();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuRef = useRef(null);

  const handleSearch = () => {
    if (!search.trim()) return;

    navigate(
      `/search?q=${encodeURIComponent(search)}`
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <header
      className="
        sticky
        top-0
        z-50
        bg-slate-900/95
        backdrop-blur-xl
        border-b
        border-slate-800
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          h-16
          px-3
          sm:px-4
          lg:px-6
          flex
          items-center
          justify-between
          gap-3
        "
      >
        {/* Logo */}
        <Logo />

        {/* Search */}

        <div
          className="
            hidden
            md:flex
            flex-1
            max-w-xl
            relative
          "
        >
          <button
            onClick={handleSearch}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          >
            <Search size={18} />
          </button>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Search people, posts, reels..."
            className="
              w-full
              rounded-full
              bg-slate-800
              border
              border-slate-700
              focus:border-yellow-500
              outline-none
              pl-11
              pr-4
              py-2.5
              text-white
            "
          />
        </div>

        {/* Right Side */}

        <div
          className="
            flex
            items-center
            gap-2
            sm:gap-3
          "
        >
          {user ? (
            <>
              {/* Mobile Search */}

              <button
                onClick={() => navigate("/search")}
                className="
                  md:hidden
                  text-slate-300
                  hover:text-white
                  transition
                "
              >
                <Search size={21} />
              </button>

              {/* Notifications */}

              <Link
                to="/notifications"
                className="
                  relative
                  text-slate-300
                  hover:text-white
                  transition
                "
              >
                <Bell size={22} />

                {/* Example badge */}

                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    w-2
                    h-2
                    rounded-full
                    bg-red-500
                  "
                />
              </Link>

              {/* Messages */}

              <Link
                to="/messages"
                className="
                  relative
                  text-slate-300
                  hover:text-white
                  transition
                "
              >
                <MessageCircle size={22} />
              </Link>

              {/* Create */}

              <button
                onClick={() =>
                  navigate("/create")
                }
                className="
                  hidden
                  lg:flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-yellow-500
                  hover:bg-yellow-400
                  px-4
                  py-2
                  font-semibold
                  text-black
                  transition
                "
              >
                <Plus size={18} />
                Create
              </button>

              {/* Profile */}

              <div
                ref={menuRef}
                className="relative"
              >
                <button
                  onClick={() =>
                    setShowProfileMenu(
                      !showProfileMenu
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <img
                    src={
                      profile?.avatar_url ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    alt="Profile"
                    className="
                      w-9
                      h-9
                      sm:w-10
                      sm:h-10
                      rounded-full
                      border-2
                      border-yellow-500
                      object-cover
                    "
                  />

                  <ChevronDown
                    size={16}
                    className="
                      hidden
                      sm:block
                      text-slate-400
                    "
                  />
                </button>

                {showProfileMenu && (
                  <div
                    className="
                      absolute
                      right-0
                      mt-3
                      w-56
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-700
                      bg-slate-800
                      shadow-2xl
                    "
                  >
                    <Link
                      to={`/profile/${user.id}`}
                      className="
                        block
                        px-4
                        py-3
                        hover:bg-slate-700
                        text-white
                      "
                    >
                      My Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="
                        block
                        px-4
                        py-3
                        hover:bg-slate-700
                        text-white
                      "
                    >
                      Settings
                    </Link>

                    <Link
                      to="/supporters"
                      className="
                        block
                        px-4
                        py-3
                        hover:bg-slate-700
                        text-white
                      "
                    >
                      My Supporters
                    </Link>

                    <button
                      onClick={signOut}
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        hover:bg-slate-700
                        text-red-400
                      "
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
                <button
                  className="
                    rounded-lg
                    border
                    border-slate-600
                    px-3
                    sm:px-4
                    py-2
                    text-sm
                    sm:text-base
                    text-white
                    hover:bg-slate-800
                    transition
                  "
                >
                  Login
                </button>
              </Link>

              <Link to="/register">
                <button
                  className="
                    rounded-lg
                    bg-yellow-500
                    hover:bg-yellow-400
                    px-3
                    sm:px-4
                    py-2
                    text-sm
                    sm:text-base
                    font-semibold
                    text-black
                    transition
                  "
                >
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