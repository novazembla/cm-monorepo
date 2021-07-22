import { PartialRecord } from "../types";

export type RoleNames =
  | "administrator"
  | "editor"
  | "contributor"
  | "user"
  | "refresh"
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

export type PermissionsOfUser = "accessAsAuthenticatedUser";

export type PermissionsOfRefresh = "canRefreshAccessToken";

export type PermisionsNames =
  | PermissionsOfAdministrator
  | PermissionsOfEditor
  | PermissionsOfContributor
  | PermissionsOfUser
  | PermissionsOfRefresh;

export interface Role {
  name: RoleNames;
  permissions: PermisionsNames[];
  extends: RoleNames[];
}

export interface Roles {
  roles: PartialRecord<RoleNames, Role>;
  add: (
    name: RoleNames,
    permissions?: PermisionsNames | Array<PermisionsNames>
  ) => void;
  extend: (name: RoleNames, extended: RoleNames | RoleNames[]) => void;
  addPermissions: (
    roleName: RoleNames,
    permissions?: PermisionsNames | Array<PermisionsNames>
  ) => void;
  getOwnPermissions: (roleName: RoleNames) => string[];
  getExtendedPermissions: (roleName: RoleNames) => string[];
}

export const roles: Roles = {
  roles: {},
  add(name: RoleNames, permissions?: PermisionsNames | Array<PermisionsNames>) {
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
    permissions?: PermisionsNames | Array<PermisionsNames>
  ) {
    if (roleName in this.roles) {
      (Array.isArray(permissions)
        ? permissions
        : ([permissions] as PermisionsNames[])
      ).forEach((perm) => {
        if (!(perm in (this.roles[roleName] as Role).permissions))
          (this.roles[roleName] as Role).permissions.push(perm);
      });
    }
  },
  getOwnPermissions(roleName: RoleNames): string[] {
    if (roleName in this.roles) {
      return Array.from(
        // using Array.from(new Set(...)) to filter duplicates out
        new Set((this.roles[roleName] as Role).permissions.values())
      );
    }
    return [];
  },
  getExtendedPermissions(roleName: RoleNames): string[] {
    if (roleName in this.roles) {
      return Array.from(
        // using Array.from(new Set(...)) to filter duplicates out
        new Set(
          [roleName, ...(this.roles[roleName] as Role).extends].reduce(
            (perms: string[], rN: RoleNames) => [
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
roles.add("user", ["accessAsAuthenticatedUser"]);
roles.add("refresh", ["canRefreshAccessToken"]);

roles.extend("administrator", ["editor", "contributor", "user", "refresh"]);
roles.extend("editor", ["contributor", "user", "refresh"]);
roles.extend("contributor", ["user", "refresh"]);
roles.extend("user", "refresh");
export default roles;
