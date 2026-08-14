import React, { useState } from "react";
import QuizPlayer from "./QuizPlayer";

export default function WhoAmIPlayer() {
  const [input, setInput] = useState("");

  return (
    <QuizPlayer
      renderMedia={({ question }) =>
        question.image && (
          <div className="flex justify-center">
            <img
              src={question.image}
              className="w-48 h-48 rounded"
            />
          </div>
        )
      }

      renderQuestion={() => (
        <div className="text-xl text-center font-bold">
          Who am I?
        </div>
      )}

      renderAnswers={({ submitAnswer, isPaused }) => (
        <div className="flex gap-2">
          <input
            className="flex-1 p-3 border rounded"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            disabled={isPaused}
          />
          <button
            onClick={() => {
              submitAnswer(input);
              setInput("");
            }}
            className="px-4 bg-purple-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      )}
    />
  );
}