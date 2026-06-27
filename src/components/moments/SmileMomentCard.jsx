export default function SmileMomentCard({ moment, onClick }) {
  return (
    <div
      onClick={onClick}
      className="min-w-[80px] text-center cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full border-2 border-pink-400 overflow-hidden mx-auto">

        {moment.media_type === "image" && (
          <img
            src={moment.media_url}
            className="w-full h-full object-cover"
          />
        )}

        {moment.media_type === "video" && (
          <video
            src={moment.media_url}
            className="w-full h-full object-cover"
          />
        )}

        {moment.media_type === "text" && (
          <div className="flex items-center justify-center h-full text-xs p-1">
            {moment.caption?.slice(0, 20)}
          </div>
        )}

      </div>

      <p className="text-xs text-white mt-1 truncate">
        {moment.caption}
      </p>
    </div>
  );
}