// import { Link } from "react-router-dom";

// export default function ReelPreview() {
//   return (
//     <div className="
//       bg-slate-800
//       rounded-xl
//       p-4
//       mb-6
//       border
//       border-slate-700
//     ">

//       <h3 className="text-white font-semibold mb-3">
//         Positive Reels 🎥
//       </h3>

//       <p className="text-slate-400 mb-4">
//         Watch uplifting stories from the community.
//       </p>

//       <Link
//         to="/reels"
//         className="
//           bg-yellow-500
//           text-black
//           px-4
//           py-2
//           rounded-lg
//           inline-block
//         "
//       >
//         Open Reels
//       </Link>

//     </div>
//   );
// }

// components/feed/ReelPreview.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function ReelPreview() {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    loadReels();
  }, []);

  async function loadReels() {
    const { data } = await supabase
      .from("reels")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    setReels(data || []);
  }

  if (!reels.length) return null;

  return (
    <div className="bg-slate-900 rounded-xl p-4 mb-6">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-white font-bold">
          Positive Reels 🎥
        </h2>

        <Link
          to="/reels"
          className="text-yellow-400 text-sm"
        >
          View All
        </Link>

      </div>

      <div className="flex gap-4 overflow-x-auto">

        {reels.map((reel) => (
          <Link
            key={reel.id}
            to={`/reels/${reel.id}`}
            className="
              min-w-[160px]
              relative
              rounded-xl
              overflow-hidden
            "
          >

            <video
              src={reel.video_url}
              className="
                h-60
                w-full
                object-cover
              "
            />

            <div className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            ">
              <Play
                size={40}
                className="text-white"
              />
            </div>

          </Link>
        ))}

      </div>

    </div>
  );
}