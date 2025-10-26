/* eslint-disable no-console */

import Prisma from "@prisma/client";
import pMap from "p-map";

const { PrismaClient } = Prisma;

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    where: {
      status: {
        notIn: [5, 6],
      },
    },
  });

  async function processEvent(event: Prisma.Event) {
    if ((event?.meta as any)?.event?.event_homepage) {
      console.log(event.id);
      console.log((event?.meta as any)?.event?.event_homepage);

      await prisma.event.update({
        data: {
          socialMedia: {
            ...((event?.socialMedia as any) ?? {}),
            website: (event?.meta as any)?.event?.event_homepage,
          },
        },
        where: {
          id: event.id,
        },
      });
    }
  }

  await pMap(events, processEvent, {
    concurrency: 1,
  });

  prisma.$disconnect();
}

main()
  .then(async () => {
    console.log(
      "🎉  Copied event website information from meta to socialMedia"
    );
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    console.error(
      "\n❌  Failed to copy event website information from meta to socialMedia."
    );
    prisma.$disconnect();
    process.exit(1);
  });
