// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";

const doChores = async () => {
  const apiConfig = getApiConfig();
  let prisma: Prisma.PrismaClient;
  try {
    const { PrismaClient } = Prisma;
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `${apiConfig.db.url}&connection_limit=1`,
        },
      },
    });

    const tables = [
      "user",
      "location",
      "event",
      "eventDate",
      "eventImportLog",
      "token",
      "setting",
      "module",
      "taxonomy",
      "term",
      "tour", 
      "tourStop",
      "page",
      "image",
      "import",
      "dataExport",
      
      "player",
      "file",
    ];

    await Promise.all(
      tables.map(async (name: string) => {
        try {
          console.log(name);
          console.log(await prisma[name].findMany());
        } catch (err) {
          console.log(err);
        }
      })
    );

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
