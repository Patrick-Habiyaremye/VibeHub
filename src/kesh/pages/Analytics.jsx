import AdminLayout from "../AdminLayout";
import useAdminStats from "../hooks/useAdminStats";

export default function Analytics() {
  const { stats } = useAdminStats();

  const chartData = {
    chartType: "bar",
    meta: {
      title: "Platform Activity Overview",
      description: "Current system usage metrics",
    },
    xKey: "metric",
    series: [
      {
        dataKey: "value",
        label: "Count",
        valueFormat: "integer",
      },
    ],
    data: [
      { metric: "Users", value: stats.users },
      { metric: "Posts", value: stats.posts },
      { metric: "Reports", value: stats.reports },
      { metric: "Messages", value: stats.messages },
    ],
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* LIVE CHART */}
      <div className="mb-6">
        {/** CHART WIDGET */}
        <div>{/* placeholder for your chart engine */}</div>
      </div>

      {/* fallback visual */}
      <pre className="text-green-400 bg-slate-900 p-4 rounded-xl overflow-auto">
        {JSON.stringify(chartData, null, 2)}
      </pre>
    </AdminLayout>
  );
}