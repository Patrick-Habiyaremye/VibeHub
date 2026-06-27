// 

import AdminLayout from "../AdminLayout";
import useReports from "../hooks/useReports";
import ReportItem from "../components/ReportItem";

export default function Moderation() {
  const { reports, resolveReport } = useReports();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Moderation</h1>

      {reports.map((r) => (
        <ReportItem
          key={r.id}
          report={r}
          onResolve={resolveReport}
        />
      ))}
    </AdminLayout>
  );
}