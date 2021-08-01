import Prisma from "@prisma/client";
import argon2 from "argon2";

const { PrismaClient } = Prisma;

const prisma = new PrismaClient();

const upsertUser = async (
  email: string,
  role: string,
  password: string,
  i: number,
  emailVerified: boolean = false
) => {
  try {
    const data = {
      email,
      role,
      firstName: role,
      lastName: `${i}`,
      emailVerified,
      password: await argon2.hash(password),
    };

    const user = await prisma.user.upsert({
      where: { email },
      update: data,
      create: data,
      select: {
        id: true,
        email: true,
      },
    });
    return user;
  } catch (err) {
    console.log(err);
  }
};

async function main() {
  // eslint-disable-next-line no-console
  console.log("Running scripts ...");

  await Promise.all(
    ["administrator", "editor", "contributor", "user"].map(async (role) => {
      const user = await upsertUser(`${role}@user.com`, role, role, 1);

      console.log(`Seeded: ${user?.email}`);
      return user;
    })
  );

  await Promise.all(
    [...Array(100).keys()].map(async (i) => {
      const user = await upsertUser(
        `user${i}@user.com`,
        "user",
        "user",
        i + 1,
        i % 2 == 0
      );

      console.log(`Seeded: user${i + 1}@user.com`);
      return user;
    })
  );
}

main()
  .then(async () => {
    console.log("🎉  Seed successful");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    console.error("\n❌  Seed failed. See above.");
    process.exit(1);
  });
