// pages/Dashboard.jsx
import useAdminStats from "../hooks/useAdminStats";
import StatCard from "../components/StatCard";
import LiveTicker from "../components/LiveTicker";
import ErrorBanner from "../components/ErrorBanner";

export default function Dashboard() {
  const { stats, loading, error, refresh } = useAdminStats();

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <ErrorBanner message={error} onRetry={refresh} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Users" value={loading ? "—" : stats.users} icon="👥" />
        <StatCard label="Posts" value={loading ? "—" : stats.posts} icon="📝" />
        <StatCard
          label="Open Reports"
          value={loading ? "—" : stats.reports}
          icon="🚩"
        />
        <StatCard
          label="Messages"
          value={loading ? "—" : stats.messages}
          icon="💬"
        />
      </div>

      <div className="mt-6">
        <LiveTicker />
      </div>
    </>
  );
}
// pages/Dashboard.jsx
// import AdminLayout from "../../layouts/AdminLayout";
// import useAdminStats from "../hooks/useAdminStats";
// import StatCard from "../components/StatCard";
// import LiveTicker from "../components/LiveTicker";
// import ErrorBanner from "../components/ErrorBanner";

// export default function Dashboard() {
//   const { stats, loading, error, refresh } = useAdminStats();

//   return (
//     <AdminLayout>
//       <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

//       <ErrorBanner message={error} onRetry={refresh} />

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <StatCard label="Users" value={loading ? "—" : stats.users} icon="👥" />
//         <StatCard label="Posts" value={loading ? "—" : stats.posts} icon="📝" />
//         <StatCard
//           label="Open Reports"
//           value={loading ? "—" : stats.reports}
//           icon="🚩"
//         />
//         <StatCard
//           label="Messages"
//           value={loading ? "—" : stats.messages}
//           icon="💬"
//         />
//       </div>

//       <div className="mt-6">
//         <LiveTicker />
//       </div>
//     </AdminLayout>
//   );
// }
