// games/mechanics/multipleChoice/renderer.jsx

export function MultipleChoiceRenderer({ state, sendInput, config }) {
  const q = config.questions[state.index];

  return (
    <div>
      <h3>{q.question}</h3>

      {q.options.map((opt) => (
        <button
          key={opt}
          onClick={() =>
            sendInput({ type: "SELECT", payload: { value: opt } })
          }
        >
          {opt}
        </button>
      ))}

<button
 onClick={() =>
   sendInput({
     type:"SUBMIT",
     payload:{
       answer:state.selected
     }
   })
 }
>
 Submit
</button>

      {state.status !== "playing" && (
        <button onClick={() => sendInput({ type: "NEXT" })}>
          Next
        </button>
      )}

      <p>Score: {state.score}</p>
    </div>
  );
}