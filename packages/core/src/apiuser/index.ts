import type { RoleNames, PermissionNames } from "../roles";
import type { AppScopes } from "../types";

export interface AuthenticatedApiUserFunctions {
  has(name: RoleNames): boolean;
  can(permissions: PermissionNames | PermissionNames[]): boolean;
}

export interface AuthenticatedApiUserData {
  id: number;
  roles: RoleNames[];
  permissions: PermissionNames[];
  scope: AppScopes;
}

export interface AuthenticatedAppUserData extends AuthenticatedApiUserData {
  firstName: string;
  lastName: string;
}

export interface AuthenticatedAppUser
  extends AuthenticatedAppUserData,
    AuthenticatedApiUserFunctions {
  firstName: string;
  lastName: string;
}

export interface AuthenticatedApiUser
  extends AuthenticatedApiUserData,
    AuthenticatedApiUserFunctions {}

export interface JwtPayloadAuthenticatedApiUser {
  id: number;
  firstName?: string;
  lastName?: string;
  scope?: string;
  roles?: RoleNames[];
  permissions?: PermissionNames[];
}

const has = (roles: RoleNames[], name: RoleNames) =>
  roles && Array.isArray(roles) && roles.includes(name);

const can = (
  permissions: PermissionNames[],
  perms: PermissionNames | PermissionNames[]
) =>
  (Array.isArray(perms) ? perms : [perms]).some((perm) =>
    permissions.includes(perm)
  );

export const createAuthenticatedApiUser = (
  id: number,
  roles: RoleNames[],
  permissions: PermissionNames[],
  scope: AppScopes
): AuthenticatedApiUser => {
  const user: AuthenticatedApiUser = {
    id,
    roles,
    permissions,
    scope,
    has(name: RoleNames) {
      return has(this.roles, name);
    },
    can(perms: PermissionNames | PermissionNames[]) {
      return can(this.permissions, perms);
    },
  };

  return user;
};

export const createAuthenticatedAppUser = (
  appUser: AuthenticatedAppUserData,
  scope: AppScopes
): AuthenticatedAppUser => {
  const user: AuthenticatedAppUser = {
    id: appUser.id,
    roles: appUser.roles,
    permissions: appUser.permissions,
    firstName: appUser.firstName,
    lastName: appUser.lastName,
    scope,
    has(name: RoleNames) {
      return has(this.roles, name);
    },
    can(perms: PermissionNames | PermissionNames[]) {
      return can(this.permissions, perms);
    },
  };

  return user;
};
