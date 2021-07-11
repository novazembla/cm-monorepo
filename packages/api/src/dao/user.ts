import { hash, verify } from "argon2";
import httpStatus from "http-status";
import { User } from "@prisma/client";

import { ApiError, restrictJSONOutput } from "../utils";
import { db } from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

export const checkIsEmailTaken = async (
  email: string,
  userId: number
): Promise<User> => {
  const where: any = {
    email,
  };

  if (userId > 0) {
    where.userId = userId;
  }

  const user: User = await prisma.user.findUnique({
    where,
  });

  return user;
};

export const createUser = async (userBody: any): Promise<User> => {
  if (await checkIsEmailTaken(userBody.email, 0)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  // TODO: this needs to better typed
  const user: User = await prisma.user.create({
    data: {
      email: userBody.email,
      firstName: userBody.firstName,
      lastName: userBody.lastName,
      password: await hash(userBody.password),
    },
  });

  return restrictJSONOutput(user, db.privateJSONDataKeys.user);
};

export const queryUsers = async ({ page, pageSize }): Promise<User[]> => {
  const users: User[] = await prisma.user.findMany({
    skip: page > 1 ? page * pageSize : 0,
    take: pageSize,
  });

  return restrictJSONOutput(users, db.privateJSONDataKeys.user);
};

export const getUserById = async (id: number): Promise<User> => {
  const user: User = await prisma.user.findUnique({ where: { id } });

  return restrictJSONOutput(user, db.privateJSONDataKeys.user);
};

export const getUserByEmail = async (email: string): Promise<User> => {
  const user: User = await prisma.user.findUnique({ where: { email } });

  return restrictJSONOutput(user, db.privateJSONDataKeys.user);
};

export const getUserByLogin = async (
  email: string,
  password: string
): Promise<User> => {
  const user: User = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verify(user.password, password))) return null;

  return restrictJSONOutput(user, db.privateJSONDataKeys.user);
};

// TODO: how to type updateBody
export const updateUserById = async (
  userId: number,
  updateBody: any
): Promise<User> => {
  const userTest = await getUserById(userId);
  if (!userTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  if (updateBody.email && (await checkIsEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const user: User = await prisma.user.update({
    data: updateBody,
    where: {
      id: userId,
    },
  });

  return restrictJSONOutput(user, db.privateJSONDataKeys.user);
};

export const deleteUserById = async (userId: number): Promise<User> => {
  const user: User = await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }

  return restrictJSONOutput(user, db.privateJSONDataKeys.user);
};

export default {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  getUserByLogin,
  updateUserById,
  deleteUserById,
};
