// src/features/challengeHub/pages/GamePlayer.jsx

import { useEffect, useRef, useState } from "react";

import { createGameSession } from "../games/core/createGameSession";
import { applyMiddleware } from "../games/core/middleware";

import {
  persistenceMiddleware,
  loadSession,
} from "../games/core/persistence";

import {
  replayMiddleware,
  createReplayRecorder,
} from "../games/core/replay";

import { PLAYERS } from "../players";

export default function GamePlayer({ type }) {
  const player = PLAYERS[type];

  const recorder = useRef(createReplayRecorder());
  const sessionRef = useRef(null);

  const [state, setState] = useState(null);

  useEffect(() => {
    const baseSession = createGameSession(
      player.game,
      player.config
    );

    const sessionId = `session_${type}`;

    // 🔥 restore previous state if exists
    const saved = loadSession(sessionId);
    if (saved?.state) {
      baseSession.sendInput = () => {}; // prevent overwrite
      baseSession.tick = () => {};
    }

    const enhancedSession = applyMiddleware(baseSession, [
      replayMiddleware(recorder.current),
      persistenceMiddleware(sessionId),
    ]);

    sessionRef.current = enhancedSession;
    setState(enhancedSession.getState());
  }, [type]);

  function sendInput(input) {
    const s = sessionRef.current;
    s.sendInput(input);
    setState({ ...s.getState() });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const s = sessionRef.current;
      if (!s) return;

      s.tick(16);
      setState({ ...s.getState() });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);

  if (!state) return <div>Loading...</div>;

  const Renderer = player.renderer;

  return (
    <Renderer
      state={state}
      sendInput={sendInput}
      config={player.config}
    />
  );
}