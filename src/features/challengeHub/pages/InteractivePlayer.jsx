import React, { useRef, useState } from "react";
import useGameLoop from "./hooks/useGameLoop";

export default function InteractivePlayer({ game, renderer: Renderer, config }) {
  const [state, setState] = useState(
    game.getInitialState(config)
  );

  const inputQueue = useRef([]);

  function sendInput(input) {
    inputQueue.current.push(input);
  }

  function update() {
    setState(prev => {
      let newState = prev;

      while (inputQueue.current.length > 0) {
        const input = inputQueue.current.shift();
        newState = game.handleInput(newState, input, config);
      }

      return game.update(newState, config);
    });
  }

  useGameLoop(update, game.fps || 60);

  return (
    <Renderer
      state={state}
      sendInput={sendInput}
      config={config}
    />
  );
}