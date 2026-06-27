import { PERMISSIONS } from "../constants/permissions";

const adminPermissions = Object.values(PERMISSIONS);

export function can(role, permission) {
  if (role === "admin") {
    return adminPermissions.includes(permission);
  }

  return false;
}