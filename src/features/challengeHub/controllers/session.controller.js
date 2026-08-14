// src/features/challengeHub/controllers/session.controller.js
//
// Wraps SessionEngine and exposes a hook-friendly gameplay API. Unlike
// ChallengeController (stateless, static methods), a play session is
// inherently stateful across calls — so this is an instantiable class:
// one SessionController instance per active play-through.
//
// Responsibilities this file owns that SessionEngine deliberately does
// NOT (per its own doc comments):
//   1. Fetching the raw challenge and building the engine via fromChallenge.
//   2. Creating/reusing a challenge_progress row in Supabase.
//   3. Keeping that row in sync as the session progresses, via a plugin
//      registered on the engine (the "remote progress sync plugin" the
//      engine's fromChallenge docs call out as the intended extension
//      point) — NOT by manually intercepting every controller method.
//
// IMPORTANT — error visibility: SessionEngine's _safeEmitError() is a
// no-op unless something is listening on the 'error' event. Every
// SessionController instance registers a listener in its constructor so
// illegal transitions / plugin failures / restore failures are never
// silently swallowed.
//
// IMPORTANT — normalization: this file intentionally uses
// ChallengeService.getChallengeById() directly, NOT ChallengeController.
// ChallengeNormalizer strips time_limit/hint_count/passing_score/
// shuffle_questions — exactly the fields SessionEngine.fromChallenge()
// needs. Routing through the normalized controller here would silently
// break timers and hints.
//
// Return shape convention (matches ChallengeController):
//   success case:  { success: true, data, meta? }
//   failure case:  { success: false, message, code? }
// ...but ONLY for methods that can meaningfully fail or touch the
// network (create/resume/finish/destroy). Synchronous gameplay
// passthroughs (submitAnswer, next, useHint, etc.) return the engine's
// own result shape directly and un-wrapped — wrapping every call that
// fires on every keystroke/tap would add noise without adding safety,
// and would make this feel nothing like calling the engine directly.

import SessionEngine from "../engine/SessionEngine";
import ChallengeService from "../services/challenge.service";

const DEFAULT_SYNC_DEBOUNCE_MS = 1500;

/* ============================================================
 * PROGRESS SYNC PLUGIN
 * ============================================================
 * Registered on the SessionEngine instance via its plugin system.
 * Listens to the engine's own event bus and pushes progress updates to
 * Supabase in the background — debounced so rapid-fire answers don't
 * spam the network, and completely decoupled from the engine's
 * synchronous gameplay methods (a slow/failed network call here never
 * blocks or breaks gameplay).
 */
function createProgressSyncPlugin({ progressId, debounceMs = DEFAULT_SYNC_DEBOUNCE_MS }) {
  let timer = null;

  const pushProgress = (engine) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!progressId) return; // sync disabled (progress row failed to create — degrade gracefully)

      try {
        const { progressPercentage } = engine.getState();
        await ChallengeService.updateProgress({
          id: progressId,
          progress: Math.round(progressPercentage),
        });
      } catch (err) {
        // Never let a sync failure crash gameplay — surface it through
        // the engine's own event bus instead, so a hook CAN listen for
        // it (e.g. to show a subtle "not saving" indicator) but doesn't
        // have to.
        engine.emit("sync:error", { operation: "updateProgress", error: err });
      }
    }, debounceMs);
  };

  return {
    name: "supabase-progress-sync",

    onEvent(event, payload, engine) {
      if (
        event === "question:answer" ||
        event === "question:skip" ||
        event === "hint:used" ||
        event === "session:pause"
      ) {
        pushProgress(engine);
      }

      if (event === "session:finish") {
        clearTimeout(timer);
        if (!progressId) return;

        ChallengeService.completeProgress({ id: progressId, proof: payload }).catch((err) => {
          engine.emit("sync:error", { operation: "completeProgress", error: err });
        });
      }
    },

    onDestroy() {
      clearTimeout(timer);
    },
  };
}

/* ============================================================
 * SESSION CONTROLLER
 * ============================================================ */

export default class SessionController {
  /**
   * Private constructor-equivalent — always go through create()/resume()
   * so the challenge fetch + progress row + engine wiring happen in the
   * right order. `new SessionController()` directly would skip all of
   * that, so it's not part of the public API.
   * @private
   */
  constructor({ engine, progressId, challengeId, userId, syncEnabled }) {
    this.engine = engine;
    this.progressId = progressId;
    this.challengeId = challengeId;
    this.userId = userId;
    this.syncEnabled = syncEnabled;
    this._destroyed = false;

    // See file header — without this, engine-level errors are silently
    // swallowed. console.error is the floor; a hook can additionally do
    // controller.engine.on('error', ...) for its own UI handling.
    this.engine.on("error", (err) => {
      console.error("[SessionController] engine error:", err);
    });
  }

