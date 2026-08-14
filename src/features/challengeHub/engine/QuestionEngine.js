/**
 * ----------------------------------------------------
 * QuestionEngine
 * ----------------------------------------------------
 * Central engine responsible for:
 *
 * • loading questions
 * • shuffling
 * • difficulty filtering
 * • category filtering
 * • validating answers
 * • supporting multiple quiz types
 * *
 * Designed for every ChallengeHub game.
 * ----------------------------------------------------
 */

export default class QuestionEngine {
  constructor(questions = []) {
    this.original = Array.isArray(questions) ? questions : [];

    this.questions = [...this.original];

    this.index = 0;

    this.correct = 0;

    this.wrong = 0;

    this.skipped = 0;
  }

  /* =====================================================
      LOADING
     ===================================================== */

  load(questions = []) {
    this.original = [...questions];

    this.questions = [...questions];

    this.reset();
  }

  reset() {
    this.index = 0;
    this.correct = 0;
    this.wrong = 0;
    this.skipped = 0;
  }

  /* =====================================================
      FILTERING
     ===================================================== */

  filterCategory(category) {
    this.questions = this.original.filter(
      q => q.category === category
    );

    this.reset();

    return this.questions;
  }

  filterDifficulty(level) {
    this.questions = this.original.filter(
      q => q.difficulty === level
    );

    this.reset();

    return this.questions;
  }

  filter(predicate) {
    this.questions = this.original.filter(predicate);

    this.reset();

    return this.questions;
  }

  /* =====================================================
      RANDOMIZATION
     ===================================================== */

  shuffleQuestions() {
    this.questions = [...this.questions];

    for (
      let i = this.questions.length - 1;
      i > 0;
      i--
    ) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [
        this.questions[i],
        this.questions[j],
      ] = [
        this.questions[j],
        this.questions[i],
      ];
    }

    return this.questions;
  }

  shuffleChoices(question) {
    if (!question?.choices) return question;

    const copy = {
      ...question,
      choices: [...question.choices],
    };

    for (
      let i = copy.choices.length - 1;
      i > 0;
      i--
    ) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [
        copy.choices[i],
        copy.choices[j],
      ] = [
        copy.choices[j],
        copy.choices[i],
      ];
    }

    return copy;
  }

  /* =====================================================
      NAVIGATION
     ===================================================== */

  current() {
    return this.questions[this.index] || null;
  }

  next() {
    if (this.index >= this.questions.length - 1)
      return null;

    this.index++;

    return this.current();
  }

  previous() {
    if (this.index <= 0)
      return null;

    this.index--;

    return this.current();
  }

  hasNext() {
    return this.index < this.questions.length - 1;
  }

  hasPrevious() {
    return this.index > 0;
  }

  jump(index) {
    if (
      index < 0 ||
      index >= this.questions.length
    ) {
      return null;
    }

    this.index = index;

    return this.current();
  }

  /* =====================================================
      ANSWER VALIDATION
     ===================================================== */

  validate(question, answer) {
    if (!question) {
      return {
        correct: false,
      };
    }

    const expected = question.answer;

    // String
    if (
      typeof expected === "string"
    ) {
      const ok =
        expected.trim().toLowerCase() ===
        String(answer)
          .trim()
          .toLowerCase();

      ok
        ? this.correct++
        : this.wrong++;

      return {
        correct: ok,
        expected,
        explanation:
          question.explanation ?? null,
      };
    }

    // Number
    if (
      typeof expected === "number"
    ) {
      const ok =
        Number(answer) === expected;

      ok
        ? this.correct++
        : this.wrong++;

      return {
        correct: ok,
        expected,
        explanation:
          question.explanation ?? null,
      };
    }

    // Array (multiple answers)
    if (
      Array.isArray(expected)
    ) {
      const submitted =
        Array.isArray(answer)
          ? answer
          : [answer];

      const normalize = arr =>
        arr
          .map(v =>
            String(v)
              .trim()
              .toLowerCase()
          )
          .sort();

      const ok =
        JSON.stringify(
          normalize(expected)
        ) ===
        JSON.stringify(
          normalize(submitted)
        );

      ok
        ? this.correct++
        : this.wrong++;

      return {
        correct: ok,
        expected,
        explanation:
          question.explanation ?? null,
      };
    }

    this.wrong++;

    return {
      correct: false,
      expected,
      explanation:
        question.explanation ?? null,
    };
  }

  skip() {
    this.skipped++;
  }

  /* =====================================================
      HINTS
     ===================================================== */

  getHint(question) {
    if (!question) return null;

    return (
      question.hint ??
      null
    );
  }

  /* =====================================================
      INFO
     ===================================================== */

  total() {
    return this.questions.length;
  }

  currentIndex() {
    return this.index;
  }

  progress() {
    if (!this.questions.length)
      return 0;

    return (
      (this.index + 1) /
      this.questions.length
    );
  }

  remaining() {
    return (
      this.questions.length -
      (this.index + 1)
    );
  }

  stats() {
    return {
      total:
        this.questions.length,

      correct:
        this.correct,

      wrong:
        this.wrong,

      skipped:
        this.skipped,

      answered:
        this.correct +
        this.wrong,

      accuracy:
        this.correct +
          this.wrong ===
        0
          ? 0
          : Math.round(
              (this.correct /
                (this.correct +
                  this.wrong)) *
                100
            ),
    };
  }

  /* =====================================================
      EXPORT
     ===================================================== */

  serialize() {
    return {
      index: this.index,

      correct:
        this.correct,

      wrong:
        this.wrong,

      skipped:
        this.skipped,
    };
  }

  restore(state) {
    if (!state) return;

    this.index =
      state.index ?? 0;

    this.correct =
      state.correct ?? 0;

    this.wrong =
      state.wrong ?? 0;

    this.skipped =
      state.skipped ?? 0;
  }
}