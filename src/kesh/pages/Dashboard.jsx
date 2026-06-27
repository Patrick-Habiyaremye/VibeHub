// 

import AdminLayout from "../AdminLayout";
import useAdminStats from "../hooks/useAdminStats";
import StatCard from "../components/StatCard";
import LiveTicker from "../components/LiveTicker";

export default function Dashboard() {
  const { stats } = useAdminStats();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Posts" value={stats.posts} />
        <StatCard label="Reports" value={stats.reports} />
        <StatCard label="Messages" value={stats.messages} />
      </div>

      <div className="mt-6">
        <LiveTicker />
      </div>
    </AdminLayout>
  );
}