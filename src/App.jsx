// App.jsx
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import RecoveryRoute from "./routes/RecoveryRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";

import AppLayout from "./layouts/AppLayout";
import MomentsRoot from "./components/moments/MomentsRoot";

/* ---------------- PUBLIC PAGES ---------------- */

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import SignUpSuccess from "./pages/SignUpSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";

/* ---------------- APP PAGES ---------------- */

import Feed from "./features/Feed";
import ProfilePage from "./features/profile/ProfilePage";;
import Messages from "./features/Messages";
import Settings from "./features/Settings";
import SearchPage from "./pages/SearchPage";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover/Discover";
import ReelPage from "./features/reels/ReelPage";
import SmileMomentsPage from "./components/moments/SmileMomentsPage";
import SavedPage from "./features/saved/SavedPage";

/* ---------------- CHALLENGE HUB ---------------- */

import ChallengeHub from "./features/challengeHub/pages/ChallengeHub";
import ChallengePlayPage from "./features/challengeHub/pages/ChallengePlayPage";
import ChallengeDetails from "./features/challengeHub/pages/ChallengeDetails";
import DailyChallenges from "./features/challengeHub/pages/DailyChallenges";
import Leaderboards from "./features/challengeHub/pages/Leaderboards";
import MyChallenges from "./features/challengeHub/pages/MyChallenges";

/* ---------------- ADMIN ---------------- */

import AdminDashboard from "./kesh/pages/Dashboard";
import AdminModeration from "./kesh/pages/Moderation";
import AdminUsers from "./kesh/pages/Users";
import AdminAnalytics from "./kesh/pages/Analytics";
import AdminActivity from "./kesh/pages/Activity";

export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm" element={<ConfirmEmail />} />
      <Route path="/signup-success" element={<SignUpSuccess />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Only reachable via a valid password-reset email link */}
      <Route
        path="/update-password"
        element={
          <RecoveryRoute>
            <UpdatePassword />
          </RecoveryRoute>
        }
      />

      {/* ================= ONBOARDING ================= */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* ================= USER APPLICATION ================= */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {/* MomentsRoot resolves the signed-in user and provides
                Recent/Viewed moments state + the shared story viewer to
                everything under AppLayout — Feed's compact row and
                /moments' full page both read from this same instance, so
                "watched" state stays in sync no matter which one a person
                navigates through. */}
            <MomentsRoot>
              <AppLayout />
            </MomentsRoot>
          </ProtectedRoute>
        }
      >
        <Route index element={<Feed />} />
        <Route path="feed" element={<Feed />} />
        <Route path="moments" element={<SmileMomentsPage />} />
        <Route path="/profiles/:id?" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="messages" element={<Messages />} />
        <Route path="discover" element={<Discover />} />
        <Route path="settings" element={<Settings />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="saved" element={<SavedPage />} />

        <Route
  path="/reel/:reelId"
  element={
    <ProtectedRoute>
      <ReelPage />
    </ProtectedRoute>
  }
/>

        {/* Challenge Hub */}
        <Route path="challenges" element={<ChallengeHub />} />
        <Route path="challenges/:id" element={<ChallengeDetails />} />
        <Route path="challenges/daily" element={<DailyChallenges />} />
        <Route path="challenges/leaderboard" element={<Leaderboards />} />
        <Route path="challenges/me" element={<MyChallenges />} />
        <Route path="/challenge/play/:id" element={<ChallengePlayPage />} />
      </Route>

      {/* ================= ADMIN ================= */}
      {/* AdminRoute already checks both auth state and admin role,
          so it doesn't need to be wrapped in ProtectedRoute too. */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="activity" element={<AdminActivity />} />
      </Route>
    </Routes>
  );
}