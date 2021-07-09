import Prisma from "@prisma/client";
import { utils } from "@culturemap/core";

const { PrismaClient } = Prisma;

declare let global: {
  __PRISMA_CLIENT__: Prisma.PrismaClient | undefined;
};

let instance: Prisma.PrismaClient | undefined;

const createNewInstance = function (): Prisma.PrismaClient {
  const url = process.env.DATABASE_URL ?? null;
  utils.Asserts.nonEmptyString(
    url,
    `Cannot create prisma client instance, missing env variable DATABASE_URL.`
  );
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
};

export const setPrismaClient = function (pClient: Prisma.PrismaClient) {
  if (process.env.NODE_ENV === "production") {
    instance = pClient;
  } else {
    global.__PRISMA_CLIENT__ = pClient;
  }
};

export const getPrismaClient = function (): Prisma.PrismaClient {
  if (process.env.NODE_ENV === "production") {
    if (!instance) {
      instance = createNewInstance();
    }
    return instance;
    // eslint-disable-next-line no-else-return
  } else {
    // PrismaClient is attached to the `global` object in development to prevent
    // exhausting your database connection limit.
    //
    // Learn more:
    // https://pris.ly/d/help/next-js-best-practices
    if (!global.__PRISMA_CLIENT__) {
      global.__PRISMA_CLIENT__ = createNewInstance();
    }
    return global.__PRISMA_CLIENT__;
  }
};

export default {
  setPrismaClient,
  getPrismaClient,
};