  /* ============================================================
   * FACTORY
   * ========================================================== */

  /**
   * Start a brand-new play session for a challenge.
   * @param {object} params
   * @param {string|number} params.challengeId
   * @param {string|number} params.userId
   * @param {object} [params.engineOptions] - forwarded to SessionEngine.fromChallenge's `options`.
   * @returns {Promise<{success:boolean,data?:SessionController,message?:string,code?:string}>}
   */
  static async create({ challengeId, userId, engineOptions = {} }) {
    if (!challengeId) {
      return { success: false, message: "Challenge ID is required." };
    }
    if (!userId) {
      return { success: false, message: "User ID is required." };
    }

    let challenge;
    try {
      challenge = await ChallengeService.getChallengeById(challengeId);
    } catch (err) {
      return { success: false, message: err.message || "Failed to load challenge.", code: err.code };
    }

    if (!challenge) {
      return { success: false, message: "Challenge not found.", code: "NOT_FOUND" };
    }

    // Resolve (or create) the single progress row for this user+challenge.
    // See file header re: this schema having no attempt-number column —
    // restarting a previously completed challenge resets THIS row rather
    // than creating a new attempt record.
    let progressId = null;
    let syncEnabled = true;

    try {
      const existing = await ChallengeService.getUserProgress(challengeId, userId);

      if (existing) {
        progressId = existing.id;
        if (existing.status === "completed") {
          // Reset the existing row for a fresh play-through.
          await ChallengeService.updateProgress({ id: progressId, progress: 0 });
        }
      } else {
        const created = await ChallengeService.createProgress({ challengeId, userId });
        progressId = created.id;
      }
    } catch (err) {
      // Deliberate graceful degradation: a failure to create/read the
      // progress row should not block the user from playing. Gameplay
      // continues locally; server-side progress sync is simply disabled
      // for this session.
      console.warn("[SessionController] progress row unavailable, continuing without sync:", err);
      syncEnabled = false;
    }

    let engine;
    try {
      engine = SessionEngine.fromChallenge(challenge, {
        playerId: userId,
        ...engineOptions,
        plugins: [
          ...(syncEnabled ? [createProgressSyncPlugin({ progressId })] : []),
          ...(engineOptions.plugins || []),
        ],
      });
    } catch (err) {
      return { success: false, message: err.message || "Failed to build session." };
    }

    const controller = new SessionController({
      engine,
      progressId,
      challengeId,
      userId,
      syncEnabled,
    });

    return { success: true, data: controller, meta: { syncEnabled } };
  }

  /**
   * Resume an existing in-progress session (e.g. after a page refresh),
   * using the engine's own localStorage-backed autosave. Requires a
   * challenge_progress row that isn't already "completed".
   * @param {object} params
   * @param {string|number} params.challengeId
   * @param {string|number} params.userId
   * @param {object} [params.engineOptions]
   * @returns {Promise<{success:boolean,data?:SessionController,message?:string,code?:string}>}
   */
  static async resume({ challengeId, userId, engineOptions = {} }) {
    if (!challengeId) {
      return { success: false, message: "Challenge ID is required." };
    }
    if (!userId) {
      return { success: false, message: "User ID is required." };
    }

    let progress;
    try {
      progress = await ChallengeService.getUserProgress(challengeId, userId);
    } catch (err) {
      return { success: false, message: err.message || "Failed to load progress.", code: err.code };
    }

    if (!progress || progress.status === "completed") {
      return { success: false, message: "No active session to resume.", code: "NOT_FOUND" };
    }

    let challenge;
    try {
      challenge = await ChallengeService.getChallengeById(challengeId);
    } catch (err) {
      return { success: false, message: err.message || "Failed to load challenge.", code: err.code };
    }

    if (!challenge) {
      return { success: false, message: "Challenge not found.", code: "NOT_FOUND" };
    }

    let engine;
    try {
      engine = SessionEngine.fromChallenge(challenge, {
        playerId: userId,
        ...engineOptions,
        autosave: { restoreOnInit: true, ...engineOptions.autosave },
        plugins: [
          createProgressSyncPlugin({ progressId: progress.id }),
          ...(engineOptions.plugins || []),
        ],
      });
    } catch (err) {
      return { success: false, message: err.message || "Failed to rebuild session." };
    }

    // fromChallenge's constructor already called load() if a matching
    // localStorage snapshot exists (restoreOnInit: true above), leaving
    // the engine in "ready" state. If no local snapshot was found, the
    // engine is still "idle" — either way, calling startSession()
    // afterward is safe (both states legally transition to "running").
    const controller = new SessionController({
      engine,
      progressId: progress.id,
      challengeId,
      userId,
      syncEnabled: true,
    });

    return { success: true, data: controller };
  }

