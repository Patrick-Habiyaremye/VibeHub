// features/post/VideoPlayer.jsx

export default function VideoPlayer({
  src,
}) {

  if (!src) return null;

  return (

    <video
      controls
      playsInline
      className="
        w-full
        rounded-2xl
        bg-black
        max-h-[650px]
      "
    >

      <source
        src={src}
        type="video/mp4"
      />

      Your browser does not support video.

    </video>

  );

}