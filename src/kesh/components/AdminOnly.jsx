// components/AdminOnly.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminOnly({ children }) {
  const { profile, profileLoading } = useAuth();

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return <Navigate to="/feed" replace />;
  }

  return children;
}