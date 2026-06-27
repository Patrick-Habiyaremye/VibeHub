// /admin/AdminLayout.jsx

// 

// import AdminSidebar from "./AdminSidebar";

// export default function AdminLayout({ children }) {
//   return (
//     <div className="flex min-h-screen bg-slate-950 text-white">
//       <AdminSidebar />

//       <main className="flex-1 p-6">{children}</main>
//     </div>
//   );
// }

import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}