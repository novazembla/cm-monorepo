// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";
import { geocodingGetCenterOfGravity } from "../utils/geocoding";

const { PrismaClient } = Prisma;

const doChores = async () => {
  const apiConfig = getApiConfig();
  let prisma: Prisma.PrismaClient;
  
  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `${apiConfig.db.url}&connection_limit=1`,
        },
      },
    });

    const centerOfGravity = await geocodingGetCenterOfGravity(prisma);

    console.log(centerOfGravity);

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