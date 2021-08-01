import type { PermissionNames } from "@culturemap/core";
import type { NexusResolverContext } from "../context";

export const authorizeApiUser = async (
  ctx: NexusResolverContext,
  permissions: PermissionNames | PermissionNames[],
  doingRefresh = false
) => {
  if (doingRefresh && !ctx.tokenInfo.validRefreshTokenProvided) return false;

  if (
    !doingRefresh &&
    !ctx.tokenInfo.validAccessTokenProvided &&
    ctx.tokenInfo.validRefreshTokenProvided
  )
    return Error("Authentication failed (maybe refresh)");

  if (!ctx.apiUser) return false;

  return !!(
    typeof ctx?.apiUser?.can === "function" && ctx.apiUser.can(permissions)
  );
};

export default authorizeApiUser;
