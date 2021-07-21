import type { NexusResolverContext } from "../context";

export const authorizeApiUser = async (
  ctx: NexusResolverContext,
  permissions: string | string[],
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
