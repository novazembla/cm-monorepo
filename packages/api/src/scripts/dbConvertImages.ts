// !!!! Attention main thread also has to import "sharp" to ensure that the C libraries are always available
import sharp from "sharp";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";
import type {
  ApiImageMetaInformation,
  ApiImageSizeInfo,
  ApiImageFormatInfo,
} from "@culturemap/core";
import { ImageStatus } from "@culturemap/core";

import logger from "../services/serviceLogging";
import { getApiConfig } from "../config";

const createImageSizeWebP = async (
  size: ApiImageFormatInfo,
  nanoid: string,
  imageMeta: any
): Promise<ApiImageSizeInfo> => {
  const apiConfig = getApiConfig();

  return new Promise((resolve, reject) => {
    const newImgFileName = `${nanoid}-${size.width}-${size.height}.webp`;
    const newImgUrl = `${apiConfig.baseUrl.api}/${imageMeta.uploadFolder}/${newImgFileName}`;
    const newImgPath =
      `${apiConfig.baseDir}/${apiConfig.publicDir}/${imageMeta.uploadFolder}/${newImgFileName}`.replace(
        /\/\//g,
        "/"
      );

    sharp(imageMeta.originalFilePath)
      .resize(size.width, size.height, {
        fit: size.crop ? sharp.fit.cover : sharp.fit.inside,
      })
      .toFile(newImgPath)
      .then((resizedImageMeta) => {
        resolve({
          width: resizedImageMeta.width,
          height: resizedImageMeta.height,
          url: newImgUrl,
          isJpg: false,
          isWebP: true,
        });
      })
      .catch((Err) => {
        logger.info(JSON.stringify(Err));
        reject(Err);
      });
  });
};

const createImageSizeJpg = async (
  size: ApiImageFormatInfo,
  nanoid: string,
  imageMeta: any
): Promise<ApiImageSizeInfo> => {
  const apiConfig = getApiConfig();

  return new Promise((resolve, reject) => {
    const newImgFileName = `${nanoid}-${size.width}-${size.height}.jpg`;
    const newImgUrl = `${apiConfig.baseUrl.api}/${imageMeta.uploadFolder}/${newImgFileName}`;
    const newImgPath = `${apiConfig.baseDir}/${apiConfig.publicDir}/${imageMeta.uploadFolder}/${newImgFileName}`;

    sharp(imageMeta.originalFilePath)
      .resize(size.width, size.height, {
        fit: size.crop ? sharp.fit.cover : sharp.fit.inside,
      })
      .jpeg({
        mozjpeg: true,
      })
      .toFile(newImgPath)
      .then((resizedImageMeta) => {
        resolve({
          width: resizedImageMeta.width,
          height: resizedImageMeta.height,
          url: newImgUrl,
          isJpg: true,
          isWebP: false,
        });
      })
      .catch((Err) => {
        logger.info(JSON.stringify(Err));
        reject(Err);
      });
  });
};

const doChores = async () => {
  const apiConfig = getApiConfig();

  // !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
  logger.info("Creating prisma client");
  const { PrismaClient } = Prisma;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `${apiConfig.db.url}${
          apiConfig.db.url.indexOf("?") > -1 ? "&" : "?"
        }connection_limit=1`,
      },
    },
  });

  try {
    let count = 0;
    const images = await prisma.image.findMany({
      where: {
        status: ImageStatus.UPLOADED,
      },
      take: 10,
      select: {
        id: true,
        meta: true,
        nanoid: true,
      },
    });

    if (images && images.length > 0) {
      const ids = images.map((image) => image.id);
      logger.info(`Found ${images.length} to process`);
      await prisma.image.updateMany({
        data: {
          status: ImageStatus.PROCESSING,
        },
        where: {
          id: {
            in: ids,
          },
        },
      });
      await Promise.all(
        images.map(async (image) => {
          if (!image.meta) throw Error("Faulty meta data (no meta)");

          const meta = image.meta as ApiImageMetaInformation;

          if (!meta.originalFilePath)
            throw Error("Faulty meta data (no originalFileName)");

          const originalImageMetaData = await sharp(
            meta.originalFilePath
          ).metadata();

          if (!originalImageMetaData)
            throw Error("Original image meta data read error");

          const processedSizesMetaInfo = await Promise.all(
            apiConfig.imageFormats[meta.imageType].reduce(
              (acc: Promise<ApiImageSizeInfo>[], size: ApiImageFormatInfo) => {
                if (
                  size.width > (originalImageMetaData?.width ?? 0) &&
                  size.height > (originalImageMetaData?.height ?? 0)
                )
                  return acc;

                if (size.asJpg)
                  acc.push(createImageSizeJpg(size, image.nanoid, meta));

                if (size.asWebP)
                  acc.push(createImageSizeWebP(size, image.nanoid, meta));

                return acc;
              },
              [] as Promise<ApiImageSizeInfo>[]
            )
          );

          const newMeta = {
            ...meta,
            availableSizes: {
              original: {
                width: originalImageMetaData.width ?? 0,
                height: originalImageMetaData.height ?? 0,
                url: meta.originalFileUrl,
                isJpg:
                  originalImageMetaData.format === "jpeg" ||
                  originalImageMetaData.format === "jpg",
                isWebP: originalImageMetaData.format === "webp",
              },
              ...processedSizesMetaInfo.reduce(
                (acc: object, sizeMetaInfo: ApiImageSizeInfo) => ({
                  ...acc,
                  [`${sizeMetaInfo.width}-${sizeMetaInfo.height}-${
                    sizeMetaInfo.isWebP ? "webp" : "jpg"
                  }`]: sizeMetaInfo,
                }),
                {}
              ),
            },
          };

          try {
            await prisma.image.update({
              data: {
                meta: newMeta,
                status: ImageStatus.READY,
              },
              where: {
                id: image.id,
              },
            });
          } catch (dbError) {
            logger.error(JSON.stringify(dbError));
          }

          count += 1;
        })
      );
    }

    logger.info(`[WORKER:DbConvertImages]: Processed ${count} images`);
  } catch (Err: any) {
    logger.error(
      `[WORKER:DbConvertImages]: Failed to run worker. ${Err.name} ${Err.message}`
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      logger.info("Prisma client disconnected");
    }
  }
};

doChores()
  .then(async () => {
    logger.info("DbConvertImages: done");
    process.exit(0);
  })
  .catch((err: any) => {
    logger.error(`DbConvertImages: ${err.name} ${err.message}`);
    logger.debug(JSON.stringify(err));
    process.exit(1);
  });
