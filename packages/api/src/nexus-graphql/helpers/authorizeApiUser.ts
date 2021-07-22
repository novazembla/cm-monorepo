import type { PermisionsNames } from "@culturemap/core";
import type { NexusResolverContext } from "../context";

export const authorizeApiUser = async (
  ctx: NexusResolverContext,
  permissions: PermisionsNames | PermisionsNames[],
  doingRefresh = false
) => {
  if (doingRefresh && !ctx.tokenInfo.validRefreshTokenProvided) return false;

  if (
    !doingRefresh &&
    !ctx.tokenInfo.validAccessTokenProvided &&
    ctx.tokenInfo.validRefreshTokenProvided
  )
    return Error("Authentication failed (maybe refresh)");

  return !!(ctx.apiUser && ctx.apiUser.can(permissions));
};

export default authorizeApiUser;
