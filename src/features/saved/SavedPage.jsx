// features/saved/SavedPage.jsx

import { useState } from "react";
import SavedFilters from "./SavedFilters";
import SavedFeed from "./SavedFeed";

export default function SavedPage() {
  const [contentType, setContentType] =
    useState(null);

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto w-full max-w-6xl">
        {/* ---------------------------------------------
            HEADER
        --------------------------------------------- */}

        <header className="border-b border-white/10 px-4 py-5 sm:px-6">
          <div className="mx-auto w-full max-w-2xl">
            <h1 className="text-xl font-semibold">
              Saved
            </h1>

            <p className="mt-1 text-sm text-white/50">
              Everything you've saved in one place.
            </p>
          </div>
        </header>

        {/* ---------------------------------------------
            FILTERS
        --------------------------------------------- */}

        <div className="border-b border-white/10">
          <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
            <SavedFilters
              active={contentType}
              onChange={setContentType}
            />
          </div>
        </div>

        {/* ---------------------------------------------
            FEED
        --------------------------------------------- */}

        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <SavedFeed
            contentType={contentType}
          />
        </div>
      </div>
    </main>
  );
}