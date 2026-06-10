import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

export default function Discover() {
  return (
    <div className="bg-slate-950 min-h-screen">

      <Navbar />

      <div className="max-w-7xl mx-auto flex">

        <Sidebar />

        <main className="flex-1 p-6">

          <h1 className="text-3xl font-bold text-white mb-6">
            😊 Making People Smile Today
          </h1>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-yellow-400 text-xl font-bold">
                🌟 Popular Challenges
              </h2>

              <ul className="mt-4 space-y-2 text-slate-300">
                <li>Make 3 people smile today</li>
                <li>Send a gratitude message</li>
                <li>Help someone learn something</li>
              </ul>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-green-400 text-xl font-bold">
                😊 Positive Stories
              </h2>

              <ul className="mt-4 space-y-2 text-slate-300">
                <li>Community cleanup success</li>
                <li>Student helped classmates</li>
                <li>Local kindness campaign</li>
              </ul>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-pink-400 text-xl font-bold">
                💛 Kindness Spotlight
              </h2>

              <p className="mt-4 text-slate-300">
                Celebrate people making a difference in the community.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-blue-400 text-xl font-bold">
                🙌 Community Impact
              </h2>

              <p className="mt-4 text-slate-300">
                24,582 smiles created this week.
              </p>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
}