import { User } from "@prisma/client";
import type { RoleNames, AuthenticatedApiUser } from "@culturemap/core";
import { createAuthenticatedApiUser, roles } from "@culturemap/core";

export const createApiUserFromUser = (
  user: User
): AuthenticatedApiUser | null => {
  if (!user || !user.id) return null;

  try {
    return createAuthenticatedApiUser(
      user.id,
      user.role as RoleNames,
      user.role ? roles.getExtendedRoles(user.role as RoleNames) : [],
      user.role ? roles.getExtendedPermissions(user.role as RoleNames) : [],
      "api"
    );
  } catch (err: any) {}

  return null;
};
