import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useChallenge } from "../context/ChallengeContext";
import useChallenges from "../hooks/useChallenges";
import ChallengeHubSidebar from "../pages/ChallengeHubSidebar";
import ChallengeHero from "../components/ChallengeHero";
import ChallengeCategory from "../components/ChallengeCategory";
import ChallengeFilters from "../components/ChallengeFilters";
import ChallengeGrid from "../components/ChallengeGrid";
import ChallengeEmpty from "../components/ChallengeEmpty";
import FeaturedChallenge from "../components/FeaturedChallenge";
import DailyChallenge from "../components/DailyChallenge";
import WeeklyChallenge from "../components/WeeklyChallenge";

export default function ChallengeHubContent() {
  const {
    selectedCategory,
    selectedSubCategory,
  } = useChallenge();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState(null);
  const {
    challenges,
    loading,
  } = useChallenges({
    category: selectedCategory,
    subCategory: selectedSubCategory,
    difficulty,
    search,
  });
  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const matchSearch =
        !search ||
        challenge.title
          ?.toLowerCase()
          .includes(search.toLowerCase());
      const matchDifficulty =
        !difficulty ||
        challenge.difficulty === difficulty;
      return matchSearch && matchDifficulty;
    });
  }, [
    challenges,
    search,
    difficulty,
  ]);
  const featured = filteredChallenges[0];
  const daily = filteredChallenges[1];
  const weekly = filteredChallenges[2];
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading challenges...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          <Link
            to="/feed"
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            <span>Back to VibeHub</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl">
        <ChallengeHubSidebar difficulty={difficulty} onDifficultyChange={setDifficulty} />

        <div className="min-w-0 flex-1 space-y-8 p-6">
          <ChallengeHero />
          <ChallengeCategory />
          <ChallengeFilters
            search={search}
            onSearch={setSearch}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
          {featured && (
            <FeaturedChallenge challenge={featured} />
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {daily && (
              <DailyChallenge challenge={daily} />
            )}
            {weekly && (
              <WeeklyChallenge challenge={weekly} />
            )}
          </div>
          {filteredChallenges.length > 0 ? (
            <ChallengeGrid
              challenges={filteredChallenges}
            />
          ) : (
            <ChallengeEmpty />
          )}
        </div>
      </div>
    </div>
  );
}