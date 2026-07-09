import { useState } from "react";
import useSupport from "./hooks/useSupport";

export default function SupportButton({ postId }) {
  const { support, loading } = useSupport();
  const [amount, setAmount] = useState(5);

  const handleSupport = async () => {
    if (amount <= 0) return;
    await support(postId, amount);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) =>
          setAmount(Number(e.target.value))
        }
        className="w-16 bg-slate-800 p-1 rounded text-sm"
      />

      <button
        onClick={handleSupport}
        disabled={loading}
        className="
          bg-green-500 text-black
          px-3 py-1 rounded text-sm
          disabled:opacity-50
        "
      >
        {loading ? "..." : "Support 💛"}
      </button>
    </div>
  );
}