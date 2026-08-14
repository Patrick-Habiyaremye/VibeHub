// src/features/challengeHub/engine/plugins/challengeProgressSyncPlugin.js

/**
 * Bridges a SessionEngine to the remote `challenge_progress` row via
 * ChallengeService.
 *
 * SessionEngine's own autosave (serialize/save/load) is fine-grained,
 * per-question, and local — it's what lets a page refresh resume exactly
 * where the player left off on the *same device*. This plugin is coarser
 * and remote: it keeps the `challenge_progress` table (read by
 * Leaderboard, ProgressEngine, RewardEngine) updated as a percentage
 * checkpoint, and marks completion when the session finishes.
 *
 * These two persistence layers are intentionally separate — local
 * autosave is not a substitute for the remote progress row, and vice
 * versa. Merging them would mean either losing per-question resume state
 * or bloating the DB row with the full answer log.
 *
 * Network failures are routed through the engine's own error event and
 * never thrown — a flaky request must not crash a running session.
 *
 * @param {object} args
 * @param {{ updateProgress: Function, completeProgress: Function }} args.challengeService
 * @param {string|number} args.progressId - id of the challenge_progress row to update.
 * @returns {{name: string, onEvent: Function}} a SessionEngine-compatible plugin.
 */
export function createChallengeProgressSyncPlugin({ challengeService, progressId }) {
  if (!challengeService || typeof challengeService.updateProgress !== "function") {
    throw new Error("createChallengeProgressSyncPlugin: a challengeService with updateProgress() is required");
  }
  if (progressId == null) {
    throw new Error("createChallengeProgressSyncPlugin: progressId is required");
  }

  return {
    name: "challenge-progress-sync",

    onEvent(event, payload, engine) {
      switch (event) {
        case "question:answer":
        case "question:skip": {
          const { progressPercentage } = engine.getState();
          challengeService
            .updateProgress({ id: progressId, progress: Math.round(progressPercentage) })
            .catch((err) => engine.emit("error", err));
          break;
        }

        case "session:finish": {
          const results = payload;
          challengeService
            .completeProgress({
              id: progressId,
              proof: {
                score: results.score,
                accuracy: results.accuracy,
                grade: results.grade,
                correct: results.correct,
                incorrect: results.incorrect,
                skipped: results.skipped,
                completedAt: results.metadata?.finishedAt ?? null,
              },
            })
            .catch((err) => engine.emit("error", err));
          break;
        }

        default:
          break;
      }
    },
  };
}