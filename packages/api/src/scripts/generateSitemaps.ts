/* eslint-disable no-console */
// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";
import { PublishStatus } from "@culturemap/core";
import { sitemap } from "xast-util-sitemap";
import { toXml } from "xast-util-to-xml";
import { daoSharedGetTranslatedSelectColumns } from "../dao";
import path from "path";
import fs from "fs";

import { getApiConfig } from "../config";

const { PrismaClient } = Prisma;

const SITEMAP_SIZE = 1000;

const doChores = async () => {
  const apiConfig = getApiConfig();
  let prisma: Prisma.PrismaClient | null = null;

  try {
    const folder = `${apiConfig.baseDir}/${apiConfig.publicDir}/sitemap`;

    if (fs.existsSync(folder) === false) {
      fs.mkdirSync(folder);
    }

    console.log("Sitemap(s): starting generation");
    console.log("Sitemap(s): removing old sitemaps");
    const filenames = fs.readdirSync(folder);

    filenames.forEach((file) => {
      if ([".", "..", "index.html"].includes(file)) return;

      fs.unlinkSync(path.join(folder, file));
    });

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `${apiConfig.db.url}${
            apiConfig.db.url.indexOf("?") > -1 ? "&" : "?"
          }connection_limit=1`,
        },
      },
    });

    const sitemapIndexUrls = [];

    let count = await prisma.page.count({
      where: {
        status: PublishStatus.PUBLISHED,
      },
    });

    if (count > 0) {
      let processedCount = 0;
      let lastId = 0;
      let currentFileIndex = 1;

      while (processedCount < count) {
        const items: any[] = await prisma.page.findMany({
          take: SITEMAP_SIZE,
          where: {
            status: PublishStatus.PUBLISHED,
            id: {
              gt: lastId,
            },
          },
          orderBy: [
            {
              id: "asc",
            },
          ],
          select: {
            id: true,
            ...daoSharedGetTranslatedSelectColumns(["slug"]),
          },
        });

        if (items?.length) {
          processedCount += items.length;

          const filename = `sitemap_pages_${currentFileIndex}.xml`;
          const fullpath = `${folder}/${filename}`;

          const tree = sitemap([
            {
              url: `${apiConfig.baseUrl.frontend}`,
              lang: "de",
              alternate: {
                en: `${apiConfig.baseUrl.frontend}/en`,
              },
            },
            ...items.map((item) => ({
              url: `${apiConfig.baseUrl.frontend}/seite/${item.slug_de}`,
              lang: "de",
              alternate: {
                en: `${apiConfig.baseUrl.frontend}/en/page/${item.slug_en}`,
              },
            })),
          ]);

          fs.writeFileSync(fullpath, toXml(tree));

          sitemapIndexUrls.push(`${apiConfig.baseUrl.api}/sitemap/${filename}`);
          currentFileIndex += 1;
          lastId = items[items.length - 1].id;
        } else {
          break;
        }
      }
      console.log(`Sitemap(s): created sitemap(s) for ${count} pages`);
    }

    count = await prisma.location.count({
      where: {
        status: PublishStatus.PUBLISHED,
      },
    });

    if (count > 0) {
      let processedCount = 0;
      let lastId = 0;
      let currentFileIndex = 1;

      while (processedCount < count) {
        const items: any[] = await prisma.location.findMany({
          take: SITEMAP_SIZE,
          where: {
            status: PublishStatus.PUBLISHED,
            id: {
              gt: lastId,
            },
          },
          orderBy: [
            {
              id: "asc",
            },
          ],
          select: {
            id: true,
            ...daoSharedGetTranslatedSelectColumns(["slug"]),
          },
        });

        if (items?.length) {
          processedCount += items.length;

          const filename = `sitemap_locations_${currentFileIndex}.xml`;
          const fullpath = `${folder}/${filename}`;

          const tree = sitemap(
            items.map((item) => ({
              url: `${apiConfig.baseUrl.frontend}/ort/${item.slug_de}`,
              lang: "de",
              alternate: {
                en: `${apiConfig.baseUrl.frontend}/en/location/${item.slug_en}`,
              },
            }))
          );

          fs.writeFileSync(fullpath, toXml(tree));

          sitemapIndexUrls.push(`${apiConfig.baseUrl.api}/sitemap/${filename}`);
          currentFileIndex += 1;
          lastId = items[items.length - 1].id;
        } else {
          break;
        }
      }
      console.log(`Sitemap(s): created sitemap(s) for ${count} locations`);
    }

    count = await prisma.event.count({
      where: {
        status: PublishStatus.PUBLISHED,
      },
    });

    if (count > 0) {
      let processedCount = 0;
      let lastId = 0;
      let currentFileIndex = 1;

      while (processedCount < count) {
        const items: any[] = await prisma.event.findMany({
          take: SITEMAP_SIZE,
          where: {
            status: PublishStatus.PUBLISHED,
            id: {
              gt: lastId,
            },
          },
          orderBy: [
            {
              id: "asc",
            },
          ],
          select: {
            id: true,
            ...daoSharedGetTranslatedSelectColumns(["slug"]),
          },
        });

        if (items?.length) {
          processedCount += items.length;

          const filename = `sitemap_events_${currentFileIndex}.xml`;
          const fullpath = `${folder}/${filename}`;

          const tree = sitemap(
            items.map((item) => ({
              url: `${apiConfig.baseUrl.frontend}/veranstaltung/${item.slug_de}`,
              lang: "de",
              alternate: {
                en: `${apiConfig.baseUrl.frontend}/en/event/${item.slug_en}`,
              },
            }))
          );

          fs.writeFileSync(fullpath, toXml(tree));

          sitemapIndexUrls.push(`${apiConfig.baseUrl.api}/sitemap/${filename}`);
          currentFileIndex += 1;
          lastId = items[items.length - 1].id;
        } else {
          break;
        }
      }
      console.log(`Sitemap(s): created sitemap(s) for ${count} events`);
    }

    count = await prisma.tour.count({
      where: {
        status: PublishStatus.PUBLISHED,
      },
    });

    if (count > 0) {
      let processedCount = 0;
      let lastId = 0;
      let currentFileIndex = 1;

      while (processedCount < count) {
        const items: any[] = await prisma.tour.findMany({
          take: SITEMAP_SIZE,
          where: {
            status: PublishStatus.PUBLISHED,
            id: {
              gt: lastId,
            },
          },
          orderBy: [
            {
              id: "asc",
            },
          ],
          select: {
            id: true,
            ...daoSharedGetTranslatedSelectColumns(["slug"]),
          },
        });

        if (items?.length) {
          processedCount += items.length;

          let filename = `sitemap_tours_${currentFileIndex}.xml`;
          let fullpath = `${folder}/${filename}`;

          let tree = sitemap(
            items.map((item) => ({
              url: `${apiConfig.baseUrl.frontend}/tour/${item.slug_de}`,
              lang: "de",
              alternate: {
                en: `${apiConfig.baseUrl.frontend}/en/tour/${item.slug_en}`,
              },
            }))
          );

          fs.writeFileSync(fullpath, toXml(tree));

          sitemapIndexUrls.push(`${apiConfig.baseUrl.api}/sitemap/${filename}`);

          filename = `sitemap_tours_intro_${currentFileIndex}.xml`;
          fullpath = `${folder}/${filename}`;

          tree = sitemap(
            items.map((item) => ({
              url: `${apiConfig.baseUrl.frontend}/tour/${item.slug_de}/0`,
              lang: "de",
              alternate: {
                en: `${apiConfig.baseUrl.frontend}/en/tour/${item.slug_en}/0`,
              },
            }))
          );

          fs.writeFileSync(fullpath, toXml(tree));

          sitemapIndexUrls.push(`${apiConfig.baseUrl.api}/sitemap/${filename}`);

          currentFileIndex += 1;
          lastId = items[items.length - 1].id;
        } else {
          break;
        }
      }
      console.log(`Sitemap(s): created sitemap(s) for ${count} tours`);
    }

    count = await prisma.tourStop.count({
      where: {
        tour: {
          status: PublishStatus.PUBLISHED,
        },
      },
    });

    if (count > 0) {
      let processedCount = 0;
      let lastId = 0;
      let currentFileIndex = 1;

      while (processedCount < count) {
        const items: any[] = await prisma.tourStop.findMany({
          take: SITEMAP_SIZE,
          where: {
            tour: {
              status: PublishStatus.PUBLISHED,
            },
            id: {
              gt: lastId,
            },
          },
          orderBy: [
            {
              id: "asc",
            },
          ],
          select: {
            id: true,
            number: true,
            tour: {
              select: {
                ...daoSharedGetTranslatedSelectColumns(["slug"]),
              },
            },
          },
        });

        if (items?.length) {
          processedCount += items.length;

          const filename = `sitemap_tours_stops_${currentFileIndex}.xml`;
          const fullpath = `${folder}/${filename}`;

          const tree = sitemap(
            items.map((item) => ({
              url: `${apiConfig.baseUrl.frontend}/tour/${item.tour.slug_de}/${item.number}`,
              lang: "de",
              alternate: {
                en: `${apiConfig.baseUrl.frontend}/en/tour/${item.tour.slug_en}/${item.number}`,
              },
            }))
          );

          fs.writeFileSync(fullpath, toXml(tree));

          sitemapIndexUrls.push(`${apiConfig.baseUrl.api}/sitemap/${filename}`);
          currentFileIndex += 1;
          lastId = items[items.length - 1].id;
        } else {
          break;
        }
      }
      console.log(`Sitemap(s): created sitemap(s) for ${count} tour stops`);
    }

    const sitemapIndexXml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemapIndexUrls
        .map(
          (url: string) =>
            `<sitemap>
          <loc>${url}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </sitemap>`
        )
        .join()}
      </sitemapindex>`;

    console.log("Sitemap(s): writing sitemaps_index.xml");
    fs.writeFileSync(
      `${folder}/sitemap_index.xml`,
      sitemapIndexXml.trim().replace(/\n/g, "")
    );
    console.log("Sitemap(s): generated");
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
    console.error(err);
    process.exit(1);
  });
