export default function AppearanceSettings() {
  return (
    <div className="bg-slate-800 p-5 rounded-xl mb-6">

      <h2 className="text-xl text-white mb-4">
        Appearance 🎨
      </h2>

      <select
        className="bg-slate-900 text-white p-3 rounded"
      >
        <option>Dark Mode</option>
        <option>Light Mode</option>
      </select>

    </div>
  );
}