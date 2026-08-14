// src/features/challengeHub/engine/QuizEngine.jsx

/**
 * Thrown when a quiz configuration fails validation. This is a developer-time
 * error (bad config shipped by the app), so — unlike the runtime engines —
 * QuizEngine is allowed to throw at construction rather than fail silently.
 */
export class QuizConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "QuizConfigError";
  }
}

const SCORING_MODES = ["standard", "negative", "weighted"];
const DIFFICULTY_PROGRESSIONS = ["flat", "ascending", "descending", "random"];

/**
 * Deterministic PRNG (mulberry32) used when a seed is provided, so that
 * shuffled question/answer order can be reproduced — required for replay
 * mode and for re-deriving the same shuffle after a page refresh restore.
 * @private
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle. Uses the given RNG (Math.random by default) so
 * callers can pass a seeded generator for reproducible order.
 * @private
 */
function shuffleArray(array, rng = Math.random) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * QuizEngine owns quiz-level configuration and the rules derived from it:
 * passing criteria, attempt limits, time limits, shuffling behavior,
 * scoring mode, difficulty progression, and prerequisites. It holds no
 * mutable runtime state (that belongs to SessionEngine/QuestionEngine) —
 * it is a pure, read-mostly rules object that other engines consult.
 */
export default class QuizEngine {
  /**
   * @param {object} config
   * @param {string} [config.id]
   * @param {string} [config.title="Untitled Quiz"]
   * @param {string} [config.description=""]
   * @param {string} [config.category]
   * @param {string[]} [config.tags=[]]
   * @param {string} [config.difficulty="medium"] - overall quiz difficulty label.
   * @param {string} [config.coverImage]
   * @param {string} [config.author]
   *
   * @param {number} [config.passingScore=60] - percentage (0-100) required to pass.
   * @param {number} [config.maxAttempts=0] - 0 = unlimited attempts.
   * @param {boolean} [config.allowRetry=true]
   *
   * @param {number|null} [config.timeLimit=null] - total quiz time limit in seconds, null = untimed.
   * @param {number|null} [config.timePerQuestion=null] - default per-question time limit in seconds.
   *
   * @param {boolean} [config.shuffleQuestions=false]
   * @param {boolean} [config.shuffleAnswers=false]
   * @param {number} [config.seed] - optional seed for reproducible shuffling (replay/restore).
   *
   * @param {"standard"|"negative"|"weighted"} [config.scoringMode="standard"]
   * @param {number} [config.negativeMarkingValue=0] - points deducted per wrong answer when scoringMode is "negative".
   *
   * @param {"flat"|"ascending"|"descending"|"random"} [config.difficultyProgression="flat"]
   *
   * @param {string[]} [config.prerequisites=[]] - quiz IDs that must be completed first.
   * @param {"public"|"unlisted"|"private"} [config.visibility="public"]
   * @param {(context: object) => boolean} [config.accessRule] - custom access predicate.
   */
  constructor(config = {}) {
    this._validate(config);

    this.id = config.id ?? null;
    this.title = config.title ?? "Untitled Quiz";
    this.description = config.description ?? "";
    this.category = config.category ?? null;
    this.tags = Array.isArray(config.tags) ? config.tags.slice() : [];
    this.difficulty = config.difficulty ?? "medium";
    this.coverImage = config.coverImage ?? null;
    this.author = config.author ?? null;

    this.passingScore = config.passingScore ?? 60;
    this.maxAttempts = config.maxAttempts ?? 0;
    this.allowRetry = config.allowRetry ?? true;

    this.timeLimit = config.timeLimit ?? null;
    this.timePerQuestion = config.timePerQuestion ?? null;

    this.shuffleQuestionsEnabled = config.shuffleQuestions ?? false;
    this.shuffleAnswersEnabled = config.shuffleAnswers ?? false;
    this.seed = config.seed ?? null;

    this.scoringMode = config.scoringMode ?? "standard";
    this.negativeMarkingValue = config.negativeMarkingValue ?? 0;

    this.difficultyProgression = config.difficultyProgression ?? "flat";

    this.prerequisites = Array.isArray(config.prerequisites) ? config.prerequisites.slice() : [];
    this.visibility = config.visibility ?? "public";
    this._accessRule = typeof config.accessRule === "function" ? config.accessRule : null;

    /** @private Lazily created seeded RNG, so repeated shuffle calls stay consistent within a session. */
    this._rng = this.seed != null ? mulberry32(this.seed) : null;
  }

  /* ================================================
   * VALIDATION
   * ================================================ */

