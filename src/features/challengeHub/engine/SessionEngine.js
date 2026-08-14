// src/features/challengeHub/engine/SessionEngine.js

import QuizEngine from "./QuizEngine";
import QuestionEngine from "./QuestionEngine";
import TimerEngine from "./TimerEngine";
import ScoreEngine from "./ScoreEngine";
import HintEngine from "./HintEngine";

/**
 * Legal state transitions for the session lifecycle.
 * `idle -> running` is kept legal for backward compatibility with callers
 * that start a session immediately without an explicit loading/ready phase.
 */
const TRANSITIONS = {
  idle: ["loading", "ready", "running", "error"],
  loading: ["ready", "error", "idle"],
  ready: ["running", "error", "idle"],
  running: ["paused", "finished", "cancelled", "error"],
  paused: ["running", "cancelled", "finished", "error"],
  finished: ["idle"],
  cancelled: ["idle"],
  error: ["idle"],
};

/**
 * Simple debounce helper used for autosave scheduling.
 */
function debounce(fn, wait) {
  let timer = null;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}

/**
 * SessionEngine is the central runtime of ChallengeHub. It orchestrates
 * QuizEngine, QuestionEngine, TimerEngine, ScoreEngine and HintEngine,
 * exposes a React-friendly subscription API, a granular event bus, a
 * plugin system, and persistence/autosave support.
 *
 * Public API kept intact: constructor, subscribe, notify, start, pause,
 * resume, finish, destroy, getCurrentQuestion, next, previous,
 * submitAnswer, requestHint, getState, getResults, reset.
 */
export default class SessionEngine {
  /**
   * @param {object} config
   * @param {object} [config.quiz] - QuizEngine config.
   * @param {Array} [config.questions] - Question list.
   * @param {object} [config.question] - QuestionEngine config.
   * @param {object} [config.timer] - TimerEngine config.
   * @param {object} [config.score] - ScoreEngine config.
   * @param {object} [config.hints] - HintEngine config.
   * @param {string|number} [config.playerId]
   * @param {string|number} [config.challengeId]
   * @param {string} [config.type="quiz"]
   * @param {number} [config.hintPenalty=0] - Points deducted per hint used, applied in getResults().
   * @param {number} [config.speedBonusPerSecond=0] - Bonus points per second of time remaining on a correct answer.
   * @param {object} [config.autosave] - Autosave configuration.
   * @param {boolean} [config.autosave.enabled=true]
   * @param {number} [config.autosave.intervalMs=800]
   * @param {boolean} [config.autosave.restoreOnInit=false]
   * @param {string} [config.autosave.key] - Custom storage key.
   * @param {object} [config.storage] - Custom storage adapter ({getItem,setItem,removeItem}).
   * @param {Array<object>} [config.plugins] - Plugins to register immediately.
   */
  constructor(config = {}) {
    this.quiz = new QuizEngine(config.quiz);
    this.questions = new QuestionEngine(config.questions || [], config.question);
    this.timer = new TimerEngine(config.timer);
    this.score = new ScoreEngine(config.score);
    this.hints = new HintEngine(config.hints);

    this.playerId = config.playerId ?? null;
    this.challengeId = config.challengeId ?? null;
    this.type = config.type ?? "quiz";
    this.mode = config.mode ?? "solo"; // extensibility hook: solo | multiplayer | ai | spectator | replay | tournament | offline
    this.rank = config.rank ?? null;

    this.state = "idle";
    this.startedAt = null;
    this.finishedAt = null;
    this.answers = [];

    /** @private */
    this._answeredQuestionIds = new Set();
    /** @private */
    this._answering = false;
    /** @private */
    this._lastQuestionStartedAt = null;
    /** @private */
    this._lastHintAt = 0;
    /** @private */
    this._hintCooldownMs = config.hints?.cooldownMs ?? 0;

    this._scoringConfig = {
      hintPenalty: config.hintPenalty ?? 0,
      speedBonusPerSecond: config.speedBonusPerSecond ?? 0,
      gradeThresholds: config.gradeThresholds ?? { S: 95, A: 85, B: 70, C: 50 },
      starThresholds: config.starThresholds ?? { three: 90, two: 70, one: 40 },
    };

    /** @private React-facing snapshot listeners. */
    this.listeners = new Set();
    /** @private Granular event bus: event name -> Set<{handler, once}> */
    this._eventHandlers = new Map();
    /** @private name -> plugin */
    this._plugins = new Map();

    this._timerUnsub = null;
    this._timerPollInterval = null;

    this._storage = config.storage ?? this._defaultStorage();
    this._storageKey =
      config.autosave?.key ?? `challengehub:session:${this.challengeId ?? "default"}:${this.playerId ?? "anon"}`;
    this._autosaveEnabled = config.autosave?.enabled ?? true;
    this._scheduleAutosave = debounce(() => this.save(), config.autosave?.intervalMs ?? 800);

    this._bindTimer();

    (config.plugins || []).forEach((plugin) => this.registerPlugin(plugin));

    if (config.autosave?.restoreOnInit) {
      this.load();
    }
  }

