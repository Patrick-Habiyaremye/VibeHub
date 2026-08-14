// components/ActivityItem.jsx

export default function ActivityItem({ activity }) {
  return (
    <div className="text-sm text-slate-300 border-b border-slate-700 py-2">
      {activity.text}
    </div>
  );
}