  /** @private */
  _validate(config) {
    if (config == null || typeof config !== "object") {
      throw new QuizConfigError("QuizEngine: config must be an object");
    }
    if (config.passingScore != null && (config.passingScore < 0 || config.passingScore > 100)) {
      throw new QuizConfigError("QuizEngine: passingScore must be between 0 and 100");
    }
    if (config.maxAttempts != null && config.maxAttempts < 0) {
      throw new QuizConfigError("QuizEngine: maxAttempts must be >= 0 (0 = unlimited)");
    }
    if (config.timeLimit != null && config.timeLimit <= 0) {
      throw new QuizConfigError("QuizEngine: timeLimit must be a positive number of seconds, or null");
    }
    if (config.timePerQuestion != null && config.timePerQuestion <= 0) {
      throw new QuizConfigError("QuizEngine: timePerQuestion must be a positive number of seconds, or null");
    }
    if (config.scoringMode != null && !SCORING_MODES.includes(config.scoringMode)) {
      throw new QuizConfigError(`QuizEngine: scoringMode must be one of ${SCORING_MODES.join(", ")}`);
    }
    if (config.scoringMode === "negative" && (config.negativeMarkingValue == null || config.negativeMarkingValue < 0)) {
      throw new QuizConfigError("QuizEngine: negativeMarkingValue must be a number >= 0 when scoringMode is 'negative'");
    }
    if (config.difficultyProgression != null && !DIFFICULTY_PROGRESSIONS.includes(config.difficultyProgression)) {
      throw new QuizConfigError(
        `QuizEngine: difficultyProgression must be one of ${DIFFICULTY_PROGRESSIONS.join(", ")}`
      );
    }
    if (config.visibility != null && !["public", "unlisted", "private"].includes(config.visibility)) {
      throw new QuizConfigError("QuizEngine: visibility must be 'public', 'unlisted', or 'private'");
    }
    if (config.accessRule != null && typeof config.accessRule !== "function") {
      throw new QuizConfigError("QuizEngine: accessRule must be a function");
    }
  }

  /* ================================================
   * METADATA
   * ================================================ */

