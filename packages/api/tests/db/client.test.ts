import Prisma from "@prisma/client";
import { jest } from "@jest/globals";

import { getPrismaClient, setPrismaClient } from "../../src/db";

const { PrismaClient } = Prisma;

describe("/db/client.ts", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test("client getPrismaClient", () => {
    const client = getPrismaClient();

    expect(client).toBeInstanceOf(PrismaClient);
  });

  test("client getPrismaClient serveral calls return same instance", () => {
    const client = getPrismaClient();
    const client2 = getPrismaClient();

    expect(client === client2).toBeTruthy();
  });

  test("client setPrismaClient returns same instance", () => {
    const client = getPrismaClient();

    setPrismaClient(client);

    const client2 = getPrismaClient();

    expect(client === client2).toBeTruthy();
  });

  test("client getPrismaClient NODE_ENV=production", () => {
    process.env = { ...OLD_ENV, ...{ NODE_ENV: "production" } };
    const client = getPrismaClient();

    expect(client).toBeInstanceOf(PrismaClient);
  });

  test("client getPrismaClient serveral calls return same instance NODE_ENV=production", () => {
    process.env = { ...OLD_ENV, ...{ NODE_ENV: "production" } };

    const client = getPrismaClient();
    const client2 = getPrismaClient();

    expect(client === client2).toBeTruthy();
  });

  test("client setPrismaClient returns same instance NODE_ENV=production", () => {
    process.env = { ...OLD_ENV, ...{ NODE_ENV: "production" } };

    const client = getPrismaClient();

    setPrismaClient(client);

    const client2 = getPrismaClient();

    expect(client === client2).toBeTruthy();
  });
});
