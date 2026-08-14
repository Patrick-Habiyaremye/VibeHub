// src/features/challengeHub/components/GameRenderer.jsx

import QuestionCard from "./QuestionCard";
import AnswerList from "./AnswerList";
import TextAnswer from "./TextAnswer";
import FlagViewer from "./FlagViewer";

export default function GameRenderer({
  session,
  question,
  config,

  onAnswer,
  onNext,
  onHint,
  onPause,
  onResume,
}) {
  if (!question) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading challenge...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">

      <QuestionCard
        question={question}
        current={session.currentIndex + 1}
        total={session.totalQuestions}
      />

      {/* media */}
      {config.hasMedia && question.image && (
        <FlagViewer src={question.image} alt={question.title} />
      )}

      {/* answers */}
      {config.answerType === "multiple_choice" && (
        <AnswerList
          answers={question.answers}
          disabled={session.isPaused}
          onSelect={onAnswer}
        />
      )}

      {config.answerType === "text" && (
        <TextAnswer
          disabled={session.isPaused}
          onSubmit={onAnswer}
        />
      )}

      {/* controls */}
      <div className="flex justify-between mt-8">

        <button onClick={onHint} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">
          Hint
        </button>

        <div className="space-x-3">

          {session.isPaused ? (
            <button onClick={onResume} className="px-5 py-2 bg-green-600 text-white rounded-lg">
              Resume
            </button>
          ) : (
            <button onClick={onPause} className="px-5 py-2 bg-gray-700 text-white rounded-lg">
              Pause
            </button>
          )}

          <button onClick={onNext} className="px-5 py-2 bg-purple-600 text-white rounded-lg">
            Next
          </button>

        </div>

      </div>

    </div>
  );
}