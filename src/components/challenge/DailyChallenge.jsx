export default function DailyChallenge() {
  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500 rounded-xl p-5 mb-6">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-yellow-400">
          🌟 Today's Challenge
        </h2>

        <span className="text-sm text-slate-300">
          Daily Mission
        </span>
      </div>

      <p className="mt-3 text-slate-200">
        Make 3 people smile today 😊
      </p>

      <div className="mt-4">
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-yellow-500 h-3 rounded-full"
            style={{ width: "66%" }}
          />
        </div>

        <p className="mt-2 text-sm text-slate-300">
          Progress: 2 / 3
        </p>
      </div>
    </div>
  );
}