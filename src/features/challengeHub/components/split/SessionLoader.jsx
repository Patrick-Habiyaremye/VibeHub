// SessionLoader.jsx

import { Loader2 } from "lucide-react";

export default function SessionLoader({
  loading,
  restoring = false,
}) {
  if (!loading && !restoring) return null;

  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center">

      <Loader2
        size={60}
        className="animate-spin text-purple-600"
      />

      <h2 className="mt-6 text-2xl font-bold">

        {restoring
          ? "Restoring your challenge..."
          : "Loading challenge..."}

      </h2>

      <p className="mt-2 text-gray-500">

        Please wait a moment.

      </p>

    </div>
  );
}