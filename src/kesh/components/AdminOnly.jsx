import { Navigate } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";

export default function AdminOnly({ children }) {
  const isAdmin = useAdmin();

  if (!isAdmin) {
    return <Navigate to="/feed" replace />;
  }

  return children;
}