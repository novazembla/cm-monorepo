import Prisma from "@prisma/client";
import bcrypt from "bcrypt";

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
        password: await bcrypt.hash(password, 10),
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
