import { User, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { AppScopes, RoleNames } from "@culturemap/core";

import {
  daoUserCreate,
  daoUserDelete,
  daoUserUpdate,
  daoUserGetById,
  daoUserCheckIsEmailTaken,
} from "../dao/user";
import { AuthPayload } from "../types/auth";
import { ApiError } from "../utils";
import { tokenGenerateAuthTokens } from "./serviceToken";
import { authSendEmailConfirmationEmail } from "./serviceAuth";

export const registerNewUser = async (
  scope: AppScopes,
  data: Prisma.UserCreateInput
): Promise<AuthPayload> => {
  if (!data.acceptedTerms)
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      "Please accept our terms and conditions"
    );

  const user: User = await daoUserCreate(data);

  if (user) {
    await authSendEmailConfirmationEmail(scope, user.id, user.email);

    const authPayload: AuthPayload = await tokenGenerateAuthTokens(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      user.role as RoleNames
    );

    authPayload.user = user;

    return authPayload;
  }

  throw new ApiError(
    httpStatus.INTERNAL_SERVER_ERROR,
    "New user could not be created"
  );
};

export const addUser = async (data: Prisma.UserCreateInput): Promise<User> => {
  if (!data.acceptedTerms)
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      "Please accept our terms and conditions"
    );

  const user: User = await daoUserCreate(data);

  return user;
};

export const updateUser = async (
  scope: string,
  userId: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  const userInDb = await daoUserGetById(userId);

  let newEmailAddress = false;

  if (data.email && data.email !== userInDb.email) {
    newEmailAddress = true;
    if (await daoUserCheckIsEmailTaken(data.email as string, userId))
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const user: User = await daoUserUpdate(userId, data);

  if (newEmailAddress)
    await authSendEmailConfirmationEmail(
      scope as AppScopes,
      user.id,
      user.email
    );

  return user;
};

export const deleteUser = async (userId: number): Promise<User> => {
  if (Number.isNaN(userId))
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Invalid input data");

  const user = await daoUserDelete(userId);
  return user;
};

export default {
  addUser,
  updateUser,
  deleteUser,
  registerNewUser,
};
