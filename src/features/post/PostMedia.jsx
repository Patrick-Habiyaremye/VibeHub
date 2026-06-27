// features/post/PostMedia.jsx

export default function PostMedia({
  post,
}) {

  if (!post?.media_url) {

    return null;

  }

  if (
    post.media_type === "image"
  ) {

    return (

      <div className="mt-4">

        <img
          src={post.media_url}
          alt="post"
          className="
            w-full
            rounded-2xl
            max-h-[600px]
            object-cover
            border
            border-slate-700
          "
        />

      </div>

    );

  }

  if (
    post.media_type === "video"
  ) {

    return (

      <div className="mt-4">

        <video
          controls
          className="
            w-full
            rounded-2xl
            border
            border-slate-700
          "
        >

          <source
            src={post.media_url}
          />

        </video>

      </div>

    );

  }

  return null;

}