// routes/AdminRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { user, profile, authLoading } = useAuth();

  if (authLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (profile?.role !== "admin") {
    return <Navigate to="/feed" replace />;
  }

  return children;
}