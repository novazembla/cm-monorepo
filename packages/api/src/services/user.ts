import { User } from "@prisma/client";
import httpStatus from "http-status";

import { createUser } from "../dao/user";
import { AuthPayload } from "../typings/auth";
import { ApiError } from "../utils";
import { generateAuthTokens } from "./token";

// TODO: data shouldn't be any ...
export const registerNewUser = async (data: any): Promise<AuthPayload> => {
  const user: User = await createUser(data);

  if (!user) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User could not be created"
    );
  }

  const authPayload: AuthPayload = await generateAuthTokens(user.id);
  authPayload.user = user;
  return authPayload;
};

export default {
  registerNewUser,
};
