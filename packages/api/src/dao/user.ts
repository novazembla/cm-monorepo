import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { User, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import { daoImageSetToDelete } from "./image";
import { daoSharedGenerateFullText } from "./shared";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

const userFullTextKeys = ["email", "firstName", "lastName"];

export const daoUserCheckIsEmailTaken = async (
  email: string,
  id?: number | undefined
): Promise<boolean> => {
  let where: Prisma.UserWhereInput = {
    email,
  };

  if (id && !Number.isNaN(id)) {
    where = {
      ...where,
      id: {
        not: id,
      },
    };
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
      password: await bcrypt.hash(data.password, apiConfig.security.saltRounds),
      fullText: daoSharedGenerateFullText(data, userFullTextKeys),
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    user,
    apiConfig.db.privateJSONDataKeys.user
  );
};

export const daoUserQuery = async (
  where: Prisma.UserWhereInput,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<User[]> => {
  const users: User[] = await prisma.user.findMany({
    where,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    users,
    apiConfig.db.privateJSONDataKeys.user
  );
};

export const daoUserFindFirst = async (
  where: Prisma.UserWhereInput,
  include?: Prisma.UserInclude | undefined
): Promise<User> => {
  const user = await prisma.user.findFirst({
    where,
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    user,
    apiConfig.db.privateJSONDataKeys.user
  );
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
    apiConfig.db.privateJSONDataKeys.user
  );
};

export const daoUserGetByEmail = async (email: string): Promise<User> => {
  const user: User | null = await prisma.user.findUnique({ where: { email } });

  return filteredOutputByBlacklistOrNotFound(
    user,
    apiConfig.db.privateJSONDataKeys.user
  );
};

export const daoUserGetByLogin = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user: User | null = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) return null;

  return filteredOutputByBlacklist(user, apiConfig.db.privateJSONDataKeys.user);
};

export const daoUserUpdate = async (
  id: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  let updateData = data;

  if (data.password)
    updateData = {
      ...data,
      password: await bcrypt.hash(
        data.password as string,
        apiConfig.security.saltRounds
      ),
    };

  const user: User = await prisma.user.update({
    data: {
      ...updateData,
      fullText: daoSharedGenerateFullText(data, userFullTextKeys),
    },
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    user,
    apiConfig.db.privateJSONDataKeys.user
  );
};

export const daoUserDelete = async (id: number): Promise<User> => {
  const user: User = await prisma.user.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    user,
    apiConfig.db.privateJSONDataKeys.user
  );
};

export const daoUserProfileImageDelete = async (
  imageId: number,
  userId: number
): Promise<User> => {
  const user: User = await prisma.user.update({
    data: {
      profileImage: {
        disconnect: true,
      },
    },
    where: {
      id: userId,
    },
  });

  await daoImageSetToDelete(imageId);

  return filteredOutputByBlacklistOrNotFound(
    user,
    apiConfig.db.privateJSONDataKeys.user
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
  daoUserFindFirst,
  daoUserProfileImageDelete,
  daoUserCheckIsEmailTaken,
};
