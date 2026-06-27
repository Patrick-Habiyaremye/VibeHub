// /admin/AdminSidebar.jsx

// import { NavLink } from "react-router-dom";

// const menu = [
//   {
//     label: "Dashboard",
//     icon: "📊",
//     to: "/admin",
//   },
//   {
//     label: "Moderation",
//     icon: "🚨",
//     to: "/admin/moderation",
//   },
//   {
//     label: "Users",
//     icon: "👥",
//     to: "/admin/users",
//   },
//   {
//     label: "Analytics",
//     icon: "📈",
//     to: "/admin/analytics",
//   },
//   {
//     label: "Activity",
//     icon: "⚡",
//     to: "/admin/activity",
//   },
// ];

// export default function AdminSidebar() {
//   return (
//     <aside className="
//       w-64
//       bg-slate-900
//       border-r
//       border-slate-800
//       hidden
//       lg:flex
//       flex-col
//       p-4
//       gap-2
//     ">
//       {/* BRAND */}
//       <div className="mb-6 px-2">
//         <h1 className="text-yellow-400 text-xl font-bold">
//           ⚙ Admin Panel
//         </h1>
//         <p className="text-xs text-slate-400">
//           Vibehub Control Center
//         </p>
//       </div>

//       {/* MENU */}
//       <nav className="flex flex-col gap-2">
//         {menu.map((item) => (
//           <NavLink
//             key={item.to}
//             to={item.to}
//             end={item.to === "/admin"}
//             className={({ isActive }) => `
//               flex
//               items-center
//               gap-3
//               px-4
//               py-3
//               rounded-xl
//               transition
//               text-sm
//               ${
//                 isActive
//                   ? "bg-yellow-500 text-black font-semibold"
//                   : "text-slate-300 hover:bg-slate-800"
//               }
//             `}
//           >
//             <span className="text-lg">{item.icon}</span>
//             {item.label}
//           </NavLink>
//         ))}
//       </nav>

//       {/* FOOTER INFO */}
//       <div className="mt-auto text-xs text-slate-500 px-2 pt-6">
//         <p>Real-time Admin System</p>
//         <p className="text-slate-600">v1.0 enterprise</p>
//       </div>
//     </aside>
//   );
// }

import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/moderation", label: "Moderation" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/activity", label: "Activity" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-slate-900 p-4">
      <h1 className="text-yellow-400 text-xl font-bold mb-6">
        🛡 Dashboard
      </h1>

      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className="block py-2 px-3 rounded hover:bg-slate-800"
        >
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}