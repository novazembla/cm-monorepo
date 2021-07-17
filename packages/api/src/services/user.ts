import { User, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { RoleNames } from "@culturemap/core";

import { daoUserCreate, daoUserDelete, daoUserUpdate } from "../dao/user";
import { AuthPayload } from "../typings/auth";
import { ApiError } from "../utils";
import { generateAuthTokens } from "./token";

export const registerNewUser = async (
  data: Prisma.UserCreateInput
): Promise<AuthPayload> => {
  if (!data.acceptedTerms)
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      "Please accept our terms and conditions"
    );

  const user: User = await daoUserCreate(data);

  if (!user)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User could not be created"
    );

  const authPayload: AuthPayload = await generateAuthTokens(user.id, "user");
  authPayload.user = user;
  return authPayload;
};

export const addUser = async (
  data: Prisma.UserCreateInput
): Promise<AuthPayload> => {
  if (!data.acceptedTerms)
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      "Please accept our terms and conditions"
    );

  const user: User = await daoUserCreate(data);

  if (!user)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User could not be created"
    );

  const authPayload: AuthPayload = await generateAuthTokens(
    user.id,
    data.role && data.role.length ? (data.role as RoleNames) : "user"
  );
  authPayload.user = user;
  return authPayload;
};

export const updateUser = async (
  userId: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  const user: User = await daoUserUpdate(userId, data);

  if (!user)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User could not be created"
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
