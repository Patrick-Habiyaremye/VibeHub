export default function RightPanel() {
  return (
    <aside className="hidden xl:block w-80 p-4 space-y-4">

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h2 className="text-yellow-400 font-bold mb-2">
          🌟 Today's Challenge
        </h2>

        <p className="text-slate-300">
          Make 3 people smile today 😊
        </p>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h2 className="text-green-400 font-bold mb-2">
          😊 Community Impact
        </h2>

        <p className="text-slate-300">
          24,582 smiles created today
        </p>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h2 className="text-blue-400 font-bold mb-2">
          🏆 Top Positive Creators
        </h2>

        <ul className="space-y-2 text-slate-300">
          <li>😊 Alice</li>
          <li>😊 John</li>
          <li>😊 Sarah</li>
        </ul>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h2 className="text-purple-400 font-bold mb-2">
          💬 Quick Messages
        </h2>

        <button className="w-full mb-2 bg-slate-700 rounded-lg p-2 text-left">
          Great job! 💛
        </button>

        <button className="w-full mb-2 bg-slate-700 rounded-lg p-2 text-left">
          You inspired me 😊
        </button>

        <button className="w-full bg-slate-700 rounded-lg p-2 text-left">
          Keep going 🌟
        </button>
      </div>

    </aside>
  );
}