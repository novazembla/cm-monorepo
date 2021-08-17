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

import { daoTokenDeleteMany } from "../dao/token";

import { AuthPayload } from "../types/auth";

import { tokenGenerateAuthTokens } from "./serviceToken";
import { authSendEmailConfirmationEmail } from "./serviceAuth";
import { ApiError, TokenTypes } from "../utils";
import { apiConfig } from "../config";

export const userRegister = async (
  scope: AppScopes,
  data: Prisma.UserCreateInput
): Promise<AuthPayload> => {

  if (!apiConfig.enablePublicRegistration)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Access denied"
    );

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
  scope: AppScopes,
  data: Prisma.UserCreateInput
): Promise<User> => {
  if (!data.acceptedTerms)
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      "Please accept our terms and conditions"
    );

  const user: User = await daoUserCreate(data);

  if (user) await authSendEmailConfirmationEmail(scope, user.id, user.email);

  return user;
};

export const userUpdate = async (
  scope: string,
  id: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  const userInDb = await daoUserGetById(id);

  let newEmailAddress = false;
  let dbData = data;

  if (data.email && data.email !== userInDb.email) {
    newEmailAddress = true;
    dbData = {
      ...dbData,
      emailVerified: false,
    };
    if (await daoUserCheckIsEmailTaken(data.email as string, id))
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const user: User = await daoUserUpdate(id, dbData);

  if (user.userBanned)
    await daoTokenDeleteMany({
      userId: id,
    });

  if (newEmailAddress)
    await authSendEmailConfirmationEmail(
      scope as AppScopes,
      user.id,
      user.email
    );

  return user;
};

export const userRead = async (id: number): Promise<User> => {
  if (Number.isNaN(id))
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Invalid input data");

  return daoUserGetById(id);
};

export const userDelete = async (scope: string, id: number): Promise<User> => {
  if (Number.isNaN(id))
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Invalid input data");

  // TODO: this must more solid,
  // Also other content will have to be taken over by someone else.
  await daoTokenDeleteMany({
    userId: id,
  });

  return daoUserDelete(id);
};

export const userProfileUpdate = async (
  scope: string,
  id: number,
  data: Prisma.UserUpdateInput
): Promise<User> => userUpdate(scope, id, data);

export const userProfilePasswordUpdate = async (
  scope: string,
  id: number,
  password: string
): Promise<User> => {
  const user = await userUpdate(scope, id, { password });

  if (user && user.id)
    daoTokenDeleteMany({
      userId: id,
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
