import type { PermissionNames } from "@culturemap/core";
import type { NexusResolverContext } from "../context";

export const authorizeApiUser = (
  ctx: NexusResolverContext,
  permissions: PermissionNames | PermissionNames[],
  allowPassThrough: boolean = false,
  doingRefresh?: boolean
) => {
  // seems like this is not an admin request
  // as pastThrough is allowed we return true
  if (
    !!!doingRefresh &&
    allowPassThrough &&
    !ctx.tokenInfo.validRefreshTokenProvided &&
    !ctx.tokenInfo.validAccessTokenProvided
  )
    return true;

  if (!!doingRefresh && !ctx.tokenInfo.validRefreshTokenProvided)
    throw Error("GQL authorization rejected");

  if (
    !!!doingRefresh &&
    !ctx.tokenInfo.validAccessTokenProvided &&
    ctx.tokenInfo.validRefreshTokenProvided
  )
    throw Error("Authentication failed (maybe refresh)");

  if (!ctx.apiUser) throw Error("GQL authorization rejected");

  if (
    !(typeof ctx?.apiUser?.can === "function" && ctx.apiUser.can(permissions))
  )
    throw Error("GQL authorization rejected");

  return true;
};

export default authorizeApiUser;
