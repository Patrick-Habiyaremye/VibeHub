import useShare from "./hooks/useShare";

export default function ShareButton({ postId }) {
  const { share } = useShare();

  return (
    <button
      onClick={() => share(postId)}
      className="
        flex items-center gap-2
        text-sm text-gray-400
        hover:text-white transition
      "
    >
      🔗 Share
    </button>
  );
}