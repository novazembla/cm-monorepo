import { PartialRecord } from "../types";

export type RoleNames =
  | "administrator"
  | "editor"
  | "contributor"
  | "user"
  | "refresh"
  | "api"
  | "test";

export type PermissionsOfAdministrator =
  | "userCreate"
  | "userRead"
  | "userUpdate"
  | "userDelete";

export type PermissionsOfEditor =
  | "locationRead"
  | "locationCreate"
  | "locationUpdate"
  | "locationDelete"
  | "eventRead"
  | "eventCreate"
  | "eventUpdate"
  | "eventDelete"
  | "tourRead"
  | "tourCreate"
  | "tourUpdate"
  | "tourDelete"
  | "pageRead"
  | "pageCreate"
  | "pageUpdate"
  | "pageDelete"
  | "taxCreate"
  | "taxRead"
  | "taxUpdate"
  | "taxDelete";

export type PermissionsOfContributor =
  | "locationRead"
  | "locationCreate"
  | "locationUpdate"
  | "locationDeleteOwn"
  | "eventRead"
  | "eventCreate"
  | "eventUpdate"
  | "eventDeleteOwn"
  | "tourRead"
  | "tourCreate"
  | "tourUpdate"
  | "tourDeleteOwn"
  | "pageRead"
  | "pageCreate"
  | "pageUpdate"
  | "pageDeleteOwn";

export type PermissionsOfUser =
  | "accessAsAuthenticatedUser"
  | "profileRead"
  | "profileUpdate";

export type PermissionsOfRefresh = "canRefreshAccessToken";

export type PermissionsOfApi = "canConfirmToken";

export type PermissionNames =
  | PermissionsOfAdministrator
  | PermissionsOfEditor
  | PermissionsOfContributor
  | PermissionsOfUser
  | PermissionsOfRefresh
  | PermissionsOfApi;

export interface Role {
  name: RoleNames;
  permissions: PermissionNames[];
  extends: RoleNames[];
}

export interface Roles {
  roles: PartialRecord<RoleNames, Role>;
  add: (
    name: RoleNames,
    permissions?: PermissionNames | PermissionNames[]
  ) => void;
  extend: (name: RoleNames, extended: RoleNames | RoleNames[]) => void;
  addPermissions: (
    roleName: RoleNames,
    permissions?: PermissionNames | PermissionNames[]
  ) => void;
  getOwnPermissions: (roleName: RoleNames) => PermissionNames[];
  getExtendedPermissions: (roleName: RoleNames) => PermissionNames[];
}

export const roles: Roles = {
  roles: {},
  add(name: RoleNames, permissions?: PermissionNames | PermissionNames[]) {
    if (!(name in this.roles)) {
      this.roles[name] = {
        name,
        permissions: [],
        extends: [],
      };
      this.addPermissions(name, permissions);
    }
  },
  extend(roleName: RoleNames, extended: RoleNames | RoleNames[]) {
    if (roleName in this.roles) {
      (Array.isArray(extended)
        ? extended
        : ([extended] as RoleNames[])
      ).forEach((role) => {
        if (
          role in this.roles &&
          !(role in (this.roles[roleName] as Role).extends)
        )
          (this.roles[roleName] as Role).extends.push(role);
      });
    }
  },
  addPermissions(
    roleName: RoleNames,
    permissions?: PermissionNames | PermissionNames[]
  ) {
    if (roleName in this.roles) {
      (Array.isArray(permissions)
        ? permissions
        : ([permissions] as PermissionNames[])
      ).forEach((perm) => {
        if (!(perm in (this.roles[roleName] as Role).permissions))
          (this.roles[roleName] as Role).permissions.push(perm);
      });
    }
  },
  getOwnPermissions(roleName: RoleNames): PermissionNames[] {
    if (roleName in this.roles) {
      return Array.from(
        // using Array.from(new Set(...)) to filter duplicates out
        new Set((this.roles[roleName] as Role).permissions.values())
      );
    }
    return [];
  },
  getExtendedPermissions(roleName: RoleNames): PermissionNames[] {
    if (roleName in this.roles) {
      return Array.from(
        // using Array.from(new Set(...)) to filter duplicates out
        new Set(
          [roleName, ...(this.roles[roleName] as Role).extends].reduce(
            (perms: PermissionNames[], rN: RoleNames) => [
              ...perms,
              ...this.getOwnPermissions(rN),
            ],
            []
          )
        )
      );
    }
    return [];
  },
};
roles.add("administrator", [
  "userCreate",
  "userRead",
  "userUpdate",
  "userDelete",
]);
roles.add("editor", [
  "locationRead",
  "locationCreate",
  "locationUpdate",
  "locationDelete",
  "eventRead",
  "eventCreate",
  "eventUpdate",
  "eventDelete",
  "tourRead",
  "tourCreate",
  "tourUpdate",
  "tourDelete",
  "pageRead",
  "pageCreate",
  "pageUpdate",
  "pageDelete",
  "taxCreate",
  "taxRead",
  "taxUpdate",
  "taxDelete",
]);
roles.add("contributor", [
  "locationRead",
  "locationCreate",
  "locationUpdate",
  "locationDeleteOwn",
  "eventRead",
  "eventCreate",
  "eventUpdate",
  "eventDeleteOwn",
  "tourRead",
  "tourCreate",
  "tourUpdate",
  "tourDeleteOwn",
  "pageRead",
  "pageCreate",
  "pageUpdate",
  "pageDeleteOwn",
]);
roles.add("user", [
  "accessAsAuthenticatedUser",
  "profileRead",
  "profileUpdate",
]);
roles.add("refresh", ["canRefreshAccessToken"]);
roles.add("api", ["canConfirmToken"]);

roles.extend("administrator", [
  "editor",
  "contributor",
  "user",
  "refresh",
  "api",
]);
roles.extend("editor", ["contributor", "user", "refresh", "api"]);
roles.extend("contributor", ["user", "refresh", "api"]);
roles.extend("user", ["refresh", "api"]);
roles.extend("refresh", "api");
export default roles;
