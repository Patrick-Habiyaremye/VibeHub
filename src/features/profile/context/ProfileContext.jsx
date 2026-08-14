import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useProfileStats } from "../hooks/useProfileStats";
import { useProfileSupportStats } from "../hooks/useProfileSupportStats";
import { useProfileReputation } from "../hooks/useProfileReputation";
import { useProfileMutations } from "../hooks/useProfileMutations";
import { useProfileRealtime } from "../hooks/useProfileRealtime";

import { selectIsOwnProfile } from "../utils/profileSelectors";
import { DEFAULT_PROFILE_TAB } from "../constants/profileTabs.constants";

const ProfileContext = createContext(null);

export function ProfileProvider({
  profileUserId,
  children,
}) {
  const { user } = useAuth();

  const targetUserId =
    profileUserId ?? user?.id ?? null;

  const {
    data,
    loading,
    error,
    reload,
    setData,
  } = useProfile(targetUserId);

  const [activeTab, setActiveTab] =
    useState(DEFAULT_PROFILE_TAB);

  /*
   * Existing profile statistics.
   */
  const baseImpactCards = useProfileStats(
    data?.stats
  );

  /*
   * Canonical creator-support statistics.
   *
   * supportersCount:
   * people supporting the viewed profile.
   *
   * supportingCount:
   * people the viewed profile supports.
   */
  const {
    supportersCount,
    supportingCount,
    loading: supportStatsLoading,
    error: supportStatsError,
    reload: reloadSupportStats,
  } = useProfileSupportStats(targetUserId);

  /*
   * Replace the support values coming from stale
   * profile data with the canonical supporters table
   * values.
   */
  const impactCards = useMemo(() => {
    return baseImpactCards.map((card) => {
      if (card.key === "supporters") {
        return {
          ...card,
          value: supportersCount,
        };
      }

      if (card.key === "supporting") {
        return {
          ...card,
          value: supportingCount,
        };
      }

      return card;
    });
  }, [
    baseImpactCards,
    supportersCount,
    supportingCount,
  ]);

  const reputationDisplay =
    useProfileReputation(data?.reputation);

  const mutations = useProfileMutations({
    userId: targetUserId,
    profile: data?.profile,
    setData,
  });

  /*
   * Existing profile realtime.
   */
  useProfileRealtime(
    targetUserId,
    setData
  );

  const isOwnProfile =
    selectIsOwnProfile(
      user,
      data?.profile
    );

  const value = {
    user,

    userId: targetUserId,

    profile:
      data?.profile ?? null,

    reputation:
      data?.reputation ?? null,

    posts:
      data?.posts ?? [],

    reels:
      data?.reels ?? [],

    impactCards,

    reputationDisplay,

    isOwnProfile,

    loading:
      loading || supportStatsLoading,

    error:
      error || supportStatsError,

    reload,

    reloadSupportStats,

    activeTab,

    setActiveTab,

    mutations,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext);

  if (!ctx) {
    throw new Error(
      "useProfileContext must be used within a ProfileProvider"
    );
  }

  return ctx;
}