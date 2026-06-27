// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute({
//   children,
// }) {

//   const {
//     user,
//     profile,
//   } = useAuth();

//   if (!user) {
//     return (
//       <Navigate
//         to="/login"
//       />
//     );
//   }

//   if (
//     !profile?.username ||
//     !profile?.full_name
//   ) {
//     return (
//       <Navigate
//         to="/onboarding"
//       />
//     );
//   }

//   return children;
// }

// 

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const {
    user,
    profile,
    authLoading,
    profileLoading,
  } = useAuth();

  // 🔥 WAIT FOR EVERYTHING
  if (authLoading || profileLoading) {
    return (
      <div className="text-white p-5">
        Loading...
      </div>
    );
  }

  // 🔴 NOT LOGGED IN
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 🔴 PROFILE COMPLETENESS RULE (SINGLE SOURCE OF TRUTH)
  const isProfileComplete =
    profile?.username?.trim() &&
    profile?.full_name?.trim() &&
    profile?.avatar_url?.trim() &&
    profile?.bio?.trim();

  if (!isProfileComplete) {
    return <Navigate to="/onboarding" />;
  }

  return children;
}