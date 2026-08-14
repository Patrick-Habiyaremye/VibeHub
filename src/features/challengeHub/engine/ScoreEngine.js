/**
 * --------------------------------------------------------
 * ScoreEngine
 * --------------------------------------------------------
 * Computes scores, XP, bonuses and statistics for
 * ChallengeHub quizzes.
 *
 * Works independently from React.
 * --------------------------------------------------------
 */

export default class ScoreEngine {
  constructor(config = {}) {
    this.config = {
      basePoints: 100,

      wrongPenalty: 0,

      skipPenalty: 0,

      hintPenalty: 15,

      streakBonus: 10,

      maxStreakBonus: 100,

      perfectBonus: 250,

      timeBonusMultiplier: 2,

      difficultyMultiplier: {
        EASY: 1,
        MEDIUM: 1.5,
        HARD: 2,
        EXPERT: 3,
      },

      xpMultiplier: 1,

      ...config,
    };

    this.reset();
  }

  /* =====================================================
      STATE
     ===================================================== */

  reset() {
    this.correct = 0;
    this.wrong = 0;
    this.skipped = 0;

    this.totalQuestions = 0;

    this.currentStreak = 0;
    this.bestStreak = 0;

    this.totalScore = 0;
    this.totalXP = 0;

    this.details = [];
  }

  /* =====================================================
      HELPERS
     ===================================================== */

  difficultyMultiplier(level) {
    return (
      this.config.difficultyMultiplier[level] ??
      1
    );
  }

  /* =====================================================
      REGISTER ANSWER
     ===================================================== */

  register({
    correct = false,

    difficulty = "EASY",

    remainingSeconds = 0,

    usedHint = false,

    skipped = false,
  }) {
    this.totalQuestions++;

    let score = 0;

    let xp = 0;

    let breakdown = {
      base: 0,
      timeBonus: 0,
      streakBonus: 0,
      hintPenalty: 0,
      wrongPenalty: 0,
      skipPenalty: 0,
      total: 0,
    };

    const multiplier =
      this.difficultyMultiplier(difficulty);

    if (correct) {
      this.correct++;

      this.currentStreak++;

      this.bestStreak = Math.max(
        this.bestStreak,
        this.currentStreak
      );

      breakdown.base =
        this.config.basePoints *
        multiplier;

      breakdown.timeBonus =
        remainingSeconds *
        this.config.timeBonusMultiplier;

      breakdown.streakBonus = Math.min(
        this.currentStreak *
          this.config.streakBonus,
        this.config.maxStreakBonus
      );

      score =
        breakdown.base +
        breakdown.timeBonus +
        breakdown.streakBonus;

      if (usedHint) {
        breakdown.hintPenalty =
          this.config.hintPenalty;

        score -=
          this.config.hintPenalty;
      }
    } else {
      this.currentStreak = 0;

      if (skipped) {
        this.skipped++;

        breakdown.skipPenalty =
          this.config.skipPenalty;

        score -=
          this.config.skipPenalty;
      } else {
        this.wrong++;

        breakdown.wrongPenalty =
          this.config.wrongPenalty;

        score -=
          this.config.wrongPenalty;
      }
    }

    score = Math.max(0, Math.round(score));

    xp = Math.round(
      score * this.config.xpMultiplier
    );

    breakdown.total = score;

    this.totalScore += score;
    this.totalXP += xp;

    this.details.push({
      correct,
      difficulty,
      remainingSeconds,
      usedHint,
      skipped,
      score,
      xp,
      breakdown,
    });

    return {
      score,
      xp,
      breakdown,
    };
  }

  /* =====================================================
      BONUSES
     ===================================================== */

  applyPerfectBonus() {
    if (
      this.correct === this.totalQuestions &&
      this.totalQuestions > 0
    ) {
      this.totalScore +=
        this.config.perfectBonus;

      this.totalXP +=
        this.config.perfectBonus;

      return this.config.perfectBonus;
    }

    return 0;
  }

  /* =====================================================
      METRICS
     ===================================================== */

  accuracy() {
    if (!this.totalQuestions)
      return 0;

    return Math.round(
      (this.correct /
        this.totalQuestions) *
        100
    );
  }

  completionRate() {
    if (!this.totalQuestions)
      return 0;

    return Math.round(
      ((this.correct + this.wrong) /
        this.totalQuestions) *
        100
    );
  }

  grade() {
    const acc = this.accuracy();

    if (acc >= 98) return "S";
    if (acc >= 90) return "A";
    if (acc >= 80) return "B";
    if (acc >= 70) return "C";
    if (acc >= 60) return "D";

    return "F";
  }

  performance() {
    const acc = this.accuracy();

    if (acc >= 95)
      return "Legendary";

    if (acc >= 90)
      return "Excellent";

    if (acc >= 80)
      return "Great";

    if (acc >= 70)
      return "Good";

    if (acc >= 60)
      return "Fair";

    return "Needs Practice";
  }

  /* =====================================================
      RESULTS
     ===================================================== */

  results() {
    return {
      totalQuestions:
        this.totalQuestions,

      correct:
        this.correct,

      wrong:
        this.wrong,

      skipped:
        this.skipped,

      accuracy:
        this.accuracy(),

      completionRate:
        this.completionRate(),

      bestStreak:
        this.bestStreak,

      score:
        this.totalScore,

      xp:
        this.totalXP,

      grade:
        this.grade(),

      performance:
        this.performance(),

      answers:
        this.details,
    };
  }

  /* =====================================================
      SERIALIZATION
     ===================================================== */

  serialize() {
    return {
      correct:
        this.correct,

      wrong:
        this.wrong,

      skipped:
        this.skipped,

      totalQuestions:
        this.totalQuestions,

      currentStreak:
        this.currentStreak,

      bestStreak:
        this.bestStreak,

      totalScore:
        this.totalScore,

      totalXP:
        this.totalXP,

      details:
        this.details,
    };
  }

  restore(state) {
    Object.assign(this, state);
  }
}