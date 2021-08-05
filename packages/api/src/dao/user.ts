import { hash, verify } from "argon2";
import httpStatus from "http-status";
import { User, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import config from "../config";
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

  return filteredOutputByBlacklistOrNotFound(
    user,
    config.db.privateJSONDataKeys.user
  );
};

export const daoUserQuery = async (
  where: Prisma.UserWhereInput,
  orderBy: Prisma.UserOrderByInput,
  pageIndex: number = 0,
  pageSize: number = config.db.defaultPageSize
): Promise<User[]> => {
  const users: User[] = await prisma.user.findMany({
    where,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, config.db.maxPageSize),
  });

  return filteredOutputByBlacklist(users, config.db.privateJSONDataKeys.user);
};

export const daoUserQueryCount = async (
  where: Prisma.UserWhereInput
): Promise<number> => {
  return prisma.user.count({
    where,
  });
};

export const daoUserGetById = async (id: number): Promise<User> => {
  const user: User | null = await prisma.user.findUnique({ where: { id } });

  return filteredOutputByBlacklistOrNotFound(
    user,
    config.db.privateJSONDataKeys.user
  );
};

export const daoUserGetByEmail = async (email: string): Promise<User> => {
  const user: User | null = await prisma.user.findUnique({ where: { email } });

  return filteredOutputByBlacklistOrNotFound(
    user,
    config.db.privateJSONDataKeys.user
  );
};

export const daoUserGetByLogin = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user: User | null = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verify(user.password, password))) return null;

  return filteredOutputByBlacklist(user, config.db.privateJSONDataKeys.user);
};

export const daoUserUpdate = async (
  userId: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  let updateData = data;

  if (data.password)
    updateData = {
      ...data,
      ...{ password: await hash(data.password as string) },
    };

  const user: User = await prisma.user.update({
    data: updateData,
    where: {
      id: userId,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    user,
    config.db.privateJSONDataKeys.user
  );
};

export const daoUserDelete = async (userId: number): Promise<User> => {
  const user: User = await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    user,
    config.db.privateJSONDataKeys.user
  );
};

export default {
  daoUserCreate,
  daoUserQuery,
  daoUserQueryCount,
  daoUserGetById,
  daoUserGetByLogin,
  daoUserGetByEmail,
  daoUserUpdate,
  daoUserDelete,
  daoUserCheckIsEmailTaken,
};
