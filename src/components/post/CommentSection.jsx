import { useState } from "react";

export default function CommentSection() {

  const [comment, setComment] = useState("");

  const handleSubmit = () => {

    const bannedWords = [
      "hate",
      "idiot",
      "stupid"
    ];

    const toxic = bannedWords.some(word =>
      comment.toLowerCase().includes(word)
    );

    if (toxic) {
      alert(
        "Please keep it positive 💛"
      );
      return;
    }

    console.log(comment);

    setComment("");
  };

  return (
    <div className="mt-4">

      <input
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        placeholder="Say something kind 💛"
        className="w-full bg-slate-900 text-white rounded-lg p-3"
      />

      <button
        onClick={handleSubmit}
        className="mt-2 bg-slate-700 px-4 py-2 rounded-lg text-white"
      >
        Comment
      </button>

    </div>
  );
}