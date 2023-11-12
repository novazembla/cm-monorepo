/* eslint-disable no-console */

import Prisma from "@prisma/client";
import pMap from "p-map";

import { LoremIpsum } from "lorem-ipsum";
import type { Address } from "../../types";

import {
  geocodingGetAddressCandidates,
  geocodingGetBestMatchingLocation,
} from "../../utils/geocoding";
import { getApiConfig } from "../../config";

const apiConfig = getApiConfig();

const { PrismaClient } = Prisma;

const prisma = new PrismaClient();

const awaitTimeout = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

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

// const slugify = (text: string) => {
//   return text
//     .toString()
//     .toLowerCase()
//     .replace(/\s+/g, "-") // Replace spaces with -
//     .replace(/[^\w-]+/g, "") // Remove all non-word chars
//     .replace(/--+/g, "-") // Replace multiple - with single -
//     .replace(/^-+/, "") // Trim - from start of text
//     .replace(/-+$/, ""); // Trim - from end of text
// };

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
const addresses: Address[] = [
  {
    co: "C/O Peter Pan",
    street1: "Hentigstraße",
    street2: "",
    houseNumber: "24a",
    postCode: "10318",
    city: "Berlin",
  },
  {
    co: "",
    street1: "Gundelfinger Straße",
    street2: "",
    houseNumber: "81",
    postCode: "10318",
    city: "Berlin",
  },
  {
    co: "",
    street1: "John-Sieg-Straße",
    street2: "",
    houseNumber: "1-3",
    postCode: "10365",
    city: "Berlin",
  },
  {
    co: "",
    street1: "Dönhoffstraße",
    street2: "",
    houseNumber: "29",
    postCode: "10318",
    city: "Berlin",
  },
  {
    co: "",
    street1: "Hirschberger Straße",
    street2: "",
    houseNumber: "2",
    postCode: "10317",
    city: "Berlin",
  },
  {
    co: "C/O Peter Pan",
    street1: "Hentigstraße",
    street2: "",
    houseNumber: "24a",
    postCode: "10318",
    city: "Berlin",
  },
  {
    co: "",
    street1: "Rüdigerstr.",
    street2: "",
    houseNumber: "23",
    postCode: "10365",
    city: "Berlin",
  },
  {
    co: "",
    street1: "Große-Leege-Straße",
    street2: "",
    houseNumber: "48",
    postCode: "13055",
    city: "Berlin",
  },
  {
    co: "",
    street1: "Krummhübler Straße",
    street2: "",
    houseNumber: "2",
    postCode: "10317",
    city: "Berlin",
  },
  {
    co: "",
    street1: "Schöneicher Straße",
    street2: "",
    houseNumber: "11a",
    postCode: "13055",
    city: "Berlin",
  },
  {
    co: "",
    street1: "Sangeallee",
    street2: "",
    houseNumber: "2",
    postCode: "10318",
    city: "Berlin",
  },
];

