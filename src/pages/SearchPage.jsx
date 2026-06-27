import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import SearchBar from "../components/search/SearchBar";
import SearchFilters from "../components/search/SearchFilters";
import SearchResults from "../components/search/SearchResults";

import {
  searchEverything,
} from "../api/search";

export default function SearchPage() {

  const [searchParams] =
    useSearchParams();

  const initialQuery =
    searchParams.get("q") || "";

  const [query, setQuery] =
    useState(initialQuery);

  const [results, setResults] =
    useState([]);

  const [suggestions, setSuggestions] =
    useState([]);

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    const timeout =
      setTimeout(async () => {

        if (!query.trim()) {

          setResults([]);
          setSuggestions([]);
          return;

        }

        try {

          setLoading(true);

          const data =
            await searchEverything(query);

          setResults(data);

          setSuggestions(
            data.slice(0, 5)
          );

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);

        }

      }, 400);

    return () =>
      clearTimeout(timeout);

  }, [query]);

  const filteredResults =
    filter === "all"
      ? results
      : results.filter(
          item =>
            item.type === filter
        );

        const saveSearch = (value) => {

  const existing =
    JSON.parse(
      localStorage.getItem(
        "recentSearches"
      ) || "[]"
    );

  const updated = [

    value,

    ...existing.filter(
      item => item !== value
    )

  ].slice(0, 10);

  localStorage.setItem(
    "recentSearches",
    JSON.stringify(updated)
  );

};

if(query.trim()){

  saveSearch(query);

}

const recentSearches =
  JSON.parse(
    localStorage.getItem(
      "recentSearches"
    ) || "[]"
  );

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
      "
    >

      <div
        className="
          max-w-5xl
          mx-auto
          px-4
          py-8
        "
      >

        <h1
          className="
            text-3xl
            font-bold
            mb-6
          "
        >
          Discover
        </h1>

        <SearchBar
          value={query}
          onChange={setQuery}
          suggestions={suggestions}
          onSelect={(item) => {

            if (
              item.type === "people"
            ) {

              window.location.href =
                `/profile/${item.id}`;

            }

          }}
        />

        <SearchFilters
          selected={filter}
          onChange={setFilter}
        />

        {query && (

          <div
            className="
              text-slate-400
              text-sm
              mb-4
            "
          >
            {filteredResults.length}
            {" "}
            results found
          </div>

        )}

        {loading && (

          <div
            className="
              space-y-4
            "
          >
            {[...Array(4)].map(
              (_, i) => (

                <div
                  key={i}
                  className="
                    h-24
                    rounded-xl
                    bg-slate-800
                    animate-pulse
                  "
                />
              )
            )}

          </div>

        )}

        {!loading && (

          <SearchResults
            results={filteredResults}
            filter={filter}
          />

        )}

      </div>

    </div>

  );

}