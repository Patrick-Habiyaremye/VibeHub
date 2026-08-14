// AnswerList.jsx

import { useState } from "react";

export default function AnswerList({

  answers,

  onSelect,

  disabled,

}) {

  const [selected, setSelected] =
    useState(null);

  function choose(answer) {

    if (disabled) return;

    setSelected(answer.id);

    onSelect(answer);

  }

  return (

    <div className="grid gap-4 mt-6">

      {answers.map(answer => (

        <button

          key={answer.id}

          disabled={disabled}

          onClick={() => choose(answer)}

          className={`

            p-5

            rounded-xl

            border

            text-left

            transition

            ${selected === answer.id
              ? "bg-purple-100 border-purple-600"
              : "hover:bg-gray-100"}

          `}
        >

          {answer.label}

        </button>

      ))}

    </div>

  );

}