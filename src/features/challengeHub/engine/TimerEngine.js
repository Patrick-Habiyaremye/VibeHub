/**
 * --------------------------------------------------------
 * TimerEngine
 * --------------------------------------------------------
 * Independent timer engine for ChallengeHub.
 *
 * Features
 * • Countdown mode
 * • Stopwatch mode
 * • Start / Pause / Resume / Stop / Reset
 * • Tick callbacks
 * • Finish callback
 * • Progress calculation
 * • Session persistence
 * *
 * No React dependency.
 * --------------------------------------------------------
 */

export default class TimerEngine {
  constructor(options = {}) {
    this.duration = options.duration ?? 60; // seconds
    this.mode = options.mode ?? "countdown"; // countdown | stopwatch
    this.interval = null;

    this.running = false;
    this.paused = false;

    this.remaining = this.duration;
    this.elapsed = 0;

    this.startedAt = null;

    this.listeners = {
      tick: [],
      finish: [],
      pause: [],
      resume: [],
      stop: [],
      start: [],
      reset: [],
    };
  }

  /* ================================================
      EVENTS
     ================================================ */

  on(event, callback) {
    if (!this.listeners[event]) return;

    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;

    this.listeners[event] =
      this.listeners[event].filter(fn => fn !== callback);
  }

  emit(event, payload = {}) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(fn => fn(payload));
  }

  /* ================================================
      CONTROL
     ================================================ */

  start() {
    if (this.running) return;

    this.running = true;
    this.paused = false;
    this.startedAt = Date.now();

    this.emit("start", this.snapshot());

    this.interval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    if (!this.running || this.paused) return;

    if (this.mode === "countdown") {
      this.remaining--;

      this.elapsed++;

      this.emit("tick", this.snapshot());

      if (this.remaining <= 0) {
        this.remaining = 0;
        this.finish();
      }

      return;
    }

    // Stopwatch

    this.elapsed++;

    this.emit("tick", this.snapshot());
  }

  pause() {
    if (!this.running || this.paused) return;

    this.paused = true;

    this.emit("pause", this.snapshot());
  }

  resume() {
    if (!this.running || !this.paused) return;

    this.paused = false;

    this.emit("resume", this.snapshot());
  }

  stop() {
    clearInterval(this.interval);

    this.interval = null;

    this.running = false;

    this.paused = false;

    this.emit("stop", this.snapshot());
  }

  finish() {
    clearInterval(this.interval);

    this.interval = null;

    this.running = false;

    this.paused = false;

    this.emit("finish", this.snapshot());
  }

  reset(newDuration = null) {
    clearInterval(this.interval);

    this.interval = null;

    this.running = false;

    this.paused = false;

    if (newDuration !== null) {
      this.duration = newDuration;
    }

    this.remaining = this.duration;
    this.elapsed = 0;

    this.emit("reset", this.snapshot());
  }

  /* ================================================
      GETTERS
     ================================================ */

  isRunning() {
    return this.running;
  }

  isPaused() {
    return this.paused;
  }

  getRemaining() {
    return this.remaining;
  }

  getElapsed() {
    return this.elapsed;
  }

  getDuration() {
    return this.duration;
  }

  getProgress() {
    if (this.mode === "stopwatch") {
      return 0;
    }

    return (
      ((this.duration - this.remaining) / this.duration) * 100
    );
  }

  snapshot() {
    return {
      mode: this.mode,

      duration: this.duration,

      remaining: this.remaining,

      elapsed: this.elapsed,

      running: this.running,

      paused: this.paused,

      progress: this.getProgress(),
    };
  }

  /* ================================================
      SERIALIZATION
     ================================================ */

  serialize() {
    return {
      duration: this.duration,
      mode: this.mode,
      remaining: this.remaining,
      elapsed: this.elapsed,
      running: this.running,
      paused: this.paused,
    };
  }

  restore(state) {
    if (!state) return;

    this.duration = state.duration;
    this.mode = state.mode;
    this.remaining = state.remaining;
    this.elapsed = state.elapsed;
    this.running = false;
    this.paused = false;
  }

  destroy() {
    clearInterval(this.interval);

    this.interval = null;

    this.listeners = {
      tick: [],
      finish: [],
      pause: [],
      resume: [],
      stop: [],
      start: [],
      reset: [],
    };
  }
}