import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const {
    user,
    profile,
    authLoading,
    profileLoading,
  } = useAuth();

  if (authLoading || profileLoading) {
    return (
      <div className="text-white p-5">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User exists but has never created a profile
  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  // User has profile but onboarding isn't complete
  if (!profile.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}