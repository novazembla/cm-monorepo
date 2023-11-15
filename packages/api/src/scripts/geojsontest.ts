// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";
// import { geocodingGetCenterOfGravity } from "../utils/geocoding";

import { PublishStatus } from "@culturemap/core";

const { PrismaClient } = Prisma;

const doChores = async () => {
  const apiConfig = getApiConfig();
  let prisma: Prisma.PrismaClient | undefined;

  try {
    prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
      datasources: {
        db: {
          url: `${apiConfig.db.url}${
            apiConfig.db.url.indexOf("?") > -1 ? "&" : "?"
          }connection_limit=1`,
        },
      },
    });

    let where: any = [
      {
        status: PublishStatus.PUBLISHED,
      },
    ];

    // const centerOfGravity = await geocodingGetCenterOfGravity(prisma);

    // console.log(centerOfGravity);
    const locations = await prisma.location.findMany({
      where: { AND: where },
      select: {
        id: true,
        lat: true,
        lng: true,
        title_de: true,
        title_en: true,
        slug_de: true,
        slug_en: true,
        terms: {
          select: {
            id: true,
            hasReducedVisibility: true,
            color: true,
            colorDark: true,
          },
          take: 1,
        },
        primaryTerms: {
          select: {
            id: true,
            color: true,
            colorDark: true,
          },
          take: 1,
        },
      },
      orderBy: [
        {
          id: "asc",
        },
      ],
    });

    console.log(`Found ${locations?.length ?? 0} locations`);

    const geoJson = {
      type: "FeatureCollection",
      features:
        locations?.length > 0
          ? locations.map((loc: any) => {
              let color = null;
              let termId = null;

              // TODO: this should serve a cached file ...

              // TODO: this should also take multiple primary terms into account ...
              if (loc?.primaryTerms?.length > 0) {
                termId = loc?.primaryTerms[0].id;
                color = loc?.primaryTerms[0].color.trim()
                  ? loc?.primaryTerms[0].color.trim()
                  : "#ddd";
              } else if (loc?.terms?.length > 0) {
                termId = loc?.terms[0].id;
                color = loc?.terms[0].color.trim()
                  ? loc?.terms[0].color.trim()
                  : "#ddd";
              }

              return {
                type: "Feature",
                geometry: {
                  coordinates: [loc?.lng ?? 0.0, loc?.lat ?? 0.0],
                  type: "Point",
                },
                properties: {
                  id: `loc-${loc?.id}`,
                  color: color,
                  primaryTermId: termId,
                  slug: loc.slug_de,
                  title: loc.title_de,
                },
              };
            })
          : [],
    };
    console.log(`Created ${geoJson?.features?.length ?? 0} geo json features`);
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
