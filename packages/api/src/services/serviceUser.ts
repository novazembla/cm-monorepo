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

import { daoTokenDeleteMany, TokenTypes } from "../dao/token";

import { AuthPayload } from "../types/auth";
import { ApiError } from "../utils";
import { tokenGenerateAuthTokens } from "./serviceToken";
import { authSendEmailConfirmationEmail } from "./serviceAuth";

export const userRegister = async (
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
      scope,
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

export const userCreate = async (
  data: Prisma.UserCreateInput
): Promise<User> => {
  if (!data.acceptedTerms)
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      "Please accept our terms and conditions"
    );

  const user: User = await daoUserCreate(data);

  return user;
};

export const userUpdate = async (
  scope: string,
  userId: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  const userInDb = await daoUserGetById(userId);

  let newEmailAddress = false;
  let dbData = data;

  if (data.email && data.email !== userInDb.email) {
    newEmailAddress = true;
    dbData = {
      ...dbData,
      emailVerified: false,
    };
    if (await daoUserCheckIsEmailTaken(data.email as string, userId))
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const user: User = await daoUserUpdate(userId, dbData);

  if (newEmailAddress)
    await authSendEmailConfirmationEmail(
      scope as AppScopes,
      user.id,
      user.email
    );

  return user;
};

export const userRead = async (userId: number): Promise<User> => {
  if (Number.isNaN(userId))
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Invalid input data");

  return daoUserGetById(userId);
};

export const userDelete = async (userId: number): Promise<User> => {
  if (Number.isNaN(userId))
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Invalid input data");

  return daoUserDelete(userId);
};

export const userProfileUpdate = async (
  scope: string,
  userId: number,
  data: Prisma.UserUpdateInput
): Promise<User> => userUpdate(scope, userId, data);

export const userProfilePasswordUpdate = async (
  scope: string,
  userId: number,
  password: string
): Promise<User> => {
  const user = await userUpdate(scope, userId, { password });

  if (user && user.id)
    daoTokenDeleteMany({
      userId: user.id,
      type: {
        in: [TokenTypes.RESET_PASSWORD, TokenTypes.ACCESS, TokenTypes.REFRESH],
      },
    });

  return user;
};

export default {
  userCreate,
  userUpdate,
  userRead,
  userRegister,
  userProfileUpdate,
  userProfilePasswordUpdate,
};
