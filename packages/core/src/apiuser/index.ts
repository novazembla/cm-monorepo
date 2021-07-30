import type { RoleNames, PermisionsNames } from "../roles";
import type { AppScopes } from "../types";

export interface AuthenticatedApiUser {
  id: number;
  roles: RoleNames[];
  permissions: PermisionsNames[];
  scope: AppScopes;
  has(name: RoleNames): boolean;
  can(permissions: PermisionsNames | PermisionsNames[]): boolean;
}

export interface JwtPayloadAuthenticatedApiUser {
  id: number;
  firstName?: string;
  lastName?: string;
  scope?: string;
  roles?: RoleNames[];
  permissions?: string[];
}

export const createAuthenticatedApiUser = (
  id: number,
  roles: RoleNames[],
  permissions: PermisionsNames[],
  scope: AppScopes
): AuthenticatedApiUser => {
  const user: AuthenticatedApiUser = {
    id,
    roles,
    permissions,
    scope,
    has(name: RoleNames) {
      return (
        this.roles && Array.isArray(this.roles) && this.roles.includes(name)
      );
    },
    can(perms: PermisionsNames | PermisionsNames[]) {
      return (Array.isArray(perms) ? perms : [perms]).some((perm) =>
        this.permissions.includes(perm)
      );
    },
  };

  return user;
};
