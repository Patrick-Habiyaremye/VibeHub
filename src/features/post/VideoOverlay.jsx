import {
  Play,
  Loader2,
  AlertCircle,
  VolumeX,
} from "lucide-react";

export default function VideoOverlay({
  loading = false,
  error = false,
  playing = false,
  muted = true,
  duration = 0,
  showPlayButton = true,
  onPlayPause,
}) {
  const formatDuration = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Top gradient */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-24
          bg-gradient-to-b
          from-black/70
          to-transparent
          pointer-events-none
        "
      />

      {/* Bottom gradient */}
      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-32
          bg-gradient-to-t
          from-black/80
          via-black/20
          to-transparent
          pointer-events-none
        "
      />

      {/* Loading */}
      {loading && (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-black/35
            backdrop-blur-sm
            z-40
          "
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2
              className="
                h-10
                w-10
                text-white
                animate-spin
              "
            />

            <span className="text-white text-sm">
              Loading video...
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-black/70
            z-50
          "
        >
          <div className="text-center px-6">
            <AlertCircle
              className="
                w-14
                h-14
                mx-auto
                text-red-400
                mb-4
              "
            />

            <p className="text-white font-semibold">
              Unable to load video
            </p>

            <p className="text-slate-300 text-sm mt-2">
              Please try again later.
            </p>
          </div>
        </div>
      )}

      {/* Center Play Button */}
      {!loading &&
        !error &&
        !playing &&
        showPlayButton && (
          <button
            onClick={onPlayPause}
            aria-label="Play video"
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              z-30
              group
            "
          >
            <div
              className="
                h-20
                w-20
                rounded-full
                bg-black/55
                backdrop-blur-md
                border
                border-white/20
                flex
                items-center
                justify-center
                transition
                group-hover:scale-110
                group-active:scale-95
              "
            >
              <Play
                className="
                  h-10
                  w-10
                  text-white
                  ml-1
                "
                fill="white"
              />
            </div>
          </button>
        )}

      {/* Mute Hint */}
      {muted &&
        !loading &&
        !error &&
        playing && (
          <div
            className="
              absolute
              top-4
              right-4
              bg-black/60
              backdrop-blur-md
              px-3
              py-2
              rounded-full
              flex
              items-center
              gap-2
              z-20
            "
          >
            <VolumeX
              className="w-4 h-4 text-white"
            />

            <span
              className="
                text-xs
                text-white
                font-medium
              "
            >
              Tap speaker to unmute
            </span>
          </div>
        )}

      {/* Duration */}
      {!loading &&
        !error &&
        duration > 0 && (
          <div
            className="
              absolute
              bottom-4
              right-4
              bg-black/70
              backdrop-blur-md
              px-2
              py-1
              rounded-md
              text-xs
              text-white
              font-medium
              z-20
            "
          >
            {formatDuration(duration)}
          </div>
        )}
    </>
  );
}