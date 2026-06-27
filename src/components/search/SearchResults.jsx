import { Link } from "react-router-dom";

export default function SearchResults({
  results,
}) {

  if (!results.length) {
    return (
      <div className="text-center py-16">
        <h2 className="text-white text-xl font-bold">
          No results found
        </h2>

        <p className="text-slate-400 mt-2">
          Try another keyword
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {results.map((item) => (

        <div
          key={`${item.type}-${item.id}`}
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            overflow-hidden
            hover:border-yellow-500
            transition
          "
        >

          {/* PEOPLE */}

          {item.type === "people" && (

            <Link
              to={`/profile/${item.id}`}
              className="
                flex
                gap-4
                p-4
              "
            >

              <img
                src={
                  item.avatar_url ||
                  "https://ui-avatars.com/api/?name=User"
                }
                alt=""
                className="
                  w-14
                  h-14
                  rounded-full
                  object-cover
                "
              />

              <div className="flex-1">

                <h3 className="text-white font-bold">
                  {item.username}
                </h3>

                <p className="text-slate-400 text-sm">
                  {item.bio}
                </p>

                {item.latest_post && (

                  <div
                    className="
                      mt-2
                      text-slate-300
                      text-sm
                    "
                  >
                    Latest post:
                    {" "}
                    {item.latest_post}
                  </div>

                )}

              </div>

            </Link>

          )}

          {/* POSTS */}

          {item.type === "posts" && (

            <Link
              to={`/post/${item.id}`}
              className="block p-4"
            >

              <h3
                className="
                  text-white
                  text-lg
                "
              >
                {item.content}
              </h3>

              {item.media_url && (

                <img
                  src={item.media_url}
                  alt=""
                  className="
                    mt-3
                    rounded-xl
                    max-h-96
                    w-full
                    object-cover
                  "
                />

              )}

            </Link>

          )}

          {/* REELS */}

          {item.type === "reels" && (

            <Link
              to={`/reels/${item.id}`}
              className="block p-4"
            >

              <video
                muted
                className="
                  rounded-xl
                  w-full
                  max-h-96
                "
              >
                <source
                  src={item.video_url}
                />
              </video>

              <p
                className="
                  text-white
                  mt-3
                "
              >
                {item.caption}
              </p>

            </Link>

          )}

          {/* CHALLENGES */}

          {item.type === "challenges" && (

            <Link
              to={`/challenges/${item.id}`}
              className="block p-4"
            >

              <h3
                className="
                  text-yellow-400
                  font-bold
                "
              >
                🌈 {item.title}
              </h3>

              <p className="text-slate-300">
                {item.description}
              </p>

            </Link>

          )}

        </div>

      ))}

    </div>
  );
}