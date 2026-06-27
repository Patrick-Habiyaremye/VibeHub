import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const items = [
  {
    label: "Feed",
    icon: "🏠",
    to: "/feed",
    protected: false,
  },
  {
    label: "Reels",
    icon: "🎥",
    to: "/discover",
    protected: true,
  },
  {
    label: "Challenges",
    icon: "🌈",
    to: "/challenges",
    protected: true,
  },
  {
    label: "Messages",
    icon: "💬",
    to: "/messages",
    protected: true,
  },
  {
    label: "Profile",
    icon: "👤",
    to: "/profile",
    protected: true,
  },
  {
    label: "Settings",
    icon: "⚙",
    to: "/settings",
    protected: true,
  },
];

export default function Sidebar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  function handleClick(e, item) {
    if (item.protected && !user) {
      e.preventDefault();
      navigate("/login");
    }
  }

  return (
    <>
      {/* ================= DESKTOP ================= */}

      <aside
        className="
          hidden
          lg:flex
          flex-col
          w-60
          xl:w-64
          sticky
          top-[72px]
          self-start
          h-[calc(100vh-90px)]
          py-5
        "
      >
        {/* User Card */}

        {user ? (
          <div className="bg-slate-900 rounded-2xl p-4 mb-5 border border-slate-800">
            <div className="flex items-center gap-3">

              <img
                src={
                  profile?.avatar_url ||
                  "https://ui-avatars.com/api/?name=User"
                }
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="min-w-0">
                <p className="text-white font-semibold truncate">
                  {profile?.username || "User"}
                </p>

                <p className="text-slate-400 text-sm truncate">
                  Spread positivity ✨
                </p>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl p-4 mb-5 border border-slate-800">
            <h3 className="text-white font-semibold">
              Welcome 👋
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              Login to unlock messaging, reels and challenges.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="
                mt-4
                w-full
                rounded-xl
                bg-yellow-500
                py-2
                font-semibold
                text-black
                hover:bg-yellow-400
                transition
              "
            >
              Login
            </button>
          </div>
        )}

        {/* Navigation */}

        <nav className="flex flex-col gap-2">

          {items.map((item) => {

            const locked =
              item.protected && !user;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e) =>
                  handleClick(e, item)
                }
                title={
                  locked
                    ? "Login required"
                    : ""
                }
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-4
                  py-3
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? "bg-yellow-500 text-black shadow-lg"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:translate-x-1"
                  }
                  `
                }
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">
                    {item.icon}
                  </span>

                  {item.label}
                </span>

                {locked && (
                  <span className="text-xs">
                    🔒
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}

        {/* <div className="mt-auto pt-6 mb-5">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-sm text-slate-400">
              😊 Keep spreading positive vibes every day.
            </p>
          </div>
        </div> */}
      </aside>

      {/* ================= MOBILE ================= */}

      <nav
        className="
          lg:hidden
          fixed
          bottom-0
          left-0
          right-0
          z-50

          border-t
          border-slate-800

          bg-slate-950/95
          backdrop-blur-xl

          shadow-[0_-8px_20px_rgba(0,0,0,.35)]

          px-2
          pt-2
          pb-[max(env(safe-area-inset-bottom),12px)]
        "
      >
        <div className="grid grid-cols-5">

          {items.slice(0, 5).map((item) => {

            const locked =
              item.protected && !user;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e) =>
                  handleClick(e, item)
                }
                title={
                  locked
                    ? "Login required"
                    : ""
                }
                className={({ isActive }) =>
                  `
                  relative

                  flex
                  flex-col
                  items-center
                  justify-center

                  py-2

                  transition

                  ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-400"
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div
                        className="
                          absolute
                          top-0
                          w-10
                          h-1
                          rounded-full
                          bg-yellow-400
                        "
                      />
                    )}

                    <div className="relative text-xl">
                      {item.icon}

                      {locked && (
                        <span
                          className="
                            absolute
                            -top-1
                            -right-2
                            text-[10px]
                          "
                        >
                          🔒
                        </span>
                      )}
                    </div>

                    <span className="mt-1 text-[11px]">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

        </div>
      </nav>
    </>
  );
}