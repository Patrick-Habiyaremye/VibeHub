import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";

export default function PostCard() {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">

      <div className="flex items-center gap-3">

        <img
          src="https://i.pravatar.cc/40"
          alt=""
          className="w-10 h-10 rounded-full"
        />

        <div>
          <h3 className="text-white font-semibold">
            Pacifique
          </h3>

          <p className="text-slate-400 text-sm">
            2 hours ago
          </p>
        </div>

      </div>

      <p className="text-slate-200 mt-4">
        Today I helped a classmate understand
        networking concepts 😊
      </p>

      <img
        src="https://picsum.photos/600/400"
        alt=""
        className="w-full rounded-lg mt-4"
      />

      <ReactionBar smileScore={42} />

      <CommentSection />

    </div>
  );
}