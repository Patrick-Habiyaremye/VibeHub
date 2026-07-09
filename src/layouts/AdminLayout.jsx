import { Outlet } from "react-router-dom";
import AdminSidebar from "../kesh/components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <AdminSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}