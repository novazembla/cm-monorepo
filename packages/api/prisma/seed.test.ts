import Prisma from "@prisma/client";
import argon2 from "argon2";

const { PrismaClient } = Prisma;

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log("Running scripts ...");

  const email = "test@test.com";
  const password = "test";

  if (email && password) {
    const admin = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        firstName: "Test",
        lastName: "Administrator",
        password: await argon2.hash(password),
      },
    });

    if (admin) {
      // eslint-disable-next-line no-console
      console.log("Created or updated admin user");
    }
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log("Done!");
  });
