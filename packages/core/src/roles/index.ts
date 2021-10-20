import { PartialRecord, TsEnsureArrayOfAll } from "../types";

export type RoleNames =
  | "administrator"
  | "editor"
  | "contributor"
  | "user"
  | "preview"
  | "refresh"
  | "api"
  | "test";

// !!! Also add new permissions to the constructing arrays on the bottom
export type PermissionsOfAdministrator =
  | "userCreate"
  | "userRead"
  | "userUpdate"
  | "userDelete"
  | "settingRead"
  | "settingUpdate";

// !!! Also add new permissions to the constructing arrays on the bottom
export type PermissionsOfEditor =
  | "locationRead"
  | "locationUpdate"
  | "locationDelete"
  | "eventRead"
  | "eventUpdate"
  | "eventDelete"
  | "tourRead"
  | "tourUpdate"
  | "tourDelete"
  | "pageRead"
  | "pageUpdate"
  | "pageDelete"
  | "taxRead"
  | "taxCreate"
  | "taxUpdate"
  | "taxDelete"
  | "imageDelete";

// !!! Also add new permissions to the constructing arrays on the bottom
export type PermissionsOfContributor =
  | "locationCreate"
  | "locationReadOwn"
  | "locationUpdateOwn"
  | "locationDeleteOwn"
  | "eventCreate"
  | "eventReadOwn"
  | "eventUpdateOwn"
  | "eventDeleteOwn"
  | "tourCreate"
  | "tourReadOwn"
  | "tourUpdateOwn"
  | "tourDeleteOwn"
  | "imageRead"
  | "imageUpdateOwn"
  | "imageCreateOwn"
  | "imageDeleteOwn"
  | "pageCreate"
  | "pageReadOwn"
  | "pageUpdateOwn"
  | "pageDeleteOwn";

// !!! Also add new permissions to the constructing arrays on the bottom
export type PermissionsOfPreview = "canPreview";

// !!! Also add new permissions to the constructing arrays on the bottom
export type PermissionsOfUser =
  | "accessAsAuthenticatedUser"
  | "profileRead"
  | "profileUpdate";

// !!! Also add new permissions to the constructing arrays on the bottom
export type PermissionsOfRefresh = "canRefreshAccessToken";

// !!! Also add new permissions to the constructing arrays on the bottom
export type PermissionsOfApi = "canConfirmToken";

export type PermissionNames =
  | PermissionsOfAdministrator
  | PermissionsOfEditor
  | PermissionsOfContributor
  | PermissionsOfUser
  | PermissionsOfPreview
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
  getExtendedRoles(roleName: RoleNames): RoleNames[];
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
  getExtendedRoles(roleName: RoleNames): RoleNames[] {
    if (roleName in this.roles)
      return [roleName, ...(this.roles[roleName] as Role).extends];

    return [];
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
roles.add(
  "administrator",
  TsEnsureArrayOfAll<PermissionsOfAdministrator>()([
    "userCreate",
    "userRead",
    "userUpdate",
    "userDelete",
    "settingRead",
    "settingUpdate",
  ])
);

roles.add(
  "editor",
  TsEnsureArrayOfAll<PermissionsOfEditor>()([
    "locationRead",
    "locationUpdate",
    "locationDelete",
    "eventRead",
    "eventUpdate",
    "eventDelete",
    "tourRead",
    "tourUpdate",
    "tourDelete",
    "pageRead",
    "pageUpdate",
    "pageDelete",
    "taxRead",
    "taxCreate",
    "taxUpdate",
    "taxDelete",
    "imageDelete",
  ])
);

roles.add(
  "contributor",
  TsEnsureArrayOfAll<PermissionsOfContributor>()([
    "locationReadOwn",
    "locationCreate",
    "locationUpdateOwn",
    "locationDeleteOwn",
    "eventCreate",
    "eventReadOwn",
    "eventUpdateOwn",
    "eventDeleteOwn",
    "tourCreate",
    "tourReadOwn",
    "tourUpdateOwn",
    "tourDeleteOwn",
    "imageRead",
    "imageUpdateOwn",
    "imageCreateOwn",
    "imageDeleteOwn",
    "pageCreate",
    "pageReadOwn",
    "pageUpdateOwn",
    "pageDeleteOwn",
  ])
);
roles.add(
  "user",
  TsEnsureArrayOfAll<PermissionsOfUser>()([
    "accessAsAuthenticatedUser",
    "profileRead",
    "profileUpdate",
  ])
);
roles.add(
  "preview",
  TsEnsureArrayOfAll<PermissionsOfPreview>()(["canPreview"])
);
roles.add(
  "refresh",
  TsEnsureArrayOfAll<PermissionsOfRefresh>()(["canRefreshAccessToken"])
);
roles.add("api", TsEnsureArrayOfAll<PermissionsOfApi>()(["canConfirmToken"]));

roles.extend("administrator", [
  "editor",
  "contributor",
  "user",
  "preview",
  "refresh",
  "api",
]);
roles.extend("editor", ["contributor", "user", "preview", "refresh", "api"]);
roles.extend("contributor", ["user", "preview", "refresh", "api"]);
roles.extend("user", ["preview", "refresh", "api"]);
roles.extend("preview", "api");
roles.extend("refresh", "api");
export default roles;
