export default function ReactionBar({
  smileScore = 0,
}) {

  return (
    <div className="flex justify-between items-center mt-4">

      <div className="flex gap-3">

        <button className="hover:scale-110 transition">
          😂
        </button>

        <button className="hover:scale-110 transition">
          💛
        </button>

        <button className="hover:scale-110 transition">
          🔥
        </button>

        <button className="hover:scale-110 transition">
          🙌
        </button>

      </div>

      <div className="text-yellow-400 font-semibold">
        😊 {smileScore} Smiles
      </div>

    </div>
  );
}