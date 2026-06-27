import { useAuth } from "../../context/AuthContext";

export default function useAdmin() {
  const { profile } = useAuth();

  return profile?.role === "admin";
}