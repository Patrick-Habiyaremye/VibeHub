// C:\code\KeshApp\VibeHub\src\components\moments\momentLimits.js

// Single source of truth for every video-length/size number used
// across upload (CreateSmileMoment, VideoTrimmer) and playback
// (StoryViewer). Previously these lived as separate hardcoded
// constants in each file — StoryViewer's own MAX_VIDEO_SECONDS could
// silently drift from CreateSmileMoment's, which is exactly what
// would have happened bumping only one of them to allow longer clips.

// Max length of a moment's video, enforced both at trim-time (what a
// user can select) and at playback-time (safety net in StoryViewer).
export const MAX_VIDEO_SECONDS = 120;

// Target OUTPUT size for an exported clip, regardless of its length.
// This is what actually protects upload speed as MAX_VIDEO_SECONDS
// goes up: instead of holding bitrate fixed (which would make a 120s
// clip ~2x the bytes of a 60s clip at the same quality), bitrate is
// solved backwards from this size budget so a 120s clip and a 20s
// clip both land close to the same file size — upload time stays
// roughly flat as the duration cap increases, instead of scaling
// linearly with it.
export const MOMENT_TARGET_OUTPUT_BYTES = 20 * 1024 * 1024; // ~20MB

// Hard ceiling regardless of adaptive bitrate math — protects against
// an edge case (e.g. very short clip) computing an unreasonably high
// bitrate.
export const MOMENT_MAX_VIDEO_BITRATE = 2_500_000;
// Floor so long clips don't get compressed into visible mush —
// below this, quality loss becomes the bigger problem than upload
// time, so accept a larger file instead of degrading further.
export const MOMENT_MIN_VIDEO_BITRATE = 700_000;

export const MOMENT_AUDIO_BITRATE = 128_000;

// Overall file-size cap actually enforced on the exported blob —
// generous margin above MOMENT_TARGET_OUTPUT_BYTES to allow for
// harder-to-compress source footage without hard-failing the export,
// while still catching genuinely oversized results.
export const MAX_VIDEO_MB = 45;

/**
 * Solves for a video bitrate that lands the exported clip near
 * MOMENT_TARGET_OUTPUT_BYTES, given the clip's length. This is the
 * piece that makes "raise the duration cap" NOT mean "uploads get
 * proportionally slower" — a 20s clip and a 110s clip both target
 * roughly the same output size, just at different quality levels.
 */
export function computeAdaptiveVideoBitrate(durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0) return MOMENT_MAX_VIDEO_BITRATE;
  const targetBits = MOMENT_TARGET_OUTPUT_BYTES * 8;
  const bitrate = targetBits / durationSeconds - MOMENT_AUDIO_BITRATE;
  return Math.min(MOMENT_MAX_VIDEO_BITRATE, Math.max(MOMENT_MIN_VIDEO_BITRATE, bitrate));
}