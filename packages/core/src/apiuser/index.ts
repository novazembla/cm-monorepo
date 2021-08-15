import type { RoleNames, PermissionNames } from "../roles";
import type { AppScopes } from "../types";

export interface AuthenticatedApiUserFunctions {
  is(name: RoleNames): boolean;
  has(names: RoleNames | RoleNames[]): boolean;
  can(permissions: PermissionNames | PermissionNames[]): boolean;
}

export interface AuthenticatedApiUserData {
  id: number;
  role: RoleNames;
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
  role?: string;
  roles?: RoleNames[];
  permissions?: PermissionNames[];
}

const is = (role: RoleNames, name: RoleNames): boolean => name === role;

const has = (roles: RoleNames[], names: RoleNames | RoleNames[]): boolean =>
  (Array.isArray(names) ? names : [names]).some((name) => roles.includes(name));

const can = (
  permissions: PermissionNames[],
  perms: PermissionNames | PermissionNames[]
): boolean =>
  (Array.isArray(perms) ? perms : [perms]).some((perm) =>
    permissions.includes(perm)
  );

export const createAuthenticatedApiUser = (
  id: number,
  role: RoleNames,
  roles: RoleNames[],
  permissions: PermissionNames[],
  scope: AppScopes
): AuthenticatedApiUser => {
  const user: AuthenticatedApiUser = {
    id,
    role,
    roles,
    permissions,
    scope,
    is(name: RoleNames) {
      return is(this.role, name);
    },
    has(names: RoleNames | RoleNames[]) {
      return has(this.roles, names);
    },
    can(perms: PermissionNames | PermissionNames[]) {
      return can(this.permissions, perms);
    },
  };

  return user;
};

export const createAuthenticatedAppUser = (
  appUserData: AuthenticatedAppUserData,
  scope: AppScopes
): AuthenticatedAppUser => {
  const user: AuthenticatedAppUser = {
    id: appUserData.id,
    role: appUserData.role,
    roles: appUserData.roles,
    permissions: appUserData.permissions,
    firstName: appUserData.firstName,
    lastName: appUserData.lastName,
    scope,
    is(name: RoleNames) {
      return is(this.role, name);
    },
    has(names: RoleNames | RoleNames[]) {
      return has(this.roles, names);
    },
    can(perms: PermissionNames | PermissionNames[]) {
      return can(this.permissions, perms);
    },
  };

  return user;
};
