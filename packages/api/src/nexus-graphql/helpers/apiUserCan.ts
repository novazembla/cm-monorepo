import type { PermissionNames } from "@culturemap/core";
import type { NexusResolverContext } from "../context";

export const apiUserCan = (
  ctx: NexusResolverContext,
  permissions: PermissionNames | PermissionNames[]
) => {
  if (!ctx.tokenInfo.validAccessTokenProvided) return false;

  if (!ctx.apiUser) return false;

  if (
    !(typeof ctx?.apiUser?.can === "function" && ctx.apiUser.can(permissions))
  )
    return false;

  return true;
};

export default apiUserCan;
