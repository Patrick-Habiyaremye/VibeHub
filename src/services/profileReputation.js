// services/profileReputation.js

const LEVELS = [
  { level: 1, title: "Starter 🌱", min: 0 },
  { level: 2, title: "Kind Soul 💛", min: 300 },
  { level: 3, title: "Positive Voice ✨", min: 800 },
  { level: 4, title: "Community Uplifter 🙌", min: 1800 },
  { level: 5, title: "Inspiration Engine 🔥", min: 4000 },
  { level: 6, title: "Impact Leader 🌍", min: 8000 },
]

/* ----------------------------------------
   HELPERS
----------------------------------------- */

// diminishing returns curve
function dampen(value, factor = 0.85) {
  return Math.pow(value, factor)
}

// prevents division abuse
function safeRatio(a, b) {
  if (b === 0) return 0
  return a / b
}

/* ----------------------------------------
   CORE
----------------------------------------- */

export function computeReputation({
  stats,
  achievements = [],
  streak = 0,
}) {
  if (!stats) throw new Error("Stats required")

  const {
    postsCount = 0,
    commentsCount = 0,
    likesReceived = 0,
    meaningfulSupport = 0,
  } = stats

  /* ------------------ BASE COMPONENTS ------------------ */

  const postScore = dampen(postsCount) * 5
  const commentScore = dampen(commentsCount) * 3
  const likeScore = dampen(likesReceived) * 1.5
  const supportScore = dampen(meaningfulSupport) * 4

  /* ------------------ STREAK BOOST ------------------ */

  const streakBonus = Math.min(streak * 2, 100)

  /* ------------------ ACHIEVEMENT BONUS ------------------ */

  const achievementScore =
    achievements.length * 50

  /* ------------------ RAW SCORE ------------------ */

  let reputationScore =
    postScore +
    commentScore +
    likeScore +
    supportScore +
    streakBonus +
    achievementScore

  /* ------------------ ANTI-GAMING ------------------ */

  const engagementRatio = safeRatio(
    commentsCount,
    postsCount
  )

  // penalize low-quality posting (spam posts, no discussion)
  if (postsCount > 10 && engagementRatio < 0.3) {
    reputationScore *= 0.75
  }

  // reward real discussion
  if (engagementRatio > 1.2) {
    reputationScore *= 1.1
  }

  /* ------------------ LEVEL ------------------ */

  const currentLevel =
    [...LEVELS].reverse().find(
      (lvl) => reputationScore >= lvl.min
    ) || LEVELS[0]

  const nextLevel =
    LEVELS.find((lvl) => lvl.min > currentLevel.min) || null

  let progress = 1

  if (nextLevel) {
    const range = nextLevel.min - currentLevel.min
    const currentProgress =
      reputationScore - currentLevel.min

    progress = Math.min(currentProgress / range, 1)
  }

  /* ------------------ FINAL OUTPUT ------------------ */

  return {
    reputationScore: Math.round(reputationScore),

    level: currentLevel.level,
    title: currentLevel.title,

    progress,
    nextLevel: nextLevel?.title || null,

    breakdown: {
      postScore,
      commentScore,
      likeScore,
      supportScore,
      streakBonus,
      achievementScore,
    },
  }
}