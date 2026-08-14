// engines/StyleEngine.js

// ============================================================
// ENV + LOGGER
// ============================================================

const isDev = process.env.NODE_ENV !== "production";

function warn(message) {
  if (isDev) console.warn(`[StyleEngine] ${message}`);
}

// ============================================================
// HELPERS
// ============================================================

function normalizeKey(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function isValidGradient(value) {
  return typeof value === "string" && value.length > 10;
}

function isValidColor(value) {
  return typeof value === "string" && value.startsWith("#");
}

// ============================================================
// 🎯 CORE DESIGN TOKENS (SINGLE SOURCE OF TRUTH)
// ============================================================

const COLORS = Object.freeze({
  white: "#FFFFFF",
  black: "#000000",

  gray100: "#F5F5F7",
  gray300: "#D1D1D6",
  gray500: "#6B6B76",
  gray900: "#1C1C1E",

  primary: "#FF3CAC",
  secondary: "#2B86C5",
});

// ============================================================
// 🎯 SEMANTIC TOKENS (MOODS → MEANING)
// ============================================================

const BASE_THEME = Object.freeze({
  gradient:
    "radial-gradient(circle at 20% 20%, #ffffff22, transparent 40%), linear-gradient(135deg,#E5E5EA,#C7C7CC)",
  accent: COLORS.gray500,
  text: COLORS.gray900,
  label: "Neutral",
});

const BASE_MOODS = Object.freeze({
  happy: {
    gradient:
      "radial-gradient(circle at 30% 30%, #fff3 0%, transparent 40%), linear-gradient(135deg,#FFD66B,#FF8A5B,#FF5E7E)",
    accent: COLORS.primary,
    text: COLORS.black,
    label: "Happy",
  },

  calm: {
    gradient:
      "radial-gradient(circle at 70% 20%, #ffffff22, transparent 50%), linear-gradient(135deg,#8FD3C7,#5B9AA0,#3A7D89)",
    accent: COLORS.secondary,
    text: COLORS.black,
    label: "Calm",
  },

  moody: {
    gradient:
      "radial-gradient(circle at 50% 0%, #ffffff11, transparent 40%), linear-gradient(135deg,#1E1E2E,#2A2A40,#3A3A52)",
    accent: "#8C7CF0",
    text: COLORS.white,
    label: "Moody",
  },

  hype: {
    gradient:
      "radial-gradient(circle at 80% 20%, #ffffff33, transparent 40%), linear-gradient(135deg,#FF3CAC,#784BA0,#2B86C5)",
    accent: COLORS.primary,
    text: COLORS.white,
    label: "Hype",
  },
});

// ============================================================
// QUOTE BACKGROUNDS
// ============================================================
// Single source of truth for every quote background — the editor
// (QuoteBlock.jsx) must import QUOTE_BACKGROUND_KEYS/registerBackground
// from here rather than keeping its own copy, or the two will drift
// out of sync again (this is exactly what caused the "neonPulse falls
// back to paper" bug).

const BASE_BACKGROUNDS = Object.freeze({
  sunset: "linear-gradient(135deg,#FF7E5F,#FEB47B)",
  midnight: "linear-gradient(135deg,#0F2027,#203A43,#2C5364)",
  aurora: "linear-gradient(135deg,#00C9FF,#92FE9D)",
  fire: "linear-gradient(135deg,#F00000,#DC281E)",
  ocean: "linear-gradient(135deg,#2E3192,#1BFFFF)",
  lavender: "linear-gradient(135deg,#DA22FF,#9733EE)",
  peach: "linear-gradient(135deg,#ED4264,#FFEDBC)",
  forest: "linear-gradient(135deg,#134E5E,#71B280)",
  cosmic:
    "radial-gradient(circle at 20% 30%, #ff8a00 0%, transparent 40%), radial-gradient(circle at 80% 70%, #8a2be2 0%, transparent 40%), linear-gradient(135deg,#1a0026,#3a0ca3)",
  confetti:
    "linear-gradient(135deg,#4A235A,#2E86C1), radial-gradient(circle,#F4D03F 2px,transparent 3px), radial-gradient(circle,#EC7063 2px,transparent 3px)",
  neonPulse:
    "linear-gradient(135deg,#0f0c29,#302b63,#24243e), radial-gradient(circle at 50% 50%,rgba(255,0,150,0.3),transparent 60%)",

  // fallback used by resolveQuoteBackground when a key is missing/unknown
  paper: "#F4F1EA",
});

// ============================================================
// 🧠 REGISTRY (CONTROLLED MUTATION)
// ============================================================

const moodRegistry = new Map(Object.entries(BASE_MOODS));
const backgroundRegistry = new Map(Object.entries(BASE_BACKGROUNDS));

// ============================================================
// VALIDATION
// ============================================================

function validateTheme(config) {
  if (!config) return false;

  if (!isValidGradient(config.gradient)) {
    warn("Invalid gradient");
    return false;
  }

  if (!isValidColor(config.accent)) {
    warn("Invalid accent color");
    return false;
  }

  return true;
}

// ============================================================
// 🎯 RESOLVERS (TOKEN-AWARE)
// ============================================================

export function resolveMoodTheme(inputMood) {
  const key = normalizeKey(inputMood);

  const theme = key ? moodRegistry.get(key) : null;

  const resolved = theme || BASE_THEME;

  return {
    ...resolved,

    // 🔥 normalize tokens here (future-proofing)
    accent: COLORS[resolved.accent] || resolved.accent,
    text: COLORS[resolved.text] || resolved.text,
  };
}

export function resolveQuoteBackground(styleKey) {
  const key = normalizeKey(styleKey);

  return key && backgroundRegistry.get(key)
    ? backgroundRegistry.get(key)
    : BASE_BACKGROUNDS.paper;
}

// ============================================================
// 🌐 PLATFORM ADAPTERS
// ============================================================

// Web (CSS variables)
export function applyThemeToDOM(moodKey) {
  const theme = resolveMoodTheme(moodKey);
  const root = document.documentElement;

  root.style.setProperty("--bg", theme.gradient);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--text", theme.text);
}

// React Native / JS usage
export function getThemeObject(moodKey) {
  const theme = resolveMoodTheme(moodKey);

  return {
    background: theme.gradient,
    color: theme.text,
    accent: theme.accent,
  };
}

// ============================================================
// 📋 LISTING (UI SAFE)
// ============================================================

export function listMoods() {
  return Array.from(moodRegistry.entries()).map(([key, value]) => ({
    key,
    ...value,
  }));
}


export function listQuoteBackgroundKeys() {
  return Array.from(backgroundRegistry.keys()).filter((k) => k !== "paper");
}

// ============================================================
// 🧠 SMART SUGGESTION
// ============================================================

const MOOD_KEYWORDS = {
  happy: ["amazing", "excited", "win", "fun", "love", "great"],
  calm: ["calm", "peace", "relax", "quiet", "breathe"],
  moody: ["sad", "tired", "alone", "dark", "lost"],
  hype: ["hype", "lets go", "fire", "crazy", "energy"],
};

function scoreText(text, keywords) {
  let score = 0;

  for (const word of keywords) {
    const matches = text.split(word).length - 1;
    score += matches * 2;
  }

  return score;
}

export function suggestMood(blocks = []) {
  if (!Array.isArray(blocks)) return null;

  const text = blocks
    .filter((b) => b?.type === "text" || b?.type === "quote")
    .map((b) => b?.value || "")
    .join(" ")
    .toLowerCase();

  if (!text) return null;

  let bestMood = null;
  let bestScore = 0;

  for (const mood in MOOD_KEYWORDS) {
    const score = scoreText(text, MOOD_KEYWORDS[mood]);

    if (score > bestScore) {
      bestScore = score;
      bestMood = mood;
    }
  }

  return bestScore > 1 ? bestMood : null;
}

// ============================================================
// 🔌 EXTENSIBILITY API
// ============================================================

export function registerMood(key, config) {
  const normalized = normalizeKey(key);

  if (!normalized || !validateTheme(config)) {
    warn("Invalid mood registration");
    return;
  }

  if (moodRegistry.has(normalized)) {
    warn(`Mood "${normalized}" already exists`);
    return;
  }

  moodRegistry.set(normalized, config);
}

export function overrideMood(key, config) {
  const normalized = normalizeKey(key);

  if (!moodRegistry.has(normalized)) {
    warn(`Cannot override unknown mood "${key}"`);
    return;
  }

  if (!validateTheme(config)) return;

  const existing = moodRegistry.get(normalized);

  moodRegistry.set(normalized, {
    ...existing,
    ...config,
  });
}

export function registerBackground(key, value) {
  const normalized = normalizeKey(key);

  if (!normalized || !isValidGradient(value)) {
    warn("Invalid background");
    return;
  }

  backgroundRegistry.set(normalized, value);
}