import React, { useState } from "react";

export default function createRenderer() {
  const [input, setInput] = useState("");

  return {
    renderQuestion: () => (
      <h2 className="text-xl font-bold text-center">
        Who am I?
      </h2>
    ),

    renderMedia: ({ question }) =>
      question.image && (
        <img
          src={question.image}
          className="w-48 h-48 mx-auto rounded"
        />
      ),

    renderAnswers: ({ submitAnswer, isPaused }) => (
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isPaused}
          className="flex-1 border p-2 rounded"
          placeholder="Type your guess..."
        />
        <button
          onClick={() => {
            submitAnswer(input);
            setInput("");
          }}
          className="bg-purple-600 text-white px-4 rounded"
        >
          Submit
        </button>
      </div>
    ),
  };
}