  /* ================================================
   * FACTORY
   * ================================================ */

  /**
   * Build a playable SessionEngine from a raw challenge record — e.g.
   * exactly what ChallengeService.getChallengeById() returns from Supabase.
   *
   * This is the seam that resolves the mismatch between a plain database
   * row (no submitAnswer()/next()/pause()) and the session object the UI
   * actually needs. `setSession(challenge)` should never happen directly;
   * `setSession(SessionEngine.fromChallenge(challenge, { playerId }))` is
   * the replacement.
   *
   * Pure and synchronous — it does not touch the network, Supabase, or
   * storage beyond what the SessionEngine constructor already does
   * (local autosave). Fetching the challenge, resolving/creating a remote
   * progress row, and wiring a sync plugin belong in a separate
   * orchestration helper (see services/session.factory.js's
   * createChallengeSession()), so this engine stays decoupled from any
   * particular backend.
   *
   * Field names are read defensively in both camelCase and snake_case
   * since DB rows are typically snake_case while JS config is camelCase.
   *
   * @param {object} challenge - raw challenge record.
   * @param {object} [options]
   * @param {string|number} [options.playerId]
   * @param {Array<object>} [options.plugins] - e.g. a remote progress sync plugin.
   * @param {object} [options.timer] - overrides merged over challenge-derived timer config.
   * @param {object} [options.hints] - overrides merged over challenge-derived hint config.
   * @param {object} [options.quiz] - overrides merged over challenge-derived quiz config.
   * @param {object} [options.score]
   * @param {object} [options.question]
   * @param {object} [options.autosave]
   * @param {object} [options.storage]
   * @param {number} [options.hintPenalty]
   * @param {number} [options.speedBonusPerSecond]
   * @returns {SessionEngine}
   */
  static fromChallenge(challenge, options = {}) {
    if (!challenge || typeof challenge !== "object") {
      throw new Error("SessionEngine.fromChallenge: a challenge record is required");
    }

    const questions = challenge.questions ?? challenge.question_list ?? [];
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error(
        `SessionEngine.fromChallenge: challenge "${challenge.id ?? "(unknown id)"}" has no questions`
      );
    }

