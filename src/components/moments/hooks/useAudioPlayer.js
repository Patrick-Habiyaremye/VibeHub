import { useEffect, useRef } from "react";

/**
 * Owns exactly one Audio() instance — background music for image
 * moments. Video moments carry their own audio track; the caller
 * applies `muted` directly to the <video> element, so this hook no-ops
 * for videos to guarantee only one audio source ever plays.
 *
 * Torn down (paused + detached) on every moment change and on unmount,
 * so switching stories can never leave two tracks overlapping.
 */
export function useAudioPlayer({ moment, muted, paused }) {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;

    const isImageWithMusic = moment?.media_type === "image" && moment?.music_url;
    if (isImageWithMusic) {
      const audio = new Audio(moment.music_url);
      audio.loop = true;
      audio.volume = 0.5;
      audio.muted = muted;
      audioRef.current = audio;
      if (!paused) audio.play().catch(() => {});
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moment?.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (paused) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
  }, [paused]);

  return audioRef;
}