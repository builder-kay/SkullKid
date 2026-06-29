import type { Role } from "@prisma/client";
import { forbidden } from "@/lib/auth";

export function hasRole(userRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole);
}

export function assertRole(userRole: Role, allowedRoles: Role[]) {
  if (!hasRole(userRole, allowedRoles)) {
    return forbidden();
  }
  return null;
}
