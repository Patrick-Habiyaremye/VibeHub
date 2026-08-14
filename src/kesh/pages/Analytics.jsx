// pages/Analytics.jsx
import useAdminStats from "../hooks/useAdminStats";
import ChartBox from "../components/ChartBox";
import BarChart from "../components/BarChart";
import ErrorBanner from "../components/ErrorBanner";

export default function Analytics() {
  const { stats, loading, error, refresh } = useAdminStats();

  const data = [
    { metric: "Users", value: stats.users },
    { metric: "Posts", value: stats.posts },
    { metric: "Reports", value: stats.reports },
    { metric: "Messages", value: stats.messages },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <ErrorBanner message={error} onRetry={refresh} />

      <ChartBox title="Platform Activity Overview">
        {loading ? (
          <div className="text-slate-400 text-sm py-8 text-center">
            Loading chart...
          </div>
        ) : (
          <BarChart data={data} />
        )}
      </ChartBox>
    </>
  );
}
