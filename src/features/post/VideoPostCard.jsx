// features/post/VideoPostCard.jsx

import { useState }
from "react";

import PostHeader
from "./PostHeader";

import VideoPlayer
from "./VideoPlayer";

import SmileMeter
from "./SmileMeter";

import ReactionBar
from "./ReactionBar";

import CommentDrawer
from "./CommentDrawer";

export default function VideoPostCard({
  post,
}) {

  const [

    openComments,

    setOpenComments

  ] = useState(false);

  return (

    <div
      className="
        bg-slate-800
        border
        border-slate-700
        rounded-2xl
        overflow-hidden
        mb-6
      "
    >

      <div className="p-4">

        <PostHeader
          profile={post.profiles}
          createdAt={post.created_at}
        />

      </div>

      <VideoPlayer
        src={post.media_url}
      />

      <div className="p-4">

        {post.content && (

          <p
            className="
              text-slate-200
              mb-4
            "
          >
            {post.content}
          </p>

        )}

        <SmileMeter
          postId={post.id}
        />

        <ReactionBar
          post={post}
        />

        <button
          onClick={()=>
            setOpenComments(true)
          }
          className="
            mt-4
            bg-yellow-500
            hover:bg-yellow-600
            text-black
            px-4
            py-2
            rounded-lg
            font-semibold
          "
        >
          Open Comments
        </button>

      </div>

      <CommentDrawer
        open={openComments}
        onClose={()=>
          setOpenComments(false)
        }
        postId={post.id}
      />

    </div>

  );

}