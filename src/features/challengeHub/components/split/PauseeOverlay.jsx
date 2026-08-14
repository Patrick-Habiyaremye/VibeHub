// src/features/challengeHub/components/PauseOverlay.jsx

import { PauseCircle, PlayCircle } from "lucide-react";

export default function PauseOverlay({
  open,
  onResume,
  onQuit,
}) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">

        <div className="flex flex-col items-center">

          <PauseCircle
            size={60}
            className="mb-4 text-purple-600"
          />

          <h2 className="text-3xl font-bold">
            Game Paused
          </h2>

          <p className="mt-3 text-center text-gray-600">
            Take a short break.
            Your timer is paused and your
            progress has been preserved.
          </p>

          <div className="mt-8 flex gap-4">

            <button
              onClick={onResume}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-white"
            >
              <PlayCircle size={20} />

              Resume
            </button>

            <button
              onClick={onQuit}
              className="rounded-xl border border-gray-300 px-6 py-3"
            >
              Quit
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}