    return new SessionEngine({
      challengeId: challenge.id,
      playerId: options.playerId ?? null,
      type: challenge.type ?? "quiz",
      mode: challenge.mode ?? "solo",

      questions,
      question: options.question,

      timer: {
        duration: challenge.timeLimit ?? challenge.time_limit ?? null,
        ...options.timer,
      },
      score: options.score,
      hints: {
        total: challenge.hintCount ?? challenge.hint_count,
        cooldownMs: challenge.hintCooldownMs ?? challenge.hint_cooldown_ms ?? 0,
        ...options.hints,
      },
      quiz: {
        passingScore: challenge.passingScore ?? challenge.passing_score,
        shuffleQuestions: challenge.shuffleQuestions ?? challenge.shuffle_questions,
        ...options.quiz,
      },

      hintPenalty: options.hintPenalty,
      speedBonusPerSecond: options.speedBonusPerSecond,

      autosave: {
        key: `challengehub:session:${challenge.id}:${options.playerId ?? "anon"}`,
        ...options.autosave,
      },
      storage: options.storage,
      plugins: options.plugins ?? [],
    });
  }

  /* ================================================
   * SUBSCRIPTION SYSTEM (React snapshot API)
   * ================================================ */

  /**
   * Subscribe to state snapshots. Immediately invokes the listener with
   * the current snapshot, then on every subsequent notify().
   * @param {(snapshot: object) => void} listener
   * @returns {() => void} unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    this._safeInvoke(listener, this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Explicitly remove a listener (alternative to the returned unsubscribe fn).
   * @param {Function} listener
   */
  unsubscribe(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notify all snapshot listeners. Never throws — a broken listener is
   * isolated and reported via the 'error' event instead of crashing the engine.
   */
  notify() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => this._safeInvoke(listener, snapshot));
  }

  /** @private */
  _safeInvoke(fn, ...args) {
    try {
      fn(...args);
    } catch (err) {
      this._safeEmitError(err);
    }
  }

  /* ================================================
   * EVENT BUS
   * ================================================ */

  /**
   * Subscribe to a granular engine event.
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void} unsubscribe function
   */
  on(event, handler) {
    if (!this._eventHandlers.has(event)) this._eventHandlers.set(event, new Set());
    const entry = { handler, once: false };
    this._eventHandlers.get(event).add(entry);
    return () => this._eventHandlers.get(event)?.delete(entry);
  }

  /**
   * Subscribe to a granular engine event for a single invocation.
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void} unsubscribe function
   */
  once(event, handler) {
    if (!this._eventHandlers.has(event)) this._eventHandlers.set(event, new Set());
    const entry = { handler, once: true };
    this._eventHandlers.get(event).add(entry);
    return () => this._eventHandlers.get(event)?.delete(entry);
  }

  /**
   * Remove a specific handler for an event.
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    const set = this._eventHandlers.get(event);
    if (!set) return;
    for (const entry of set) {
      if (entry.handler === handler) set.delete(entry);
    }
  }

  /**
   * Emit an engine event to subscribed handlers and plugins. Never throws.
   * @param {string} event
   * @param {*} payload
   */
  emit(event, payload) {
    const set = this._eventHandlers.get(event);
    if (set) {
      for (const entry of Array.from(set)) {
        this._safeInvoke(entry.handler, payload, event);
        if (entry.once) set.delete(entry);
      }
    }
    this._plugins.forEach((plugin) => {
      if (typeof plugin.onEvent === "function") {
        try {
          plugin.onEvent(event, payload, this);
        } catch (err) {
          this._safeEmitError(err);
        }
      }
    });
  }

  /** @private Emits an 'error' event without ever throwing. */
  _safeEmitError(err) {
    const set = this._eventHandlers.get("error");
    if (!set) return; // no listener registered — swallow to avoid unhandled throws
    set.forEach((entry) => {
      try {
        entry.handler(err);
      } catch {
        /* isolate: an error handler that throws must not crash the engine */
      }
    });
  }

  /* ================================================
   * LIFECYCLE / STATE MACHINE
   * ================================================ */

  /** @private */
  _canTransition(next) {
    return TRANSITIONS[this.state]?.includes(next) ?? false;
  }

  /** @private */
  _transition(next) {
    if (!this._canTransition(next)) {
      this._safeEmitError(new Error(`Illegal session transition: ${this.state} -> ${next}`));
      return false;
    }
    this.state = next;
    return true;
  }

  /**
   * Mark the session as loading (e.g. fetching remote question data).
   */
  loadingPhase() {
    this._transition("loading");
    this.notify();
  }

  /**
   * Mark the session ready to start (post-loading, pre-run).
   */
  ready() {
    if (this._transition("ready")) this.notify();
  }

  /**
   * Start (or restart from ready) the session and its timer.
   */
  start() {
    if (this.state === "running") return;
    if (!this._transition("running")) return;

    this.startedAt = this.startedAt ?? Date.now();
    this._lastQuestionStartedAt = Date.now();
    this.timer.start();

    this.emit("session:start", { at: this.startedAt });
    this.notify();
  }

  /**
   * Pause the session and its timer.
   */
  pause() {
    if (this.state !== "running") return;
    if (!this._transition("paused")) return;

    this.timer.pause();

    this.emit("session:pause", { at: Date.now() });
    this.notify();
    this._scheduleAutosave();
  }

  /**
   * Resume a paused session.
   */
  resume() {
    if (this.state !== "paused") return;
    if (!this._transition("running")) return;

    this.timer.resume();

    this.emit("session:resume", { at: Date.now() });
    this.notify();
  }

  /**
   * Finish the session. Idempotent — calling finish() twice simply
   * returns the already-computed results.
   * @returns {object} results, see getResults()
   */
  finish() {
    if (this.state === "finished") return this.getResults();
    if (!this._transition("finished")) return this.getResults();

    this.finishedAt = Date.now();
    this.timer.stop();

    const results = this.getResults();
    this.emit("session:finish", results);
    this.notify();
    this._scheduleAutosave.cancel?.();
    this.save();
    return results;
  }

  /**
   * Cancel the session (user-abandoned, disconnected, etc).
   */
  cancel() {
    if (!this._transition("cancelled")) return;

    this.timer.stop();

    this.emit("session:cancel", { at: Date.now() });
    this.notify();
    this._scheduleAutosave.cancel?.();
  }

  /**
   * Tear down the engine: stop timers, detach plugins, clear listeners.
   * Safe to call multiple times.
   */
  destroy() {
    this._timerUnsub?.();
    if (this._timerPollInterval) clearInterval(this._timerPollInterval);
    this._scheduleAutosave.cancel?.();

    this._plugins.forEach((plugin) => {
      try {
        plugin.onDestroy?.(this);
      } catch (err) {
        this._safeEmitError(err);
      }
    });
    this._plugins.clear();

    this.emit("destroy", {});

    this._eventHandlers.clear();
    this._resetState();
    this.listeners.clear();
  }

  /* ================================================
   * TIMER INTEGRATION
   * ================================================ */

  /** @private Binds to TimerEngine ticks, falling back to polling if unsupported. */
  _bindTimer() {
    if (this._timerUnsub || this._timerPollInterval) return; // prevent duplicate bindings

    if (typeof this.timer.on === "function") {
      this._timerUnsub = this.timer.on("tick", (remaining) => this._handleTimerTick(remaining));
    } else if (typeof this.timer.subscribe === "function") {
      this._timerUnsub = this.timer.subscribe((remaining) => this._handleTimerTick(remaining));
    } else {
      this._timerPollInterval = setInterval(() => {
        if (this.state === "running") this._handleTimerTick(this.timer.remaining());
      }, 250);
      this._timerUnsub = () => clearInterval(this._timerPollInterval);
    }
  }

  /** @private */
  _handleTimerTick(remaining) {
    this.emit("timer:tick", { remaining });
    this.notify();

    if (remaining <= 0 && this.state === "running") {
      this.emit("timer:finish", { at: Date.now() });
      this.finish();
    }
  }

  /* ================================================
   * QUESTIONS
   * ================================================ */

  /**
   * @returns {object|null} the current question.
   */
  getCurrentQuestion() {
    return this.questions.current();
  }

  /**
   * Advance to the next question (only while running).
   * @returns {object|null}
   */
  next() {
    if (this.state !== "running") return null;

    const question = this.questions.next();
    this._lastQuestionStartedAt = Date.now();
    this.emit("question:change", { question });
    this.notify();
    return question;
  }

  /**
   * Go back to the previous question.
   * @returns {object|null}
   */
  previous() {
    const question = this.questions.previous();
    this._lastQuestionStartedAt = Date.now();
    this.emit("question:change", { question });
    this.notify();
    return question;
  }

  /**
   * Skip the current question without answering it. Recorded distinctly
   * from wrong answers in getResults().
   * @returns {object|null} the next question, if any.
   */
  skip() {
    if (this.state !== "running") return null;

    const question = this.questions.current();
    if (!question) return null;
    if (this._answeredQuestionIds.has(question.id)) return null; // already answered/skipped

    this._recordAnswer({
      question,
      answer: null,
      correct: false,
      skipped: true,
      points: 0,
    });

    this.emit("question:skip", { questionId: question.id });

    if (this.questions.isLast()) {
      this.finish();
    } else {
      this.next();
    }

    this._scheduleAutosave();
    return this.questions.current();
  }

  /**
   * Jump directly to a question by index, if the underlying QuestionEngine
   * supports it. Validates boundaries.
   * @param {number} index
   * @returns {object|null}
   */
  jumpTo(index) {
    const total = this.questions.total();
    if (typeof index !== "number" || index < 0 || index >= total) {
      this._safeEmitError(new Error(`jumpTo: index ${index} out of bounds [0, ${total})`));
      return null;
    }
    if (typeof this.questions.jumpTo !== "function") {
      this._safeEmitError(new Error("jumpTo: QuestionEngine does not support jumpTo"));
      return null;
    }

    const question = this.questions.jumpTo(index);
    this._lastQuestionStartedAt = Date.now();
    this.emit("question:change", { question });
    this.notify();
    return question;
  }

  /**
   * Restart the timer/hints tracking for the current question without
   * changing score or advancing.
   */
  restartQuestion() {
    this.hints.resetCurrent();
    this._lastQuestionStartedAt = Date.now();
    if (typeof this.timer.restartQuestion === "function") this.timer.restartQuestion();
    this.notify();
  }

  /* ================================================
   * ANSWER PIPELINE
   * ================================================ */

  /**
   * Submit an answer for the current question. Idempotent per question —
   * a duplicate submission for an already-answered question is ignored.
   * @param {*} answer
   * @returns {{correct: boolean, points: number, score: number}|null}
   */
  submitAnswer(answer) {
    if (this.state !== "running") return null;
    if (this._answering) return null; // re-entrancy guard

    const question = this.questions.current();
    if (!question) return null;
    if (this._answeredQuestionIds.has(question.id)) return null; // duplicate submission guard (O(1))

    this._answering = true;
    try {
      const correct = this.questions.checkAnswer(answer);
      const timeRemaining = this.timer.remaining();
      const hintsUsedForQuestion = this.hints.used();

      let points = this.score.calculate({
        correct,
        timeRemaining,
        hintsUsed: hintsUsedForQuestion,
        difficulty: question.difficulty,
      });

      points = this._applyPluginScoring({ points, correct, question, hintsUsedForQuestion });

      this._recordAnswer({
        question,
        answer,
        correct,
        skipped: false,
        points,
        timeRemaining,
        hintsUsedForQuestion,
      });

      if (correct) {
        this.score.add(points);
      }

      this.emit("question:answer", { questionId: question.id, correct, points });
      this.emit("score:update", { total: this.score.total() });

      if (this.questions.isLast()) {
        this.finish(); // finish() already notifies
      } else {
        this.next();
      }

      this._scheduleAutosave();

      return { correct, points, score: this.score.total() };
    } finally {
      this._answering = false;
    }
  }

  /** @private Runs plugin score-modification hooks, isolating failures. */
  _applyPluginScoring(context) {
    let points = context.points;
    this._plugins.forEach((plugin) => {
      if (typeof plugin.onScore !== "function") return;
      try {
        const modified = plugin.onScore({ ...context, points }, this);
        if (typeof modified === "number" && Number.isFinite(modified)) points = modified;
      } catch (err) {
        this._safeEmitError(err);
      }
    });
    return points;
  }

  /** @private Appends an answer record and updates the O(1) dedupe index. */
  _recordAnswer({ question, answer, correct, skipped, points, timeRemaining = null, hintsUsedForQuestion = 0 }) {
    const now = Date.now();
    const duration = this._lastQuestionStartedAt ? now - this._lastQuestionStartedAt : null;

    this.answers.push({
      questionId: question.id,
      answer,
      correct,
      skipped,
      points,
      time: now,
      duration,
      timeRemaining,
      hintsUsed: hintsUsedForQuestion,
    });
    this._answeredQuestionIds.add(question.id);
  }

  /* ================================================
   * HINTS
   * ================================================ */

  /**
   * Request a hint for the current question, respecting any configured
   * cooldown between hint requests.
   * @returns {*} the hint, or null if unavailable/on cooldown.
   */
  requestHint() {
    const question = this.questions.current();
    if (!question) return null;

    const now = Date.now();
    if (this._hintCooldownMs > 0 && now - this._lastHintAt < this._hintCooldownMs) {
      this._safeEmitError(new Error("requestHint: on cooldown"));
      return null;
    }

    const hint = this.hints.use(question);
    if (hint == null) return null; // no hints remaining / invalid request

    this._lastHintAt = now;
    this.emit("hint:used", { questionId: question.id });
    this.notify();
    this._scheduleAutosave();

    return hint;
  }

  /* ================================================
   * PLUGIN SYSTEM
   * ================================================ */

  /**
   * Register a plugin. Plugins may implement onInit, onEvent, onScore,
   * and onDestroy hooks. Failures in a plugin never crash the engine.
   * @param {{name: string, onInit?: Function, onEvent?: Function, onScore?: Function, onDestroy?: Function}} plugin
   * @returns {boolean} whether the plugin was registered.
   */
  registerPlugin(plugin) {
    if (!plugin || !plugin.name) {
      this._safeEmitError(new Error("registerPlugin: plugin must have a unique 'name'"));
      return false;
    }
    if (this._plugins.has(plugin.name)) return false;

    this._plugins.set(plugin.name, plugin);
    try {
      plugin.onInit?.(this);
    } catch (err) {
      this._safeEmitError(err);
    }
    return true;
  }

  /**
   * Remove a previously registered plugin.
   * @param {string|object} nameOrPlugin
   * @returns {boolean}
   */
  removePlugin(nameOrPlugin) {
    const name = typeof nameOrPlugin === "string" ? nameOrPlugin : nameOrPlugin?.name;
    const plugin = this._plugins.get(name);
    if (!plugin) return false;

    try {
      plugin.onDestroy?.(this);
    } catch (err) {
      this._safeEmitError(err);
    }
    this._plugins.delete(name);
    return true;
  }

  /* ================================================
   * PERSISTENCE
   * ================================================ */

  /** @private Default storage adapter: localStorage when available, else in-memory. */
  _defaultStorage() {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
    const mem = new Map();
    return {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, v),
      removeItem: (k) => mem.delete(k),
    };
  }

  /**
   * Produce a plain-object snapshot suitable for storage.
   * Delegates to sub-engine serialize()/restore() methods when available,
   * and falls back to best-effort primitives otherwise.
   * @returns {object}
   */
  serialize() {
    return {
      challengeId: this.challengeId,
      playerId: this.playerId,
      type: this.type,
      mode: this.mode,
      status: this.state,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      answers: this.answers,
      questionIndex: this.questions.currentIndex?.() ?? null,
      timerRemaining: this.timer.remaining(),
      score: this.score.serialize?.() ?? {
        total: this.score.total(),
        xp: this.score.xp(),
        coins: this.score.coins(),
      },
      hints: this.hints.serialize?.() ?? { remaining: this.hints.remaining() },
      rank: this.rank,
      savedAt: Date.now(),
    };
  }

  /**
   * Restore engine state from a snapshot produced by serialize().
   * @param {object} snapshot
   * @returns {boolean} success
   */
  restore(snapshot) {
    if (!snapshot) return false;
    try {
      this.challengeId = snapshot.challengeId ?? this.challengeId;
      this.playerId = snapshot.playerId ?? this.playerId;
      this.type = snapshot.type ?? this.type;
      this.mode = snapshot.mode ?? this.mode;
      this.startedAt = snapshot.startedAt ?? this.startedAt;
      this.finishedAt = snapshot.finishedAt ?? this.finishedAt;
      this.answers = Array.isArray(snapshot.answers) ? snapshot.answers : [];
      this._answeredQuestionIds = new Set(this.answers.map((a) => a.questionId));
      this.rank = snapshot.rank ?? this.rank;

      if (typeof this.questions.jumpTo === "function" && typeof snapshot.questionIndex === "number") {
        this.questions.jumpTo(snapshot.questionIndex);
      }
      if (typeof this.timer.restore === "function") {
        this.timer.restore(snapshot.timerRemaining);
      } else if (typeof snapshot.timerRemaining === "number" && typeof this.timer.setRemaining === "function") {
        this.timer.setRemaining(snapshot.timerRemaining);
      }
      if (typeof this.score.restore === "function") this.score.restore(snapshot.score);
      if (typeof this.hints.restore === "function") this.hints.restore(snapshot.hints);

      this.state = "ready";
      this.emit("restore", snapshot);
      this.notify();
      return true;
    } catch (err) {
      this._safeEmitError(err);
      return false;
    }
  }

  /**
   * Persist the current serialized state to storage.
   * @returns {boolean} success
   */
  save() {
    if (!this._autosaveEnabled) return false;
    try {
      const data = this.serialize();
      this._storage.setItem(this._storageKey, JSON.stringify(data));
      this.emit("save", data);
      return true;
    } catch (err) {
      this._safeEmitError(err);
      return false;
    }
  }

  /**
   * Load and restore state from storage.
   * @returns {boolean} success
   */
  load() {
    try {
      const raw = this._storage.getItem(this._storageKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return this.restore(data);
    } catch (err) {
      this._safeEmitError(err);
      return false;
    }
  }

  /**
   * Clear any persisted state for this session.
   * @returns {boolean} success
   */
  clear() {
    try {
      this._storage.removeItem(this._storageKey);
      return true;
    } catch (err) {
      this._safeEmitError(err);
      return false;
    }
  }

  /* ================================================
   * SNAPSHOT
   * ================================================ */

  /**
   * @returns {object} a full snapshot of engine state for React consumption.
   */
  getState() {
    const total = this.questions.total();
    const currentIndex = this.questions.currentIndex?.() ?? null;
    const correctAnswers = this.answers.filter((a) => a.correct).length;
    const wrongAnswers = this.answers.filter((a) => !a.correct && !a.skipped).length;

    return {
      challengeId: this.challengeId,
      playerId: this.playerId,
      type: this.type,
      mode: this.mode,

      status: this.state,
      isLoading: this.state === "loading",
      isRunning: this.state === "running",
      isPaused: this.state === "paused",
      isFinished: this.state === "finished",

      currentQuestion: this.questions.current(),
      currentQuestionIndex: currentIndex,
      totalQuestions: total,
      progressPercentage:
        typeof this.questions.progress === "function"
          ? this.questions.progress()
          : total
          ? ((currentIndex ?? 0) / total) * 100
          : 0,

      score: this.score.total(),
      xp: this.score.xp(),
      coins: this.score.coins(),
      accuracy: total ? (correctAnswers / total) * 100 : 0,

      correctAnswers,
      wrongAnswers,

      remainingHints: this.hints.remaining(),
      remainingTime: this.timer.remaining(),
      elapsedTime: this.timer.elapsed(),

      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
    };
  }

  /* ================================================
   * RESULTS
   * ================================================ */

  /**
   * @returns {object} final results summary, computed at any point but
   * meaningful once the session has finished.
   */
  getResults() {
    const total = this.questions.total();
    const correct = this.answers.filter((a) => a.correct).length;
    const skipped = this.answers.filter((a) => a.skipped).length;
    const incorrect = Math.max(total - correct - skipped, 0);
    const accuracy = total ? (correct / total) * 100 : 0;

    const { hintPenalty, speedBonusPerSecond, gradeThresholds, starThresholds } = this._scoringConfig;

    const totalHintsUsed = this.answers.reduce((sum, a) => sum + (a.hintsUsed || 0), 0);
    const hintPenaltyTotal = totalHintsUsed * hintPenalty;

    const speedBonus = this.answers.reduce((sum, a) => {
      if (!a.correct || typeof a.timeRemaining !== "number") return sum;
      return sum + a.timeRemaining * speedBonusPerSecond;
    }, 0);

    const timedAnswers = this.answers.filter((a) => typeof a.duration === "number");
    const averageAnswerTime = timedAnswers.length
      ? timedAnswers.reduce((sum, a) => sum + a.duration, 0) / timedAnswers.length
      : 0;

    let grade = "D";
    if (accuracy >= gradeThresholds.S) grade = "S";
    else if (accuracy >= gradeThresholds.A) grade = "A";
    else if (accuracy >= gradeThresholds.B) grade = "B";
    else if (accuracy >= gradeThresholds.C) grade = "C";

    let stars = 0;
    if (accuracy >= starThresholds.three) stars = 3;
    else if (accuracy >= starThresholds.two) stars = 2;
    else if (accuracy >= starThresholds.one) stars = 1;

    const perfectGame = total > 0 && correct === total && totalHintsUsed === 0;

    return {
      challengeId: this.challengeId,
      playerId: this.playerId,

      score: this.score.total(),
      xp: this.score.xp(),
      coins: this.score.coins(),

      accuracy,
      grade,
      stars,
      rank: this.rank,
      perfectGame,

      averageAnswerTime,
      totalTime: this.timer.elapsed(),
      speedBonus,
      hintPenalty: hintPenaltyTotal,

      correct,
      incorrect,
      skipped,

      answers: this.answers,

      metadata: {
        type: this.type,
        mode: this.mode,
        startedAt: this.startedAt,
        finishedAt: this.finishedAt,
      },
    };
  }

  /**
   * Manually assign a rank (e.g. from a Leaderboard/RewardEngine integration).
   * @param {*} rank
   */
  setRank(rank) {
    this.rank = rank;
    this.notify();
  }

  /* ================================================
   * RESET
   * ================================================ */

  /**
   * Reset the session back to idle, clearing all progress.
   */
  reset() {
    this._resetState();
    this.notify();
  }

  /**
   * Internal reset shared by reset() and destroy(). Does not notify —
   * callers decide whether/when to do so.
   * @private
   */
  _resetState() {
    this.state = "idle";
    this.startedAt = null;
    this.finishedAt = null;
    this.answers = [];
    this._answeredQuestionIds = new Set();
    this._lastQuestionStartedAt = null;
    this._lastHintAt = 0;

    this.questions.reset();
    this.timer.reset();
    this.score.reset();
    this.hints.reset();
  }
}