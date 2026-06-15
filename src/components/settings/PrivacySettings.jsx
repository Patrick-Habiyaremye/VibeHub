export default function PrivacySettings() {
  return (
    <div className="bg-slate-800 p-5 rounded-xl mb-6">

      <h2 className="text-xl text-white mb-4">
        Privacy 🔒
      </h2>

      <label className="text-white block mb-3">
        <input type="checkbox" />
        {" "}
        Private Profile
      </label>

      <label className="text-white block">
        <input type="checkbox" />
        {" "}
        Hide Activity Status
      </label>

    </div>
  );
}