  /* ============================================================
   * GUARDS
   * ========================================================== */

  /** @private */
  _assertAlive() {
    if (this._destroyed) {
      throw new Error("SessionController: cannot use a session after destroy().");
    }
  }

  /* ============================================================
   * LIFECYCLE PASSTHROUGHS (synchronous — mirror the engine directly)
   * ========================================================== */

  startSession() {
    this._assertAlive();
    this.engine.start();
    return this.engine.getState();
  }

  pauseSession() {
    this._assertAlive();
    this.engine.pause();
    return this.engine.getState();
  }

  resumeSession() {
    this._assertAlive();
    this.engine.resume();
    return this.engine.getState();
  }

  cancelSession() {
    this._assertAlive();
    this.engine.cancel();
    return this.engine.getState();
  }

  /**
   * Finish the session. The one lifecycle method that's async/awaited —
   * we want to know the completion record actually made it to Supabase
   * before telling the caller "done." If the write fails, the local
   * results are still returned (nothing about the player's game is
   * lost), but `meta.persisted` tells the caller the save needs a retry.
   * @returns {Promise<{success:boolean,data:object,meta:{persisted:boolean}}>}
   */
  async finishSession() {
    this._assertAlive();

    const results = this.engine.finish(); // synchronous, always succeeds/idempotent

    if (!this.syncEnabled || !this.progressId) {
      return { success: true, data: results, meta: { persisted: false } };
    }

    try {
      await ChallengeService.completeProgress({ id: this.progressId, proof: results });
      return { success: true, data: results, meta: { persisted: true } };
    } catch (err) {
      console.warn("[SessionController] finish() DB sync failed, results kept locally:", err);
      return { success: true, data: results, meta: { persisted: false } };
    }
  }

  /* ============================================================
   * QUESTION / ANSWER PASSTHROUGHS (synchronous)
   * ========================================================== */

  getCurrentQuestion() {
    this._assertAlive();
    return this.engine.getCurrentQuestion();
  }

  submitAnswer(answer) {
    this._assertAlive();
    return this.engine.submitAnswer(answer);
  }

  nextQuestion() {
    this._assertAlive();
    return this.engine.next();
  }

  previousQuestion() {
    this._assertAlive();
    return this.engine.previous();
  }

  skipQuestion() {
    this._assertAlive();
    return this.engine.skip();
  }

  jumpToQuestion(index) {
    this._assertAlive();
    return this.engine.jumpTo(index);
  }

  restartQuestion() {
    this._assertAlive();
    this.engine.restartQuestion();
  }

  useHint() {
    this._assertAlive();
    return this.engine.requestHint();
  }

  /* ============================================================
   * STATE / RESULTS / SERIALIZATION (synchronous)
   * ========================================================== */

  getState() {
    this._assertAlive();
    return this.engine.getState();
  }

  getResults() {
    this._assertAlive();
    return this.engine.getResults();
  }

  serialize() {
    this._assertAlive();
    return this.engine.serialize();
  }

  /* ============================================================
   * REACT-FACING SUBSCRIPTIONS (passthrough)
   * ========================================================== */

  /** @param {(snapshot: object) => void} listener */
  subscribe(listener) {
    this._assertAlive();
    return this.engine.subscribe(listener);
  }

  /** @param {string} event @param {Function} handler */
  on(event, handler) {
    this._assertAlive();
    return this.engine.on(event, handler);
  }

  /** @param {string} event @param {Function} handler */
  once(event, handler) {
    this._assertAlive();
    return this.engine.once(event, handler);
  }

  /** @param {string} event @param {Function} handler */
  off(event, handler) {
    this._assertAlive();
    this.engine.off(event, handler);
  }

  /* ============================================================
   * TEARDOWN
   * ========================================================== */

  /**
   * Tear down the underlying engine (stops timers, detaches the sync
   * plugin, clears listeners) and marks this controller unusable. Call
   * from a hook's cleanup/unmount — safe to call multiple times.
   */
  destroy() {
    if (this._destroyed) return;
    this.engine.destroy();
    this._destroyed = true;
  }
}