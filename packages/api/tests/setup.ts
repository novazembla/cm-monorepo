// mono repo jest
// https://medium.com/@NiGhTTraX/making-typescript-monorepos-play-nice-with-other-tools-a8d197fdc680

// https://medium.com/nerd-for-tech/testing-typescript-with-jest-290eaee9479d

// https://medium.com/swlh/jest-with-typescript-446ea996cc68
import dotenv from "dotenv";
import { getPrismaClient } from "../src/db/client";

dotenv.config({ path: "../../.env.test" });

afterAll(() => {
  const prisma = getPrismaClient();
  prisma.$disconnect();
});