  /**
   * @returns {object} display metadata for cards, headers, SEO, etc.
   */
  getMetadata() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      tags: this.tags,
      difficulty: this.difficulty,
      coverImage: this.coverImage,
      author: this.author,
    };
  }

  /* ================================================
   * PASSING / ATTEMPTS
   * ================================================ */

  /**
   * @param {number} percentage - 0-100 accuracy/score percentage.
   * @returns {boolean} whether that percentage clears the passing bar.
   */
  isPassed(percentage) {
    return percentage >= this.passingScore;
  }

  /**
   * @returns {number} configured passing score percentage.
   */
  getPassingScore() {
    return this.passingScore;
  }

  /**
   * @param {number} attemptsUsed
   * @returns {boolean} whether another attempt is permitted.
   */
  canAttempt(attemptsUsed = 0) {
    if (!this.allowRetry && attemptsUsed >= 1) return false;
    if (this.maxAttempts === 0) return true; // unlimited
    return attemptsUsed < this.maxAttempts;
  }

  /**
   * @param {number} attemptsUsed
   * @returns {number|null} attempts remaining, or null if unlimited.
   */
  getAttemptsRemaining(attemptsUsed = 0) {
    if (this.maxAttempts === 0) return null;
    return Math.max(this.maxAttempts - attemptsUsed, 0);
  }

  /* ================================================
   * TIME LIMITS
   * ================================================ */

  /**
   * @returns {number|null} total quiz time limit in seconds, or null if untimed.
   */
  getTimeLimit() {
    return this.timeLimit;
  }

  /**
   * @param {object} [question] - optional question object which may carry its own override (question.timeLimit).
   * @returns {number|null} effective time limit in seconds for a question, or null if untimed.
   */
  getTimePerQuestion(question) {
    if (question && typeof question.timeLimit === "number") return question.timeLimit;
    return this.timePerQuestion;
  }

  /* ================================================
   * SHUFFLING
   * ================================================ */

  /** @returns {boolean} */
  shouldShuffleQuestions() {
    return this.shuffleQuestionsEnabled;
  }

  /** @returns {boolean} */
  shouldShuffleAnswers() {
    return this.shuffleAnswersEnabled;
  }

  /**
   * Returns a shuffled copy of the questions array if shuffling is enabled,
   * otherwise returns the array unchanged. Uses the seeded RNG when a seed
   * was configured, so order is reproducible across restore/replay.
   * @param {Array} questions
   * @returns {Array}
   */
  shuffleQuestions(questions) {
    if (!this.shuffleQuestionsEnabled) return questions;
    return shuffleArray(questions, this._rng ?? Math.random);
  }

  /**
   * Returns a shuffled copy of an answer-options array if shuffling is
   * enabled, otherwise returns it unchanged.
   * @param {Array} options
   * @returns {Array}
   */
  shuffleAnswerOptions(options) {
    if (!this.shuffleAnswersEnabled) return options;
    return shuffleArray(options, this._rng ?? Math.random);
  }

  /* ================================================
   * SCORING RULES
   * ================================================ */

  /** @returns {"standard"|"negative"|"weighted"} */
  getScoringMode() {
    return this.scoringMode;
  }

  /** @returns {number} points deducted per wrong answer (only meaningful when scoringMode === "negative"). */
  getNegativeMarkingValue() {
    return this.scoringMode === "negative" ? this.negativeMarkingValue : 0;
  }

  /**
   * Applies this quiz's scoring-mode adjustment to a raw point value.
   * ScoreEngine remains the source of truth for base point calculation;
   * this only applies the quiz-level policy on top (e.g. negative marking).
   * @param {{ points: number, correct: boolean }} args
   * @returns {number} adjusted points
   */
  applyScoringPolicy({ points, correct }) {
    if (this.scoringMode === "negative" && !correct) {
      return -Math.abs(this.negativeMarkingValue);
    }
    return points;
  }

  /* ================================================
   * DIFFICULTY PROGRESSION
   * ================================================ */

  /** @returns {"flat"|"ascending"|"descending"|"random"} */
  getDifficultyProgression() {
    return this.difficultyProgression;
  }

  /**
   * Suggests a difficulty label for a question at a given position, based
   * on the configured progression. Purely advisory — QuestionEngine may
   * ignore this if questions already carry explicit difficulty.
   * @param {number} index - 0-based question index.
   * @param {number} total - total question count.
   * @returns {"easy"|"medium"|"hard"}
   */
  getDifficultyForIndex(index, total) {
    if (total <= 0) return "medium";
    const t = index / Math.max(total - 1, 1); // 0..1

    switch (this.difficultyProgression) {
      case "ascending":
        return t < 0.34 ? "easy" : t < 0.67 ? "medium" : "hard";
      case "descending":
        return t < 0.34 ? "hard" : t < 0.67 ? "medium" : "easy";
      case "random": {
        const r = (this._rng ?? Math.random)();
        return r < 0.34 ? "easy" : r < 0.67 ? "medium" : "hard";
      }
      case "flat":
      default:
        return this.difficulty;
    }
  }

  /* ================================================
   * PREREQUISITES / ACCESS
   * ================================================ */

  /** @returns {string[]} quiz IDs that must be completed before this one. */
  getPrerequisites() {
    return this.prerequisites;
  }

  /**
   * @param {string[]} completedQuizIds
   * @returns {boolean} whether all prerequisites are satisfied.
   */
  meetsPrerequisites(completedQuizIds = []) {
    if (this.prerequisites.length === 0) return true;
    const completed = new Set(completedQuizIds);
    return this.prerequisites.every((id) => completed.has(id));
  }

  /** @returns {"public"|"unlisted"|"private"} */
  getVisibility() {
    return this.visibility;
  }

  /**
   * Evaluates the custom access rule (if any) against a caller-supplied
   * context (e.g. { user, subscriptionTier, completedQuizIds }). Defaults
   * to true when no rule is configured. Never throws — a broken access
   * rule fails closed (denies access) rather than crashing the caller.
   * @param {object} context
   * @returns {boolean}
   */
  checkAccess(context = {}) {
    if (!this._accessRule) return true;
    try {
      return Boolean(this._accessRule(context));
    } catch {
      return false; // fail closed
    }
  }

  /* ================================================
   * SERIALIZATION
   * ================================================ */

  /**
   * @returns {object} plain-object representation, suitable for persistence
   * or for re-hydrating via `new QuizEngine(quizEngine.toJSON())`.
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      tags: this.tags,
      difficulty: this.difficulty,
      coverImage: this.coverImage,
      author: this.author,

      passingScore: this.passingScore,
      maxAttempts: this.maxAttempts,
      allowRetry: this.allowRetry,

      timeLimit: this.timeLimit,
      timePerQuestion: this.timePerQuestion,

      shuffleQuestions: this.shuffleQuestionsEnabled,
      shuffleAnswers: this.shuffleAnswersEnabled,
      seed: this.seed,

      scoringMode: this.scoringMode,
      negativeMarkingValue: this.negativeMarkingValue,

      difficultyProgression: this.difficultyProgression,

      prerequisites: this.prerequisites,
      visibility: this.visibility,
    };
  }

  /**
   * @param {object} json - output of toJSON().
   * @returns {QuizEngine}
   */
  static fromJSON(json) {
    return new QuizEngine(json);
  }
}
