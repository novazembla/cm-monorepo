// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";
// import { geocodingGetCenterOfGravity } from "../utils/geocoding";

const { PrismaClient } = Prisma;

const doChores = async () => {
  const apiConfig = getApiConfig();
  let prisma: Prisma.PrismaClient;

  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `${apiConfig.db.url}${
            apiConfig.db.url.indexOf("?") > -1 ? "&" : "?"
          }connection_limit=1`,
        },
      },
    });

    // const centerOfGravity = await geocodingGetCenterOfGravity(prisma);

    // console.log(centerOfGravity);

    console.log(
      await prisma.event.findMany({
        where: {
          lastEventDate: {
            gt: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          },
        },
        orderBy: [
          {
            firstEventDate: "asc",
          },
          {
            title_de: "asc",
          },
        ],
        select: {
          dates: {
            select: {
              date: true,
              begin: true,
              end: true,
            },
          },
        },
      })
    );

    // console.log(await prisma.location.findMany());

    // console.log(await prisma.dataExport.findMany());
  } catch (err: any) {
    console.error(err);
  } finally {
    if (prisma) await prisma.$disconnect();
  }
};

doChores()
  .then(async () => {
    process.exit(0);
  })
  .catch((err: any) => {
    process.exit(1);
  });
