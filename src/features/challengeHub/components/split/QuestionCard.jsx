// QuestionCard.jsx

export default function QuestionCard({

  question,

  current,

  total,

}) {

  return (

    <div className="bg-white rounded-2xl shadow p-8">

      <div className="flex justify-between text-sm text-gray-500 mb-6">

        <span>

          Question {current} / {total}

        </span>

        <span>

          {question.category}

        </span>

      </div>

      <h2 className="text-2xl font-bold">

        {question.title}

      </h2>

      {question.description && (

        <p className="mt-4 text-gray-600">

          {question.description}

        </p>

      )}

    </div>

  );

}