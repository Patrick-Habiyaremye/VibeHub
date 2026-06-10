import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import PostCard from "../components/post/PostCard";

export default function Profile() {
  return (
    <div className="bg-slate-950 min-h-screen">

      <Navbar />

      <div className="max-w-7xl mx-auto flex">

        <Sidebar />

        <main className="flex-1 p-6">

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">

            <div className="flex items-center gap-6">

              <img
                src="https://i.pravatar.cc/120"
                alt=""
                className="w-28 h-28 rounded-full"
              />

              <div>

                <h1 className="text-3xl font-bold text-white">
                  Pacifique
                </h1>

                <p className="text-slate-400">
                  Building positivity one smile at a time 😊
                </p>

              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

              <div className="bg-slate-900 p-4 rounded-lg">
                <h3 className="text-yellow-400">
                  😊 Smiles
                </h3>

                <p className="text-2xl font-bold text-white">
                  4,250
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg">
                <h3 className="text-green-400">
                  🌟 Challenges
                </h3>

                <p className="text-2xl font-bold text-white">
                  27
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg">
                <h3 className="text-pink-400">
                  💛 Kindness
                </h3>

                <p className="text-2xl font-bold text-white">
                  91
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg">
                <h3 className="text-blue-400">
                  🙌 Inspired
                </h3>

                <p className="text-2xl font-bold text-white">
                  142
                </p>
              </div>

            </div>

          </div>

          <div className="mt-6">
            <PostCard />
            <PostCard />
          </div>

        </main>

      </div>

    </div>
  );
}