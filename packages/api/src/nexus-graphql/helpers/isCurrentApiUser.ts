import type { NexusResolverContext } from "../context";

export const isCurrentApiUser = async (
  ctx: NexusResolverContext,
  userId: number
) => {
  if (
    !ctx.tokenInfo.validAccessTokenProvided &&
    ctx.tokenInfo.validRefreshTokenProvided
  )
    return Error("Authentication failed (maybe refresh)");

  return !!(ctx.apiUser && ctx.apiUser.id === userId);
};

export default isCurrentApiUser;
