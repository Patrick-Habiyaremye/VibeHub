import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const items = [
  { label: "Feed", icon: "🏠", to: "/feed", protected: false },
  { label: "Smile Reels", icon: "🎥", to: "/discover", protected: true },
  { label: "Challenges", icon: "🌈", to: "/challenges", protected: true },
  { label: "Messages", icon: "💬", to: "/messages", protected: true },
  { label: "Profile", icon: "👤", to: "/profile", protected: true },
  { label: "Settings", icon: "⚙", to: "/settings", protected: true },
];

const STORAGE_KEY = "sidebar:collapsed";

// ✅ Tailwind's JIT compiler only generates CSS for class names it can find
// literally in the source. A template string like `grid-cols-${n}` never
// matches anything at build time, so the class is applied in the DOM but
// has no styles behind it. Mapping to a fixed, literal set of classes below
// fixes that — this is what broke the mobile bottom nav's layout.
const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

export default function Sidebar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === "admin";

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* localStorage unavailable (private browsing, etc.) — ignore */
    }
  }, [collapsed]);

  function handleClick(e, item) {
    if (item.protected && !user) {
      e.preventDefault();
      navigate("/login");
    }
  }

  const mobileItems = items.slice(0, 5);
  const mobileGridClass = GRID_COLS[Math.min(mobileItems.length, 5)] || "grid-cols-5";

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <aside
        className={`hidden lg:flex flex-col sticky top-[72px] self-start h-[calc(100vh-90px)] py-5 transition-[width] duration-200 ease-out ${
          collapsed ? "w-[76px]" : "w-60 xl:w-64"
        }`}
      >
        {/* User card */}
        {user ? (
          <div
            className={`bg-slate-900 rounded-2xl border border-slate-800 mb-5 transition-all ${
              collapsed ? "p-2" : "p-4"
            }`}
          >
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
              <img
                src={profile?.avatar_url || "https://ui-avatars.com/api/?name=User"}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">
                    {profile?.username || "User"}
                  </p>
                  <p className="text-slate-400 text-sm truncate">Spread positivity ✨</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`bg-slate-900 rounded-2xl border border-slate-800 mb-5 ${collapsed ? "p-2" : "p-4"}`}>
            {!collapsed ? (
              <>
                <h3 className="text-white font-semibold">Welcome 👋</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Log in to unlock messaging, reels, and challenges.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-4 w-full rounded-xl bg-yellow-500 py-2 font-semibold text-black hover:bg-yellow-400 transition-colors"
                >
                  Log in
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full rounded-xl bg-yellow-500 py-2 font-semibold text-black hover:bg-yellow-400 transition-colors"
                title="Log in"
              >
                <Lock size={16} className="mx-auto" />
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {items.map((item) => {
            const locked = item.protected && !user;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e) => handleClick(e, item)}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    collapsed ? "justify-center px-0" : "justify-between"
                  } ${
                    isActive
                      ? "bg-yellow-500 text-black shadow-lg"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:translate-x-1"
                  }`
                }
              >
                <span className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                  <span className="text-xl leading-none">{item.icon}</span>
                  {!collapsed && item.label}
                </span>

                {!collapsed && locked && <Lock size={12} />}

                {/* Tooltip shown only when collapsed */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                    {item.label}
                    {locked && " 🔒"}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Admin Dashboard link — only rendered for admins. This is purely
              a navigation convenience; access control itself is enforced by
              AdminRoute + Postgres RLS, not by hiding this link. */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `group relative flex items-center rounded-xl px-4 py-3 mt-2 border transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "justify-between"
                } ${
                  isActive
                    ? "bg-yellow-500 text-black border-yellow-500 shadow-lg"
                    : "bg-slate-900 text-yellow-400 border-yellow-500/30 hover:bg-slate-800 hover:translate-x-1"
                }`
              }
            >
              <span className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                <ShieldCheck size={20} className="shrink-0" />
                {!collapsed && "Admin Dashboard"}
              </span>

              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                  Admin Dashboard
                </span>
              )}
            </NavLink>
          )}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mt-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors self-stretch"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""} ${collapsed ? "mx-auto" : ""}`}
          />
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </aside>

      {/* ================= MOBILE ================= */}
      {/* Admin link intentionally omitted here — the bottom tab bar is
          capped at 5 items and admin work is desktop-oriented. Admins on
          mobile can still reach /admin by typing the URL directly. */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-[0_-8px_20px_rgba(0,0,0,.35)] px-2 pt-2 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className={`grid ${mobileGridClass}`}>
          {mobileItems.map((item) => {
            const locked = item.protected && !user;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e) => handleClick(e, item)}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2 transition-colors ${
                    isActive ? "text-yellow-400" : "text-slate-400"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute top-0 w-10 h-1 rounded-full bg-yellow-400" />
                    )}
                    <div className="relative text-xl">
                      {item.icon}
                      {locked && (
                        <span className="absolute -top-1 -right-2 text-[10px]">🔒</span>
                      )}
                    </div>
                    <span className="mt-1 text-[11px]">{item.label}</span>
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