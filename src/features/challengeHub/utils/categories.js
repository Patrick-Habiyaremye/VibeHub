// utils/categories.js

// -------------------
// ENUMS
// -------------------

export const ChallengeCategories = Object.freeze({
  PLAY: "PLAY",
  DO: "DO",
  LEARN: "LEARN",
  TOGETHER: "TOGETHER",
});

// -------------------
// CONFIG (SOURCE OF TRUTH)
// -------------------

const rawCategoryConfig = {
  PLAY: {
    name: "Play",
    icon: "🎮",
    description:
      "Games, quizzes, puzzles, trivia and fun competitions",
    color: "#FF6B6B",

    subCategories: {
      QUIZZES: { label: "Quizzes" },
      WHO_AM_I: { label: "Who Am I" },
      CAPITAL_CITIES: { label: "Capital Cities" },
      FLAGS: { label: "Flags" },
      RIDDLES: { label: "Riddles" },
      MEMORY_GAMES: { label: "Memory Games" },
      PUZZLES: { label: "Puzzles" },
      TRIVIA: { label: "Trivia" },
    },
  },

  DO: {
    name: "Do",
    icon: "❤️",
    description:
      "Real-world actions that create positive impact",
    color: "#6BCB77",

    subCategories: {
      KINDNESS: { label: "Kindness" },
      MENTORSHIP: { label: "Mentorship" },
      VOLUNTEERING: { label: "Volunteering" },
      COMMUNITY_SUPPORT: { label: "Community Support" },
      HELPING_OTHERS: { label: "Helping Others" },
      ENVIRONMENT: { label: "Environment" },
    },
  },

  LEARN: {
    name: "Learn",
    icon: "🧠",
    description:
      "Build knowledge and useful skills",
    color: "#4D96FF",

    subCategories: {
      PROGRAMMING: { label: "Programming" },
      LANGUAGES: { label: "Languages" },
      SCIENCE: { label: "Science" },
      HISTORY: { label: "History" },
      FINANCE: { label: "Finance" },
      LIFE_SKILLS: { label: "Life Skills" },
      CREATIVITY: { label: "Creativity" },
    },
  },

  TOGETHER: {
    name: "Together",
    icon: "🌍",
    description:
      "Connect with others through teamwork",
    color: "#845EC2",

    subCategories: {
      MULTIPLAYER: { label: "Multiplayer" },
      CAMPUS: { label: "Campus" },
      TEAM_MISSIONS: { label: "Team Missions" },
      SEASONAL_EVENTS: { label: "Seasonal Events" },
      GLOBAL_CHALLENGES: { label: "Global Challenges" },
      COMMUNITY_BATTLES: { label: "Community Battles" },
    },
  },
};

// -------------------
// DEEP FREEZE (IMMUTABILITY)
// -------------------

function deepFreeze(obj) {
  Object.freeze(obj);
  Object.values(obj).forEach((value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return obj;
}

export const ChallengeCategoryConfig = deepFreeze(rawCategoryConfig);

// -------------------
// NORMALIZATION
// -------------------

export function normalizeCategory(category) {
  return category?.toUpperCase?.() || null;
}

export function normalizeSubCategory(subCategory) {
  return subCategory?.toUpperCase?.() || null;
}

// -------------------
// VALIDATION
// -------------------

export function isValidChallengeCategory(category) {
  const normalized = normalizeCategory(category);
  return Object.values(ChallengeCategories).includes(normalized);
}

export function isValidSubCategory(category, subCategory) {
  const cat = normalizeCategory(category);
  const sub = normalizeSubCategory(subCategory);

  const config = ChallengeCategoryConfig[cat];
  if (!config) return false;

  return !!config.subCategories[sub];
}

// -------------------
// LOOKUPS (O(1))
// -------------------

// Build reverse map once
const subCategoryToCategoryMap = (() => {
  const map = {};

  for (const [category, config] of Object.entries(
    ChallengeCategoryConfig
  )) {
    for (const sub of Object.keys(config.subCategories)) {
      map[sub] = category;
    }
  }

  return map;
})();

export function getCategoryFromSubCategory(subCategory) {
  const sub = normalizeSubCategory(subCategory);
  return subCategoryToCategoryMap[sub] || null;
}

// -------------------
// GETTERS
// -------------------

export function getCategoryConfig(category) {
  const cat = normalizeCategory(category);
  return ChallengeCategoryConfig[cat] || null;
}

export function getSubCategoryConfig(category, subCategory) {
  const cat = normalizeCategory(category);
  const sub = normalizeSubCategory(subCategory);

  const categoryConfig = ChallengeCategoryConfig[cat];
  if (!categoryConfig) return null;

  return categoryConfig.subCategories[sub] || null;
}

// -------------------
// LIST HELPERS
// -------------------

export function getAllCategories() {
  return Object.entries(ChallengeCategoryConfig).map(
    ([key, value]) => ({
      key,
      ...value,
    })
  );
}

export function getAllSubCategories() {
  const result = [];

  for (const [category, config] of Object.entries(
    ChallengeCategoryConfig
  )) {
    for (const [subKey, subValue] of Object.entries(
      config.subCategories
    )) {
      result.push({
        category,
        subCategory: subKey,
        label: subValue.label,
      });
    }
  }

  return result;
}