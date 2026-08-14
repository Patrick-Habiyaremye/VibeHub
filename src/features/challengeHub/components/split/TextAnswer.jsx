// TextAnswer.jsx

import { useState } from "react";

export default function TextAnswer({

  onSubmit,

  disabled,

  placeholder = "Type your answer..."

}) {

  const [text, setText] =
    useState("");

  function submit() {

    if (!text.trim()) return;

    onSubmit(text.trim());

    setText("");

  }

  return (

    <div className="flex gap-3 mt-8">

      <input

        className="

          flex-1

          rounded-xl

          border

          p-4

          outline-none

          focus:ring-2

          focus:ring-purple-600

        "

        value={text}

        disabled={disabled}

        placeholder={placeholder}

        onChange={(e)=>

          setText(e.target.value)

        }

        onKeyDown={(e)=>{

          if(e.key==="Enter")

            submit();

        }}

      />

      <button

        onClick={submit}

        disabled={disabled}

        className="

          px-6

          rounded-xl

          bg-purple-600

          text-white

        "

      >

        Submit

      </button>

    </div>

  );

}