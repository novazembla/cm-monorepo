import { Prisma, Token } from "@prisma/client";
import { getPrismaClient } from "../db/client";

import { TokenTypes } from "../utils";

const prisma = getPrismaClient();

export const daoTokenDeleteMany = async (
  where: Prisma.TokenWhereInput
): Promise<number> => {
  const { count } = await prisma.token.deleteMany({
    where,
  });
  return count;
};

export const daoTokenFindFirst = async (
  where: Prisma.TokenWhereInput
): Promise<Token | null> => {
  const token: Token | null = await prisma.token.findFirst({
    where,
  });
  return token;
};

export const daoTokenCreate = async (
  token: string,
  userId: number,
  expires: Date,
  type: string
): Promise<Token> => {
  const tokenInDB = await prisma.token.create({
    data: {
      token,
      userId,
      expires: expires.toISOString(),
      type,
    },
  });

  return tokenInDB;
};

export const daoTokenFindByUserId = async (
  userId: number
): Promise<Token[]> => {
  const tokens = prisma.token.findMany({
    where: {
      userId,
    },
  });
  return tokens;
};

export const daoTokenGetUserIdByToken = async (
  token: string
): Promise<number | void> => {
  const foundToken = await prisma.token.findFirst({
    where: {
      token,
      type: TokenTypes.ACCESS,
    },
  });

  if (foundToken) return foundToken.userId;
};

export const daoTokenDeleteByUserId = async (
  userId: number
): Promise<number> => {
  const count = await daoTokenDeleteMany({ userId });
  return count;
};

export const daoTokenDeleteExpired = async (): Promise<number> => {
  const count = await daoTokenDeleteMany({
    expires: {
      lt: new Date(),
    },
  });
  return count;
};

export default {
  TokenTypes,
  daoTokenDeleteMany,
  daoTokenFindFirst,
  daoTokenCreate,
  daoTokenFindByUserId,
  daoTokenDeleteByUserId,
  daoTokenGetUserIdByToken,
};
