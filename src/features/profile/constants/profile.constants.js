// Fallback media shown while a profile loads or when a custom image is missing/broken.
export const FALLBACK_COVER = "https://picsum.photos/1200/400";
export const FALLBACK_AVATAR = "https://i.pravatar.cc/300";

// Upload / image-processing limits.
export const MAX_FILE_SIZE_MB = 10;
export const OUTPUT_QUALITY = 0.82; // jpeg quality - balance of size vs fidelity
export const AVATAR_MAX_DIMENSION = 512; // avatar output capped at 512x512
export const COVER_MAX_WIDTH = 1200; // cover output capped at 1200px wide
export const COVER_ASPECT = 1200 / 400; // 3:1