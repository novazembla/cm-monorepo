import { PartialRecord } from "../types";

export type RoleNames = "administrator" | "editor" | "contributor";

export interface Role {
  name: RoleNames;
  permissions: Set<string>;
}

export interface Roles {
  roles: PartialRecord<RoleNames, Role>;
  add: (name: string, permissions?: string | Array<string>) => void;
  addPermissions: (
    roleName: string,
    permissions: string | Array<string>
  ) => void;
}

export const roles: Roles = {
  roles: {},
  add(name: string, permissions: string | Array<string>) {
    if (!(name in this.roles)) {
      this.roles[name] = {
        name,
        permissions: new Set(),
      };
    }

    this.addPermissions(name, permissions);
  },
  addPermissions(roleName: string, permissions: string | Array<string>) {
    if (roleName in this.roles && permissions) {
      if (Array.isArray(permissions)) {
        permissions.forEach((permission) =>
          this.roles[roleName].permissions.add(permission)
        );
      } else if (typeof permissions === "string")
        this.roles[roleName].permissions.add(permissions);
    }
  },
};
roles.add("administrator");
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

export default roles;
