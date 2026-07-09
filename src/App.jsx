import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminOnly from "./kesh/components/AdminOnly";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./kesh/AdminDashboard";

import AppLayout from "./layouts/AppLayout";

/* ---------------- PUBLIC PAGES ---------------- */

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import SignUpSuccess from "./pages/SignUpSuccess";

/* ---------------- APP PAGES ---------------- */

import Feed from "./features/Feed";
import Profile from "./features/ProfilePage2";
import Messages from "./features/Messages";
import Settings from "./features/Settings";
import DailyChallenge from "./components/challenge/DailyChallenge";
import SearchPage from "./pages/SearchPage";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover/Discover";

export default function App() {
  return (
    <Routes>

  {/* Public */}

  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/confirm" element={<ConfirmEmail />} />
  <Route path="/signup-success" element={<SignUpSuccess />} />
  

  {/* Onboarding */}

  <Route
    path="/onboarding"
    element={<Onboarding />}
  />

  {/* User Application */}
  <Route
  path="/"
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Feed />} />
  <Route path="feed" element={<Feed />} />
  <Route path="profile" element={<Profile />} />
  <Route path="messages" element={<Messages />} />
  <Route path="discover" element={<Discover />} />
  <Route path="settings" element={<Settings />} />
  <Route path="search" element={<SearchPage />} />
  <Route path="challenges" element={<DailyChallenge />} />
</Route>

  {/* Admin */}

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminOnly>
        <AdminLayout />
      </AdminOnly>
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />
</Route>

</Routes>
  );
}