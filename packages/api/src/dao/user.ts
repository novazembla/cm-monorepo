import { hash, verify } from "argon2";
import httpStatus from "http-status";
import { User, Prisma } from "@prisma/client";

import { ApiError, filteredOutputOrNotFound, filteredOutput } from "../utils";
import { db } from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

export const daoUserCheckIsEmailTaken = async (
  email: string,
  userId?: number | undefined
): Promise<boolean> => {
  const where: any = {
    email,
  };

  if (!Number.isNaN(userId)) {
    where.id = userId;
  }

  const count = await prisma.user.count({
    where,
  });

  return count > 0;
};

export const daoUserCreate = async (
  data: Prisma.UserCreateInput
): Promise<User> => {
  if (await daoUserCheckIsEmailTaken(data.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const user: User = await prisma.user.create({
    data: {
      ...data,
      ...{
        password: await hash(data.password),
      },
    },
  });

  return filteredOutputOrNotFound(user, db.privateJSONDataKeys.user);
};

export const daoUserQuery = async (
  where: Prisma.UserWhereInput,
  page: number = 0,
  pageSize: number = db.defaultPageSize
): Promise<User[]> => {
  const users: User[] = await prisma.user.findMany({
    where,
    skip: page > 1 ? page * pageSize : 0,
    take: pageSize,
  });

  return filteredOutput(users, db.privateJSONDataKeys.user);
};

export const daoUserGetById = async (id: number): Promise<User> => {
  const user: User | null = await prisma.user.findUnique({ where: { id } });

  return filteredOutputOrNotFound(user, db.privateJSONDataKeys.user);
};

export const daoUserGetByEmail = async (email: string): Promise<User> => {
  const user: User | null = await prisma.user.findUnique({ where: { email } });

  return filteredOutputOrNotFound(user, db.privateJSONDataKeys.user);
};

export const daoUserGetByLogin = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user: User | null = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verify(user.password, password))) return null;

  // TODO: filteredOutput(user, db.privateJSONDataKeys.user);
  /*
    [A:API] [NODE] {
    [A:API] [NODE]   id: 6,
    [A:API] [NODE]   email: 'hoh2243@ho.com',
    [A:API] [NODE]   firstName: 'hoho',
    [A:API] [NODE]   lastName: 'hoho',
    [A:API] [NODE]   role: 'user',
    [A:API] [NODE]   emailConfirmed: false,
    [A:API] [NODE]   acceptedTerms: true,
    [A:API] [NODE]   userBanned: false,
    [A:API] [NODE]   createdAt: {}, <!==== WHY IS THAT ?
    [A:API] [NODE]   updatedAt: {}
    [A:API] [NODE] }
  */
  return filteredOutput(user, db.privateJSONDataKeys.user);
};

export const daoUserUpdate = async (
  userId: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  const userTest = await daoUserGetById(userId);
  if (!userTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  if (
    data.email &&
    (await daoUserCheckIsEmailTaken(data.email as string, userId))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const user: User = await prisma.user.update({
    data,
    where: {
      id: userId,
    },
  });

  return filteredOutputOrNotFound(user, db.privateJSONDataKeys.user);
};

export const daoUserDelete = async (userId: number): Promise<User> => {
  const user: User = await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return filteredOutputOrNotFound(user, db.privateJSONDataKeys.user);
};

export default {
  daoUserCreate,
  daoUserQuery,
  daoUserGetById,
  daoUserGetByLogin,
  daoUserGetByEmail,
  daoUserUpdate,
  daoUserDelete,
  daoUserCheckIsEmailTaken,
};
