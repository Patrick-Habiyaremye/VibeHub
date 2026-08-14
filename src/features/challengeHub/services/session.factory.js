// src/features/challengeHub/services/session.factory.js

import SessionEngine from "../engine/SessionEngine";
import ChallengeService from "../../../services/challenge.service";
import { createChallengeProgressSyncPlugin } from "../engine/plugins/challengeProgressSyncPlugin";

/**
 * Fetches a challenge, resolves (or creates) the player's remote progress
 * row, and returns a fully-wired, playable SessionEngine.
 *
 * This is what replaces `setSession(challenge)` — a raw database row with
 * no submitAnswer()/next()/pause() — with an actual session object:
 *
 *   const session = await createChallengeSession({ challengeId, userId });
 *   setSession(session);
 *   session.start();
 *
 * If a local autosave exists for this challenge/player on this device
 * (from a previous SessionEngine.save()), it's restored automatically so
 * a refresh mid-quiz resumes exactly where the player left off. Remote
 * progress is a separate, coarser checkpoint used across devices/features
 * (Leaderboard, ProgressEngine) — see challengeProgressSyncPlugin.js.
 *
 * @param {object} args
 * @param {string|number} args.challengeId
 * @param {string|number} args.userId
 * @param {object} [args.sessionOptions] - extra options forwarded to SessionEngine.fromChallenge() (timer/hints/quiz overrides, extra plugins, etc).
 * @returns {Promise<SessionEngine>}
 */
export async function createChallengeSession({ challengeId, userId, sessionOptions = {} }) {
  if (challengeId == null) throw new Error("createChallengeSession: challengeId is required");
  if (userId == null) throw new Error("createChallengeSession: userId is required");

  const challenge = await ChallengeService.getChallengeById(challengeId);

  let progressRecord = await ChallengeService.getUserProgress(challengeId, userId);
  if (!progressRecord) {
    progressRecord = await ChallengeService.createProgress({ challengeId, userId });
  }

  const syncPlugin = createChallengeProgressSyncPlugin({
    challengeService: ChallengeService,
    progressId: progressRecord.id,
  });

  const session = SessionEngine.fromChallenge(challenge, {
    ...sessionOptions,
    playerId: userId,
    plugins: [syncPlugin, ...(sessionOptions.plugins ?? [])],
  });

  // Resume exact local per-question state if this device has an autosave
  // for this session. If not, the session starts fresh even if remote
  // progress shows partial completion from another device — reconciling
  // cross-device resume is a product decision, not something to guess at
  // silently here.
  session.load();

  return session;
}