/* eslint-disable no-console */

import Prisma from "@prisma/client";
import bcrypt from "bcrypt";

import { LoremIpsum } from "lorem-ipsum";

const { PrismaClient } = Prisma;

const prisma = new PrismaClient();

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

const getRandomElements = (arr: any[], n: number) => {
  const result = new Array(n);
  let len = arr.length;
  const taken = new Array(len);

  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");

  let count = n;
  while (count) {
    const x = Math.floor(Math.random() * len);
    result[count] = arr[x in taken ? taken[x] : x];

    len -= 1;

    taken[x] = len in taken ? taken[len] : len;
    count -= 1;
  }

  return result.filter((r) => r);
};

const daoSharedGenerateFullText = (
  data: any,
  keys: string[],
  translatedColumns?: string[]
) => {
  const processElement = (fullText: string, key: string) => {
    if (typeof data[key] !== "object") {
      if (data[key]) {
        return `${fullText} ${data[key]}`;
      } else {
        return fullText;
      }
    }

    return `${fullText} ${Object.keys(data[key])
      .map((oKey) => data[key][oKey])
      .join("\n")}`;
  };

  return keys.reduce((fullText: string, key) => {
    if (translatedColumns && translatedColumns.includes(key)) {
      return ["de", "en"].reduce((fT: string, lang: any) => {
        if (`${key}_${lang}` in data) {
          return `${fT} ${data[`${key}_${lang}`]}`;
        }
        return fT;
      }, fullText);
    } else {
      if (!(key in data)) return fullText;

      return processElement(fullText, key);
    }
  }, "");
};

const rndBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// mapOuteBouds [ East/South, North/West ] corners
// const mapOuterBounds = [
//   {
//     lat: 52.291884,
//     lng: 13.00036,
//   },
//   {
//     lat: 52.712187,
//     lng: 13.813182,
//   },
// ];

// const lat = Array(50)
//   .fill(1)
//   .map(
//     () =>
//       rndBetween(
//         mapOuterBounds[1].lat * 1000000,
//         mapOuterBounds[0].lat * 1000000
//       ) / 1000000
//   );
// const lng = Array(50)
//   .fill(1)
//   .map(
//     () =>
//       rndBetween(
//         mapOuterBounds[0].lng * 1000000,
//         mapOuterBounds[1].lng * 1000000
//       ) / 1000000
//   );

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

const categories = [
  ["Begegnungsstätten", "Community Places"],
  [
    "Einrichtungen der kulturellen Bildung",
    "Institution of cultural education",
  ],
  ["Erinnerungsorte", "Memorials"],
  ["Freischaffende Künstler*innen", "Artists"],
  ["Kirchen", "Churches"],
  ["Kultureinrichtungen", "Cultural Institutions"],
  ["Kulturinitiativen", "Cultural Initiatives"],
  ["Kunst im Stadtraum", "Public Art"],
  ["Stiftungen", "Foundations"],
  ["Universitäten/ Hochschulen", "Universities"],
  ["Unternehmen der Kreativwirtschaft", "Creative Industry"],
];

const targetAudience = [
  ["Familien", "Families"],
  ["Kinder/Jugendliche", "Children/Adolecents"],
  ["Menschen mit Beeinträchtigungen", "People with impairments"],
  ["Migrant*innen", "Migrants"],
  ["Senior*innen", "Senior Citizens"],
];

const institutionType = [
  ["Freier Träger", "Non-profit Institution"],
  ["Öffentlicher Träger ", "Public Institution"],
  ["Privatwirtschaftlich", "Private Institution"],
];

const eventCategories = [
  ["Austellungen", "Exhibitions"],
  ["Lesung", "Lecture"],
];

const pages = [
  ["Kultur in Lichtenberg", "Culture Map Project"],
  ["Nutzungshinweise", "How to use"],
  ["Impressum", "Imprint"],
  ["Über uns", "About Us"],
  ["Datenschutz", "Privacy information"],
];

const keywords = [
  "Kunst",
  "Architektur",
  "Tanz",
  "Musik",
  "Lesung",
  "Literatur",
  "Entspannung",
  "Nacht",
  "Tag",
  "Veranstaltung",
  "Party",
  "Eröffnung",
  "Kultur",
  "Gedenken",
];

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
      role: role.toLowerCase(),
      firstName: role,
      lastName: `${i}`,
      emailVerified,
      password: await bcrypt.hash(password, 10),
      fullText: `${email} ${role}`,
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
  const clearDb = true;

  if (clearDb) {
    await prisma.module.deleteMany();
    await prisma.token.deleteMany();
    await prisma.term.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.tourStop.deleteMany();
    await prisma.taxonomy.deleteMany();
    await prisma.image.deleteMany();
    await prisma.event.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.eventDate.deleteMany();
    await prisma.file.deleteMany();
    await prisma.dataImport.deleteMany();
    await prisma.dataExport.deleteMany();
    await prisma.image.deleteMany();
    await prisma.location.deleteMany();
    await prisma.page.deleteMany();
    await prisma.user.deleteMany();
  }

  console.log("Create modules");

  // eslint-disable-next-line no-console

  await Promise.all(
    [
      { key: "location", name: { de: "Kartenpunkte", en: "Locations" } },
      { key: "event", name: { de: "Veranstaltungen", en: "Events" } },
      { key: "tour", name: { de: "Touren", en: "Tours" } },
      { key: "page", name: { de: "Seiten", en: "Pages" } },
      { key: "users", name: { de: "Users", en: "User" } },
      { key: "settings", name: { de: "Einstellungen", en: "Settings" } },
    ].map(async (m) => {
      await prisma.module.upsert({
        create: {
          key: m.key,
          name: m.name,
          withTaxonomies: ["location", "event"].includes(m.key),
        },
        update: {
          key: m.key,
          name: m.name,
          withTaxonomies: ["location", "event"].includes(m.key),
        },
        where: {
          key: m.key,
        },
      });
    })
  );

  await Promise.all(
    ["administrator"].map(async (role) => {
      const user = await upsertUser(`${role}@user.com`, role, role, 1);

      console.log(`Seeded: ${user?.email}`);
      return user;
    })
  );

  const administrator = await prisma.user.findUnique({
    where: {
      email: "administrator@user.com",
    },
  });

  prisma.$disconnect();
}

main()
  .then(async () => {
    console.log("🎉  Seed successful");
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    console.error("\n❌  Seed failed. See above.");
    prisma.$disconnect();
    process.exit(1);
  });
