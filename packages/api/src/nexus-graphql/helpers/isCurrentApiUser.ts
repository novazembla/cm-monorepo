import type { NexusResolverContext } from "../context";

export const isCurrentApiUser = (ctx: NexusResolverContext, userId: number) => {
  if (
    !ctx.tokenInfo.validAccessTokenProvided &&
    ctx.tokenInfo.validRefreshTokenProvided
  )
    return Error("Authentication failed (maybe refresh)");

  console.log(ctx.apiUser.id);
  console.log(userId);
  if (!(ctx.apiUser && ctx.apiUser.id === userId))
    throw Error("GQL authorization rejected");

  return true;
};

export default isCurrentApiUser;
