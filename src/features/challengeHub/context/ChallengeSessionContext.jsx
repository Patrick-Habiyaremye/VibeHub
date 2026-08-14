// src/features/challengeHub/context/ChallengeSessionContext.jsx
//
// Thin React wrapper around SessionController — does NOT reimplement any
// engine/session logic itself. `start()` delegates to
// SessionController.create(), which handles fetching the challenge,
// resolving/creating the challenge_progress row, and wiring the
// Supabase sync plugin. This context's only jobs are: own the current
// controller instance, surface loading/error state around the async
// lifecycle calls (create/finish), and guarantee the previous
// controller is always destroy()'d before a new one replaces it.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import SessionController from "../controllers/session.controller";
import { useAuth } from "../../../context/AuthContext";

const ChallengeSessionContext = createContext(null);

export function ChallengeSessionProvider({ children }) {
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  // Guards against a stray destroy() call outliving the controller it
  // was meant to clean up (e.g. two start() calls racing).
  const sessionRef = useRef(null);

  const teardownCurrent = useCallback(() => {
    sessionRef.current?.destroy();
    sessionRef.current = null;
  }, []);

  /**
   * Start a new play session. Tears down any existing session first —
   * you cannot have two live SessionControllers (and their timers/
   * autosave/sync plugin) running at once.
   * @param {string|number} challengeId
   * @returns {Promise<boolean>} whether the session started successfully
   */
  const start = useCallback(
    async (challengeId) => {
      if (!user?.id) {
        setError("You must be signed in to play.");
        return false;
      }

      setStarting(true);
      setError(null);
      teardownCurrent();

      const result = await SessionController.create({
        challengeId,
        userId: user.id,
      });

      if (!result.success) {
        setStarting(false);
        setError(result.message);
        setSession(null);
        return false;
      }

      const controller = result.data;
      sessionRef.current = controller;
      controller.startSession();

      setSession(controller);
      setStarting(false);
      return true;
    },
    [user?.id, teardownCurrent]
  );

  /**
   * Resume a previously-abandoned in-progress session for this
   * challenge (backed by the engine's own localStorage autosave).
   * @param {string|number} challengeId
   * @returns {Promise<boolean>}
   */
  const resumeExisting = useCallback(
    async (challengeId) => {
      if (!user?.id) {
        setError("You must be signed in to play.");
        return false;
      }

      setStarting(true);
      setError(null);
      teardownCurrent();

      const result = await SessionController.resume({
        challengeId,
        userId: user.id,
      });

      if (!result.success) {
        setStarting(false);
        setError(result.message);
        setSession(null);
        return false;
      }

      const controller = result.data;
      sessionRef.current = controller;
      controller.startSession(); // safe from both "idle" and "ready" states

      setSession(controller);
      setStarting(false);
      return true;
    },
    [user?.id, teardownCurrent]
  );

  // --- Synchronous gameplay passthroughs -----------------------------
  // These mirror SessionController's own synchronous API. No network
  // wait, no loading state — the controller's internal sync plugin
  // handles persistence in the background.

  const submit = useCallback((answer) => {
    return sessionRef.current?.submitAnswer(answer);
  }, []);

  const next = useCallback(() => {
    return sessionRef.current?.nextQuestion();
  }, []);

  const hint = useCallback(() => {
    return sessionRef.current?.useHint();
  }, []);

  const pause = useCallback(() => {
    return sessionRef.current?.pauseSession();
  }, []);

  const resume = useCallback(() => {
    return sessionRef.current?.resumeSession();
  }, []);

  // --- Finish (async — we wait for the completion record to persist) -

  const finish = useCallback(async () => {
    if (!sessionRef.current) return null;

    const result = await sessionRef.current.finishSession();

    if (!result.meta.persisted) {
      // Results are NOT lost — finishSession() always returns the local
      // results even when the DB write fails — this only flags that the
      // save should be retried/reported, matching finishSession()'s own
      // documented contract.
      console.warn("[ChallengeSessionContext] finish() results not persisted to server.");
    }

    teardownCurrent();
    setSession(null);

    return result.data; // final results object, regardless of persistence outcome
  }, [teardownCurrent]);

  const value = useMemo(
    () => ({
      session,
      starting,
      error,
      start,
      resumeExisting,
      submit,
      next,
      hint,
      pause,
      resume,
      finish,
    }),
    [session, starting, error, start, resumeExisting, submit, next, hint, pause, resume, finish]
  );

  return (
    <ChallengeSessionContext.Provider value={value}>
      {children}
    </ChallengeSessionContext.Provider>
  );
}

export function useChallengeSession() {
  const ctx = useContext(ChallengeSessionContext);

  if (!ctx) {
    throw new Error(
      "useChallengeSession must be used inside ChallengeSessionProvider"
    );
  }

  return ctx;
}