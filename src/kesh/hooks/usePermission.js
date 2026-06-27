import { useAuth } from "../../context/AuthContext";
import { can } from "../../utils/can";

export default function usePermission(permission) {
  const { profile } = useAuth();

  return can(profile?.role, permission);
}