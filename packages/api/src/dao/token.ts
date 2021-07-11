import { Prisma, Token } from "@prisma/client";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

export enum TokenTypes {
  ACCESS = "access",
  REFRESH = "refresh",
  RESET_PASSWORD = "resetPassword",
  VERIFY_EMAIL = "verifyEmail",
}

export const deleteManyTokens = async (
  where: Prisma.TokenWhereInput
): Promise<Prisma.BatchPayload> => {
  const result = await prisma.token.deleteMany({
    where,
  });
  return result;
};

export const findFirstToken = async (
  where: Prisma.TokenWhereInput
): Promise<Token> => {
  const token: Token = await prisma.token.findFirst({
    where,
  });
  return token;
};

export const saveToken = async (
  token: string,
  userId: number,
  expires: Date,
  type: string,
  blacklisted: boolean = false
): Promise<Token> => {
  const tokenInDB = await prisma.token.create({
    data: {
      token,
      userId,
      expires: expires.toISOString(),
      type,
      blacklisted,
    },
  });

  return tokenInDB;
};

export const banTokensOfUser = async (
  userId: number
): Promise<Prisma.BatchPayload> => {
  const result = await prisma.token.updateMany({
    where: {
      userId,
    },
    data: {
      blacklisted: true,
    },
  });
  return result;
};

export const findTokensOfUser = async (userId: number): Promise<Token[]> => {
  const tokens = prisma.token.findMany({
    where: {
      userId,
    },
  });
  return tokens;
};

export default {
  TokenTypes,
  saveToken,
  banTokensOfUser,
  findTokensOfUser,
  deleteManyTokens,
};
