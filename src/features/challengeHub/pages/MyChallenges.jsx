// pages/MyChallenges.jsx

import React from "react";
import ChallengeGrid from "../components/ChallengeGrid";
import { PageShell, PageHeader, PageSkeleton, PageError, PageEmpty } from "../components/PageStates";

/**
 * Used only when the page is rendered without a `challenges` prop, so it
 * still renders something sensible standalone.
 */
const FALLBACK_CHALLENGES = [
  {
    id: 1,
    title: "Learn React",
    description: "Complete hooks section",
    category: "LEARN",
    subCategory: "PROGRAMMING",
  },
];

/**
 * @typedef {object} Challenge
 * @property {string|number} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} category
 * @property {string} [subCategory]
 */

/**
 * "My Challenges" page: the challenges the current player has started or
 * saved.
 *
 * @param {object} props
 * @param {Challenge[]} [props.challenges] - the player's challenges. Falls back to placeholder data when omitted, so the page still renders standalone.
 * @param {boolean} [props.isLoading=false]
 * @param {Error|string|null} [props.error=null]
 * @param {() => void} [props.onRetry]
 */
export default function MyChallenges({ challenges, isLoading = false, error = null, onRetry }) {
  if (isLoading) return <PageSkeleton blockCount={3} blockClassName="h-28" />;
  if (error) return <PageError title="Couldn't load your challenges" onRetry={onRetry} />;

  const list = challenges ?? FALLBACK_CHALLENGES;
  if (list.length === 0) {
    return (
      <PageEmpty
        title="No challenges yet"
        message="Start a challenge from the catalog and it'll show up here."
      />
    );
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Your progress" title="My Challenges" />
      <div className="mt-8">
        <ChallengeGrid challenges={list} />
      </div>
    </PageShell>
  );
}

