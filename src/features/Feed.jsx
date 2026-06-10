import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import RightPanel from "../components/layout/RightPanel";

import DailyChallenge from "../components/challenge/DailyChallenge";

import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";

export default function Feed() {
  return (
    <div className="bg-slate-950 min-h-screen">

      <Navbar />

      <div className="max-w-7xl mx-auto flex">

        <Sidebar />

        <main className="flex-1 max-w-3xl p-6">

          <DailyChallenge />

          <CreatePost />

          <PostCard />
          <PostCard />
          <PostCard />

        </main>

        <RightPanel />

      </div>

    </div>
  );
}