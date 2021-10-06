import { parentPort } from "worker_threads";
import { unlinkSync } from "fs";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";
import { ImageStatus } from "@culturemap/core";

// https://github.com/breejs/bree#long-running-jobs
// Or use https://threads.js.org/usage for a queing experience .. .
// if (parentPort)
//   parentPort.once("message", (message) => {
//     //
//     // we could make it `Number.MAX_VALUE` here to speed cancellation up
//     // <https://github.com/sindresorhus/p-map/issues/28>
//     //
//     if (message === "cancel") isCancelled = true;
//   });

const postMessage = (msg: string) => {
  if (parentPort) parentPort.postMessage(msg);
  // eslint-disable-next-line no-console
  else console.log(msg);
};

const doChores = async () => {
  const apiConfig = getApiConfig();

  const { PrismaClient } = Prisma;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `${apiConfig.db.url}&connection_limit=1`,
      },
    },
  });

  try {
    const { count } = await prisma.token.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    postMessage(`[WORKER:dbHousekeeping]: Deleted ${count} expired token`);

    const images = await prisma.image.findMany({
      where: {
        status: ImageStatus.DELETED,
      },
      take: 10,
      select: {
        id: true,
        meta: true,
      },
    });

    if (images && images.length > 0) {
      await Promise.all(
        images.map(async (image) => {
          if (image?.meta) {
            const meta = image?.meta as any;
            try {
              const uploadPath = `${apiConfig.baseDir}/${apiConfig.publicDir}${meta.uploadFolder}/`;

              Object.keys(meta.availableSizes).forEach((size) => {
                const fileName = meta.availableSizes[size].url.split("/").pop();
                unlinkSync(`${uploadPath}${fileName}`);
              });
              await prisma.image.delete({
                where: {
                  id: image.id,
                },
              });
            } catch (err: any) {
              postMessage(`Error ${err.message}`);
            }
          }
        })
      );
    }
    postMessage(
      `[WORKER:dbHousekeeping]: Removed ${images.length} image(s) and their files`
    );

    // const models = await prisma.arModel.findMany({
    //   where: {
    //     status: ArModelStatusEnum.DELETED,
    //   },
    //   take: 10,
    //   select: {
    //     id: true,
    //     meta: true,
    //   },
    // });

    // if (models && models.length > 0) {
    //   await Promise.all(
    //     models.map(async (model) => {
    //       if (model?.meta) {
    //         const meta = model?.meta as any;
    //         try {
    //           unlinkSync(`${meta.originalFilePath}`);

    //           await prisma.arModel.delete({
    //             where: {
    //               id: model.id,
    //             },
    //           });
    //         } catch (err: any) {
    //           postMessage(`Error ${err.message}`);
    //         }
    //       }
    //     })
    //   );
    // }
    // postMessage(
    //   `[WORKER:dbHousekeeping]: Removed ${models.length} models(s) and their files`
    // );
  } catch (Err: any) {
    postMessage(
      `[WORKER:dbHousekeeping]: Failed to run worker. ${Err.name} ${Err.message}`
    );
  } finally {
    if (prisma) await prisma.$disconnect();
  }
};

doChores()
  .then(async () => {
    if (parentPort) postMessage("done");
    else process.exit(0);
  })
  .catch((Err) => {
    postMessage(JSON.stringify(Err));
    process.exit(1);
  });
