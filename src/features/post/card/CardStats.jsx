import {
  MessageCircle,
  Share2,
  Eye,
} from "lucide-react";

export default function CardStats({

  smiles = 0,

  comments = 0,

  shares = 0,
  bookmarks=0,

  views = null,

}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        px-4
        py-3
        border-t
        border-b
        border-slate-800
        text-sm
        text-slate-400
      "
    >

      <div className="flex items-center gap-6">

        <div className="flex items-center gap-2">

          <span className="text-lg">

            😊

          </span>

          <span>

            {smiles.toLocaleString()}

          </span>

        </div>

        <div className="flex items-center gap-2">

          <MessageCircle size={17} />

          <span>

            {comments.toLocaleString()}

          </span>

        </div>

        <div className="flex items-center gap-2">

          <Share2 size={17} />

          <span>

            {shares.toLocaleString()}

          </span>

        </div>
                <div className="flex items-center gap-2">

          <bookmarks size={17} />

          <span>

            {bookmarks.toLocaleString()}

          </span>

        </div>

      </div>

      {views !== null && (

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <Eye size={16} />

          <span>

            {views.toLocaleString()}

          </span>

        </div>

      )}

    </div>

  );

}