import { PartialRecord } from "../types";

export type RoleNames =
  | "administrator"
  | "editor"
  | "contributor"
  | "user"
  | "refresh"
  | "test";

export interface Role {
  name: RoleNames;
  permissions: string[];
  extends: RoleNames[];
}

export interface Roles {
  roles: PartialRecord<RoleNames, Role>;
  add: (name: RoleNames, permissions?: string | Array<string>) => void;
  extend: (name: RoleNames, extended: RoleNames) => void;
  addPermissions: (
    roleName: RoleNames,
    permissions?: string | Array<string>
  ) => void;
  getOwnPermissions: (roleName: RoleNames) => string[];
  getExtendedPermissions: (roleName: RoleNames) => string[];
}

export const roles: Roles = {
  roles: {},
  add(name: RoleNames, permissions?: string | Array<string>) {
    if (!(name in this.roles)) {
      this.roles[name] = {
        name,
        permissions: [],
        extends: [],
      };
      this.addPermissions(name, permissions);
    }
  },
  extend(roleName: RoleNames, extended: RoleNames) {
    if (roleName in this.roles && extended in this.roles) {
      (this.roles[roleName] as Role).extends.push(extended);
    }
  },
  addPermissions(roleName: RoleNames, permissions?: string | Array<string>) {
    if (roleName in this.roles && permissions) {
      if (Array.isArray(permissions)) {
        permissions.forEach((permission) =>
          (this.roles[roleName] as Role).permissions.push(permission)
        );
      } else if (typeof permissions === "string")
        (this.roles[roleName] as Role).permissions.push(permissions);
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

roles.extend("administrator", "editor");
roles.extend("administrator", "contributor");
roles.extend("administrator", "user");
roles.extend("administrator", "refresh");

roles.extend("editor", "contributor");
roles.extend("editor", "user");
roles.extend("editor", "refresh");

roles.extend("contributor", "user");
roles.extend("contributor", "refresh");

roles.extend("user", "refresh");
export default roles;