async function main() {
  const clearDb = true;

  if (clearDb) {
    await prisma.location.deleteMany();
  }

  const administrator = await prisma.user.findUnique({
    where: {
      email: "administrator@user.com",
    },
  });

  const editor = await prisma.user.findUnique({
    where: {
      email: "editor@user.com",
    },
  });

  const contributor = await prisma.user.findUnique({
    where: {
      email: "contributor@user.com",
    },
  });
  if (contributor && editor && administrator) {
    const taxTypeOfInstitution = await prisma.taxonomy.findFirst({
      where: {
        slug_de: {
          contains: "einrichtungsart",
        },
      },
    });
    const taxTargetAudience = await prisma.taxonomy.findFirst({
      where: {
        slug_de: {
          contains: "angebote-fuer",
        },
      },
    });
    const taxType = await prisma.taxonomy.findFirst({
      where: {
        slug_de: {
          contains: "traegerart",
        },
      },
    });

    if (taxTypeOfInstitution && taxTargetAudience && taxType) {
      const typeOfInstitutionTerms = await prisma.term.findMany({
        where: {
          taxonomyId: taxTypeOfInstitution.id,
        },
      });
      const audienceTerms = await prisma.term.findMany({
        where: {
          taxonomyId: taxTargetAudience.id,
        },
      });

      const typeTerms = await prisma.term.findMany({
        where: {
          taxonomyId: taxType.id,
        },
      });
      if (typeOfInstitutionTerms && audienceTerms && typeTerms) {
        const mapper = async (i: number) => {
          const id = i + 1;

          const tL = await prisma.location.findFirst({
            where: {
              slug_en: `location-en-${id}`,
            },
          });

          if (!tL) {
            const name = lorem.generateWords(rndBetween(1, 4));

            let ownerId;

            const geoCodeCandidates = await geocodingGetAddressCandidates(
              addresses[i],
              prisma
            );

            const point = geocodingGetBestMatchingLocation(
              geoCodeCandidates,
              addresses[i].postCode
            );

            console.log("Candidate", point);

            if (Math.random() > 0.2) {
              ownerId = Math.random() > 0.3 ? editor.id : administrator.id;
            } else {
              ownerId = contributor.id;
            }

            console.log(`Create location: L(${id}) EN ${name}`);

            try {
              const keywordSelection = getRandomElements(
                keywords,
                rndBetween(2, 5)
              ).join(" ");

              const terms = [
                ...getRandomElements(
                  typeOfInstitutionTerms,
                  rndBetween(1, 3)
                ).map((term) => ({ id: term.id })),
                ...getRandomElements(audienceTerms, rndBetween(1, 2)).map(
                  (term) => ({ id: term.id })
                ),
                ...getRandomElements(typeTerms, rndBetween(1, 1)).map(
                  (term) => ({ id: term.id })
                ),
              ];

              const data = {
                status: Math.random() > 0.3 ? 4 : rndBetween(1, 5),
                title_en: `L(${id}) EN ${name}`,
                title_de: `L(${id}) DE ${name}`,
                slug_en: `location-en-${id}`,
                slug_de: `location-de-${id}`,
                description_en: `Description EN: ${keywordSelection} ${lorem.generateWords(
                  rndBetween(15, 50)
                )}`,
                description_de: `Beschreibung DE: ${lorem.generateWords(
                  rndBetween(15, 50)
                )}`,

                address: addresses[i] as any,
                offers_en: `Offering EN: ${lorem.generateWords(
                  rndBetween(15, 50)
                )}`,
                offers_de: `Angebot DE: ${lorem.generateWords(
                  rndBetween(15, 50)
                )}`,
                accessibilityInformation_en: `Accessibility Information EN: ${lorem.generateWords(
                  rndBetween(15, 50)
                )}`,
                accessibilityInformation_de: `Barrierefreiheit DE: ${lorem.generateWords(
                  rndBetween(15, 50)
                )}`,

                geoCodingInfo: geoCodeCandidates,
                contactInfo: {
                  phone1: "+49302313292193",
                  phone2: "+49302313292193",
                  email1: "test@test.com",
                  email2: "test2@test.com",
                },
                agency: lorem.generateWords(rndBetween(1, 3)),

                lat: point.lat,
                lng: point.lng,

                terms: {
                  connect: terms,
                },
                primaryTerms: {
                  connect: terms.length > 0 ? terms[0] : [],
                },
                owner: {
                  connect: {
                    id: ownerId,
                  },
                },
              };
              await prisma.location.create({
                data: {
                  ...data,
                  fullText: daoSharedGenerateFullText(
                    data,
                    [
                      "title",
                      "slug",
                      "description",
                      "offers",
                      "accessibilityInformation",
                    ],
                    [
                      "title",
                      "slug",
                      "description",
                      "offers",
                      "accessibilityInformation",
                    ]
                  ),
                },
              });
            } catch (err) {
              console.log(err);
            }
          }
          await awaitTimeout(apiConfig.geoCodingThrottle);
        };

        await pMap([...Array(10).keys()], mapper, {
          concurrency: 1,
        });
      }
    }
  }

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
