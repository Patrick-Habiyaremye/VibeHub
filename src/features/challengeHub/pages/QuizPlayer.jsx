// pages/QuizPlayer.jsx

import React from "react";
import useChallengeSession from "./useChallengeSession";

export default function QuizPlayer({ controller, renderer }) {
  const {
    state,
    submitAnswer,
    next,
    pause,
    resume,
  } = useChallengeSession(controller);

  const {
    currentQuestion,
    currentIndex,
    total,
    timeLeft,
    isPaused,
  } = state;

  if (!currentQuestion) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">

      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{currentIndex + 1} / {total}</span>
        <span>{timeLeft}s</span>
      </div>

      {/* Question */}
      {renderer.renderQuestion?.({ question: currentQuestion })}

      {/* Media */}
      {renderer.renderMedia?.({ question: currentQuestion })}

      {/* Answers */}
      {renderer.renderAnswers?.({
        question: currentQuestion,
        submitAnswer,
        isPaused,
      })}

      {/* Controls */}
      <div className="flex justify-between">
        <button onClick={next} className="px-3 py-1 bg-gray-200 rounded">
          Skip
        </button>

        {isPaused ? (
          <button onClick={resume}>Resume</button>
        ) : (
          <button onClick={pause}>Pause</button>
        )}
      </div>
    </div>
  );
}