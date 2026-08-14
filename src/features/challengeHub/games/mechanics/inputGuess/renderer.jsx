import { ChartBar } from "lucide-react";

export function InputGuessRenderer({ state, sendInput, config }) {
  const q = config.questions[state.index];

  return (
    <div>
      <h3>Guess:</h3>

      {q.clues.slice(0, state.clues).map((c, i) => (
        <p key={i}>{c}</p>
      ))}

<input
 value={state.guess}
 onChange={(e)=>
   sendInput({
     type:"TYPE",
     payload:{
       value:e.target.value
     }
   })
 }
/>

<button
 onClick={() =>
   sendInput({
     type:"SUBMIT",
     payload:{
       answer:state.guess
     }
   })
 }
>
 Submit
</button>

      <button onClick={() => sendInput({ type: "CLUE" })}>
        Reveal Clue
      </button>

      {state.status !== "playing" && (
        <button onClick={() => sendInput({ type: "NEXT" })}>
          Next
        </button>
      )}

      <p>Score: {state.score}</p>
    </div>
  )
}