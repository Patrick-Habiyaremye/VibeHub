// components/AdminSidebar.jsx
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/moderation", label: "Moderation" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/activity", label: "Activity" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-slate-900 p-4">
      <h1 className="text-yellow-400 text-xl font-bold mb-6">🛡 Dashboard</h1>

      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            `block py-2 px-3 rounded mb-1 transition-colors ${
              isActive
                ? "bg-slate-800 text-yellow-400 font-medium"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}
