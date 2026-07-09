import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CardAuthor({
  profile,
  showVerified = false,
  showSupporter = false,
}) {
  const navigate = useNavigate();

  if (!profile) return null;

  const {
    id,
    username,
    avatar_url,
  } = profile;

  return (
    <div
      className="
        flex
        items-center
        gap-3
        min-w-0
        cursor-pointer
      "
      onClick={() => navigate(`/profile/${id}`)}
    >
      <img
        src={
          avatar_url ||
          "https://ui-avatars.com/api/?background=0f172a&color=ffffff&name=User"
        }
        alt={username}
        className="
          w-11
          h-11
          rounded-full
          object-cover
          border
          border-slate-700
          shrink-0
        "
      />

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <h3
            className="
              font-semibold
              text-white
              truncate
            "
          >
            {username || "Unknown User"}
          </h3>

          {showVerified && (
            <ShieldCheck
              size={16}
              className="text-sky-400"
            />
          )}

        </div>

        {showSupporter && (

          <p
            className="
              text-xs
              text-yellow-400
            "
          >
            ⭐ Positive Creator
          </p>

        )}

      </div>

    </div>
  );
}