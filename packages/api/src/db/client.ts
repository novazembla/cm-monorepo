import { PrismaClient } from "@prisma/client";
import { config, utils } from "@culturemap/core";

declare let global: {
  __PRISMA_CLIENT__: PrismaClient | undefined;
};

class PrismaFactory {
  private static instance: PrismaClient | undefined;

  private static createNewInstance(): PrismaClient {
    const url = config.env.DATABASE_URL ?? null;
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
  }

  static getInstance() {
    if (process.env.NODE_ENV === "production") {
      if (!PrismaFactory.instance) {
        PrismaFactory.instance = PrismaFactory.createNewInstance();
      }
      return PrismaFactory.instance;
      // eslint-disable-next-line no-else-return
    } else {
      // PrismaClient is attached to the `global` object in development to prevent
      // exhausting your database connection limit.
      //
      // Learn more:
      // https://pris.ly/d/help/next-js-best-practices
      if (!global.__PRISMA_CLIENT__) {
        global.__PRISMA_CLIENT__ = PrismaFactory.createNewInstance();
      }
      return global.__PRISMA_CLIENT__;
    }
  }
}

export const prismaClient = PrismaFactory.getInstance();

export default prismaClient;
