// features/post/PostHeader.jsx

export default function PostHeader({
  profile,
  createdAt,
}) {

  return (

    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <img
          src={
            profile?.avatar_url ||
            "https://ui-avatars.com/api/?name=User"
          }
          alt="avatar"
          className="
            w-12
            h-12
            rounded-full
            object-cover
            border-2
            border-yellow-500
          "
        />

        <div>

          <h3 className="text-white font-semibold">
            {profile?.username || "Unknown User"}
          </h3>

          <p className="text-xs text-slate-400">
            💛 Positive Supporter
          </p>

        </div>

      </div>

      <p className="text-xs text-slate-500">

        {
          createdAt
          ? new Date(createdAt)
              .toLocaleDateString()
          : ""
        }

      </p>

    </div>

  );

}