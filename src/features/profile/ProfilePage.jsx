import { Lock, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ProfileProvider, useProfileContext } from "./context/ProfileContext";
import ProfileHeader from "./components/ProfileHeader";
import ProfileBio from "./components/ProfileBio";
import ProfileMoments from "./components/ProfileMoments";
import ProfileStats from "./components/ProfileStats";
import ProfileContent from "./components/ProfileContent";
import ProfileLoading from "./components/ProfileLoading";
import ProfileError from "./components/ProfileError";

function LoginRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-white p-8 rounded-2xl text-center max-w-sm w-full">
        <Lock size={45} className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">Login Required</h2>
        <p className="text-gray-500 mt-2">Please sign in to view this profile.</p>
      </div>
    </div>
  );
}

function ProfilePageInner() {
  const { loading, error, reload, mutations } = useProfileContext();

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} onRetry={reload} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {mutations.actionError && (
        <div className="sticky top-0 z-40 flex items-center justify-center gap-3 bg-red-50 text-red-700 text-sm py-2 px-4">
          <span>{mutations.actionError}</span>
          <button onClick={() => mutations.setActionError(null)} aria-label="Dismiss error">
            <X size={14} />
          </button>
        </div>
      )}

      <ProfileHeader />

      <div className="max-w-6xl mx-auto px-6 mt-20">
        <ProfileBio />
        <ProfileMoments />
        <ProfileStats />
        <ProfileContent />
      </div>
    </div>
  );
}

// profileUserId is optional - defaults to the signed-in user's own profile.
export default function ProfilePage({ profileUserId } = {}) {
  const { user } = useAuth();
  if (!user) return <LoginRequired />;

  return (
    <ProfileProvider profileUserId={profileUserId}>
      <ProfilePageInner />
    </ProfileProvider>
  );
}