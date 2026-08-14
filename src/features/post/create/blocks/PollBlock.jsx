// blocks/PollBlock.jsx
import React from "react";

export default function PollBlock({ block, onChange, onRemove }) {
  const updateOption = (id, label) => {
    onChange({ options: block.options.map((o) => (o.id === id ? { ...o, label } : o)) });
  };

  const addOption = () => {
    if (block.options.length >= 4) return;
    onChange({ options: [...block.options, { id: `opt_${Date.now()}`, label: "" }] });
  };

  return (
    <div className="relative border border-[#E7DFD2] rounded-2xl p-4 bg-white flex flex-col gap-2">
      <input
        type="text"
        className="border border-[#E7DFD2] rounded-[10px] px-2.5 py-2 text-[15px] outline-none"
        placeholder="Ask a question…"
        value={block.question}
        onChange={(e) => onChange({ question: e.target.value })}
      />
      {block.options.map((opt, i) => (
        <input
          key={opt.id}
          type="text"
          className="border border-[#E7DFD2] rounded-[10px] px-2.5 py-2 text-[15px] outline-none"
          placeholder={`Option ${i + 1}`}
          value={opt.label}
          onChange={(e) => updateOption(opt.id, e.target.value)}
        />
      ))}
      {block.options.length < 4 && (
        <button
          type="button"
          className="self-start border-0 bg-transparent text-[#B5544A] font-semibold text-sm cursor-pointer p-0"
          onClick={addOption}
        >
          + Add option
        </button>
      )}
      <button
        type="button"
        className="absolute top-2 right-2 w-6 h-6 rounded-full border-0 bg-[#E7DFD2] text-[#232027] cursor-pointer flex items-center justify-center text-sm leading-none"
        aria-label="Remove poll block"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}