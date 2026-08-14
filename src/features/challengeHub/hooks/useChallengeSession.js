// src/features/challengeHub/hooks/useChallengeSession.js

import { useCallback, useEffect, useMemo, useState } from "react";

import { useChallengeSession as useSessionContext } from "../context/ChallengeSessionContext";

export default function useChallengeSession() {
  const { session, start, submit, next, hint, pause, resume, finish } =
    useSessionContext();

  // The actual source of re-renders. SessionEngine.subscribe() invokes
  // the listener immediately with the current snapshot, then again on
  // every notify() — so this stays in sync with the engine automatically.
  const [snapshot, setSnapshot] = useState(() =>
    session?.getState ? session.getState() : null
  );

  useEffect(() => {
    if (!session || !session.subscribe) {
      setSnapshot(null);
      return;
    }

    const unsubscribe = session.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [session]);

  const startGame = useCallback(() => {
    if (!session) return;
    return start();
  }, [session, start]);

  const submitAnswer = useCallback(
    (answer) => {
      if (!session) return;
      return submit(answer);
    },
    [session, submit]
  );

  const nextQuestion = useCallback(() => {
    if (!session) return;
    return next();
  }, [session, next]);

  const requestHint = useCallback(() => {
    if (!session) return;
    return hint();
  }, [session, hint]);

  const pauseGame = useCallback(() => {
    if (!session) return;
    return pause();
  }, [session, pause]);

  const resumeGame = useCallback(() => {
    if (!session) return;
    return resume();
  }, [session, resume]);

  const finishGame = useCallback(() => {
    if (!session) return;
    return finish();
  }, [session, finish]);

  // Derived straight from the live snapshot — not from `session` itself,
  // which never changes identity mid-session and so was never a valid
  // useMemo dependency for these values in the first place.
  const derived = useMemo(() => {
    if (!snapshot) {
      return {
        loading: false,
        active: false,
        finished: false,
        paused: false,
        question: null,
        score: 0,
        progress: 0,
      };
    }

    return {
      loading: snapshot.isLoading,
      active: snapshot.isRunning,
      finished: snapshot.isFinished,
      paused: snapshot.isPaused,
      question: snapshot.currentQuestion ?? null,
      score: snapshot.score ?? 0,
      progress: snapshot.progressPercentage ?? 0,
    };
  }, [snapshot]);

  return {
    // raw session + full snapshot, for anything the derived shortcuts don't cover
    session,
    snapshot,

    // state helpers
    ...derived,

    // actions
    start: startGame,
    submitAnswer,
    nextQuestion,
    requestHint,
    pauseGame,
    resumeGame,
    finishGame,
  };
}