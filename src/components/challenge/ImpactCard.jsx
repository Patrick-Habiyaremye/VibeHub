export default function ImpactCard() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">

      <h2 className="text-lg font-bold text-green-400 mb-4">
        😊 Your Impact
      </h2>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span className="text-slate-300">
            Smiles Created
          </span>

          <span className="font-semibold text-white">
            4,250
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-300">
            Challenges Completed
          </span>

          <span className="font-semibold text-white">
            27
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-300">
            People Inspired
          </span>

          <span className="font-semibold text-white">
            142
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-300">
            Kindness Score
          </span>

          <span className="font-semibold text-yellow-400">
            91
          </span>
        </div>

      </div>

    </div>
  );
}