// components/ChallengeHubSidebar.jsx

import React, { useEffect, useState } from "react";
import { useChallenge } from "../context/ChallengeContext";

/**
 * Fallback category tree used only when no `categories` prop is passed,
 * so the sidebar still renders standalone. Shape: each category has an
 * id, display name, icon, and its own subcategories.
 */
const FALLBACK_CATEGORIES = [
  {
    id: "PLAY",
    name: "Play",
    icon: "🎮",
    subCategories: [
      { id: "QUIZZES", name: "Quizzes" },
      { id: "PUZZLES", name: "Puzzles" },
      { id: "TRIVIA", name: "Trivia" },
    ],
  },
  {
    id: "LEARN",
    name: "Learn",
    icon: "📚",
    subCategories: [
      { id: "PROGRAMMING", name: "Programming" },
      { id: "DESIGN", name: "Design" },
      { id: "LANGUAGES", name: "Languages" },
    ],
  },
  {
    id: "CREATE",
    name: "Create",
    icon: "🎨",
    subCategories: [
      { id: "WRITING", name: "Writing" },
      { id: "ART", name: "Art" },
      { id: "MUSIC", name: "Music" },
    ],
  },
  {
    id: "FITNESS",
    name: "Fitness",
    icon: "💪",
    subCategories: [
      { id: "WORKOUTS", name: "Workouts" },
      { id: "MINDFULNESS", name: "Mindfulness" },
    ],
  },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

/**
 * @typedef {object} SidebarCategory
 * @property {string} id
 * @property {string} name
 * @property {string} [icon]
 * @property {{ id: string, name: string }[]} [subCategories]
 * @property {number} [count] - optional challenge count badge.
 */

/**
 * A single category row with an expandable subcategory list.
 * @param {object} props
 * @param {SidebarCategory} props.category
 * @param {boolean} props.isExpanded
 * @param {boolean} props.isActive
 * @param {string|null} props.activeSubCategoryId
 * @param {boolean} props.collapsed - icon-only mode
 * @param {() => void} props.onToggleExpand
 * @param {(subId: string|null) => void} props.onSelectSubCategory
 */
function CategoryItem({
  category,
  isExpanded,
  isActive,
  activeSubCategoryId,
  collapsed,
  onToggleExpand,
  onSelectSubCategory,
}) {
  const hasSubCategories = category.subCategories?.length > 0;

  return (
    <li>
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={hasSubCategories ? isExpanded : undefined}
        aria-current={isActive ? "true" : undefined}
        title={collapsed ? category.name : undefined}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
          isActive ? "bg-amber-400/15 text-amber-300" : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition ${
            isActive ? "bg-amber-400/20" : "bg-white/5 group-hover:bg-white/10"
          }`}
        >
          {category.icon ?? "📁"}
        </span>

        {!collapsed && (
          <>
            <span className="flex-1 truncate">{category.name}</span>

            {typeof category.count === "number" && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">{category.count}</span>
            )}

            {hasSubCategories && (
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </>
        )}
      </button>

      {!collapsed && hasSubCategories && (
        <div
          className="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <ul className="min-h-0 space-y-1 py-1 pl-11 pr-1">
            {category.subCategories.map((sub) => {
              const subActive = isActive && activeSubCategoryId === sub.id;
              return (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSubCategory(subActive ? null : sub.id)}
                    aria-current={subActive ? "true" : undefined}
                    className={`w-full truncate rounded-lg px-3 py-1.5 text-left text-sm transition ${
                      subActive ? "bg-amber-400/10 text-amber-300" : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {sub.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}

/**
 * ChallengeHub's own sidebar: category/subcategory navigation (synced with
 * ChallengeContext) plus difficulty quick filters. Deliberately distinct
 * from the app's global sidebar — this one lives inside the ChallengeHub
 * page, collapses to icon-only, and opens as a slide-in drawer on mobile.
 *
 * @param {object} props
 * @param {SidebarCategory[]} [props.categories] - falls back to placeholder categories when omitted.
 * @param {string|null} [props.difficulty] - controlled from the parent, same state ChallengeFilters uses.
 * @param {(difficulty: string|null) => void} [props.onDifficultyChange]
 * @param {() => void} [props.onReset] - called when "Clear filters" is pressed, in addition to the sidebar's own reset.
 */
export default function ChallengeHubSidebar({ categories = FALLBACK_CATEGORIES, difficulty = null, onDifficultyChange, onReset }) {
  const { selectedCategory, selectedSubCategory, setSelectedCategory, setSelectedSubCategory } = useChallenge();

  const [expandedCategoryId, setExpandedCategoryId] = useState(selectedCategory ?? null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer on Escape, so it behaves like a proper dialog.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const hasActiveFilters = Boolean(selectedCategory || selectedSubCategory || difficulty);

  function handleToggleExpand(categoryId) {
    const isSameCategory = selectedCategory === categoryId;
    setExpandedCategoryId((current) => (current === categoryId ? null : categoryId));

    // Selecting a category (not just expanding it) is the primary action —
    // clicking a collapsed category both expands it and filters by it.
    if (!isSameCategory) {
      setSelectedCategory?.(categoryId);
      setSelectedSubCategory?.(null);
    }
  }

  function handleSelectSubCategory(categoryId, subCategoryId) {
    setSelectedCategory?.(categoryId);
    setSelectedSubCategory?.(subCategoryId);
  }

  function handleClearFilters() {
    setSelectedCategory?.(null);
    setSelectedSubCategory?.(null);
    onDifficultyChange?.(null);
    onReset?.();
  }

  const content = (
    <div className={`flex h-full flex-col ${collapsed ? "w-20" : "w-64"} transition-[width] duration-200`}>
      <div className="flex items-center justify-between px-3 py-4">
        {!collapsed && <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Browse</p>}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white md:inline-flex"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}>
            <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isExpanded={expandedCategoryId === category.id}
              isActive={selectedCategory === category.id}
              activeSubCategoryId={selectedSubCategory}
              collapsed={collapsed}
              onToggleExpand={() => handleToggleExpand(category.id)}
              onSelectSubCategory={(subId) => handleSelectSubCategory(category.id, subId)}
            />
          ))}
        </ul>
      </nav>

      {!collapsed && (
        <div className="space-y-3 border-t border-white/10 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onDifficultyChange?.(active ? null : d.id)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "border-amber-400/40 bg-amber-400/15 text-amber-300"
                      : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full rounded-lg border border-white/10 py-2 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop / tablet: static sidebar. Sticky + h-screen so the inner
          h-full flex layout (and the category list's overflow-y-auto)
          actually has a height to work against once real content scrolls
          past it. */}
      <aside className="hidden shrink-0 border-r border-white/10 bg-slate-950 md:sticky md:top-0 md:block md:h-screen">
        {content}
      </aside>

      {/* Mobile: floating toggle + slide-in drawer */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open browse menu"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg shadow-black/40 md:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close browse menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 border-r border-white/10 bg-slate-950 shadow-2xl">{content}</div>
        </div>
      )}
    </>
  );
}