/**
 * --------------------------------------------------------
 * HintEngine
 * --------------------------------------------------------
 * Handles:
 *
 * • Hint availability
 * • Progressive hints
 * • Hint penalties
 * • Hint history
 * • Analytics
 * • Session persistence
 *
 * React independent.
 * --------------------------------------------------------
 */

export default class HintEngine {
  constructor(options = {}) {
    this.config = {
      maxHintsPerQuiz: 3,

      maxHintsPerQuestion: 3,

      penaltyPerHint: 15,

      allowUnlimited: false,

      ...options,
    };

    this.reset();
  }

  /* =====================================================
      STATE
     ===================================================== */

  reset() {
    this.usedTotal = 0;

    this.currentQuestion = null;

    this.questionHintsUsed = {};

    this.history = [];
  }

  /* =====================================================
      QUESTION
     ===================================================== */

  setQuestion(question) {
    if (!question) return;

    this.currentQuestion = question;

    if (!this.questionHintsUsed[question.id]) {
      this.questionHintsUsed[question.id] = 0;
    }
  }

  /* =====================================================
      AVAILABILITY
     ===================================================== */

  canUseHint() {
    if (this.config.allowUnlimited) {
      return true;
    }

    return (
      this.usedTotal <
      this.config.maxHintsPerQuiz
    );
  }

  remainingHints() {
    if (this.config.allowUnlimited) {
      return Infinity;
    }

    return (
      this.config.maxHintsPerQuiz -
      this.usedTotal
    );
  }

  /* =====================================================
      GET NEXT HINT
     ===================================================== */

  useHint() {
    if (!this.currentQuestion) {
      return {
        success: false,
        reason: "No question selected",
      };
    }

    if (!this.canUseHint()) {
      return {
        success: false,
        reason: "No hints remaining",
      };
    }

    const used =
      this.questionHintsUsed[
        this.currentQuestion.id
      ];

    const hints =
      this.currentQuestion.hints || [];

    if (used >= hints.length) {
      return {
        success: false,
        reason: "No more hints",
      };
    }

    if (
      used >=
      this.config.maxHintsPerQuestion
    ) {
      return {
        success: false,
        reason:
          "Question hint limit reached",
      };
    }

    const hint = hints[used];

    this.questionHintsUsed[
      this.currentQuestion.id
    ]++;

    this.usedTotal++;

    const record = {
      questionId:
        this.currentQuestion.id,

      hintIndex: used,

      hint,

      penalty:
        this.config.penaltyPerHint,

      timestamp:
        new Date().toISOString(),
    };

    this.history.push(record);

    return {
      success: true,

      hint,

      penalty:
        this.config.penaltyPerHint,

      remaining:
        this.remainingHints(),

      used:
        this.usedTotal,

      questionHintsUsed:
        this.questionHintsUsed[
          this.currentQuestion.id
        ],
    };
  }

  /* =====================================================
      INFO
     ===================================================== */

  hintsUsedForQuestion() {
    if (!this.currentQuestion) return 0;

    return (
      this.questionHintsUsed[
        this.currentQuestion.id
      ] || 0
    );
  }

  totalHintsUsed() {
    return this.usedTotal;
  }

  historyLog() {
    return [...this.history];
  }

  /* =====================================================
      STATS
     ===================================================== */

  stats() {
    return {
      totalUsed:
        this.usedTotal,

      remaining:
        this.remainingHints(),

      questions:
        Object.keys(
          this.questionHintsUsed
        ).length,

      history:
        this.history.length,
    };
  }

  /* =====================================================
      SERIALIZATION
     ===================================================== */

  serialize() {
    return {
      usedTotal:
        this.usedTotal,

      questionHintsUsed:
        this.questionHintsUsed,

      history:
        this.history,
    };
  }

  restore(state) {
    if (!state) return;

    this.usedTotal =
      state.usedTotal ?? 0;

    this.questionHintsUsed =
      state.questionHintsUsed ?? {};

    this.history =
      state.history ?? [];
  }
}