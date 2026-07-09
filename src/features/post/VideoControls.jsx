import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";

export default function VideoControls({
  playing = false,
  muted = true,
  progress = 0,
  duration = 0,
  onPlayPause,
  onMute,
  onSeek,
  onFullscreen,
}) {
  const percentage =
    duration > 0
      ? (progress / duration) * 100
      : 0;

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds))
      return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const value = Number(e.target.value);

    if (onSeek) {
      onSeek(value);
    }
  };

  return (
    <div
      className="
        absolute
        bottom-0
        left-0
        right-0
        z-40

        bg-gradient-to-t
        from-black/90
        via-black/40
        to-transparent

        px-4
        pt-10
        pb-4
      "
    >
      {/* Progress */}
      <div className="mb-3">

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={handleSeek}
          className="
            w-full
            cursor-pointer
            accent-yellow-400
          "
        />

      </div>

      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        {/* Left */}
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <button
            onClick={onPlayPause}
            aria-label="Play/Pause"
            className="
              h-10
              w-10
              rounded-full

              bg-black/50

              hover:bg-black/70

              transition

              flex
              items-center
              justify-center
            "
          >
            {playing ? (
              <Pause
                size={20}
                className="text-white"
              />
            ) : (
              <Play
                size={20}
                fill="white"
                className="text-white ml-0.5"
              />
            )}
          </button>

          <button
            onClick={onMute}
            aria-label="Mute"
            className="
              h-10
              w-10
              rounded-full

              bg-black/50

              hover:bg-black/70

              transition

              flex
              items-center
              justify-center
            "
          >
            {muted ? (
              <VolumeX
                size={20}
                className="text-white"
              />
            ) : (
              <Volume2
                size={20}
                className="text-white"
              />
            )}
          </button>

          <span
            className="
              text-xs
              text-white
              font-medium
            "
          >
            {formatTime(progress)}
            {" / "}
            {formatTime(duration)}
          </span>
        </div>

        {/* Right */}
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <button
            onClick={onFullscreen}
            aria-label="Fullscreen"
            className="
              h-10
              w-10
              rounded-full

              bg-black/50

              hover:bg-black/70

              transition

              flex
              items-center
              justify-center
            "
          >
            <Maximize
              size={20}
              className="text-white"
            />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="
          mt-3
          h-1
          rounded-full
          bg-white/20
          overflow-hidden
        "
      >
        <div
          className="
            h-full
            bg-yellow-400
            transition-all
          "
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}