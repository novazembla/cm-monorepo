import { default as PrismaComplete } from "@prisma/client";
import bcrypt from "bcrypt";

import { LoremIpsum } from "lorem-ipsum";
import type { Address } from "../src/types";

import { getApiConfig } from "../src/config";

const { PrismaClient } = PrismaComplete;

const prisma = new PrismaClient();

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
  ["Senior*inne", "Senior Citizens"],
];

const institutionType = [
  ["Freier Träger", "Non-profit Institution"],
  ["Öffentlicher Träger ", "Public Institution"],
  ["Privatwirtschaftlich", "Private Institution"],
];

const eventCategories = [
  ["Kunst", "Arts"],
  ["Tanz", "Dance"],
  ["Klassische Musik", "Classical Music"],
  ["Moderne Musik", "Modern Music"],
  ["Experimentelle Musik", "Experimental Music"],
  ["Lesung", "Lecture"],
  ["Workshop", "Workshop"],
  ["Ausstellungen", "Exhibitions"],
];

const accessibility = [
  ["Rollstuhlgerecht", "Wheelchair accessible"],
  ["WC Rollstuhlgerecht", "WC wheelchair accessible"],
  ["WC für Rollstuhl geeignet", "WC suitable for wheelchair"],
  [
    "WC für Rollstuhl bedingt geeignet",
    "WC conditionally wheelchair accessible",
  ],
  ["Aufzug rollstuhlgerecht", "Elevator wheelchair accessible"],
  ["Rollstuhl geeignet", "Wheelchair suitable"],
  ["Nicht rollstuhlgeeignet", "Not suitable for wheelchair"],
  ["Fahrradabstellplatz", "Bicycle parking"],
  [
    "Ausgewiesener Behindertenparkplatz",
    "Designated handicapped parking space",
  ],
];

async function main() {
  let testTaxonomy = await prisma.taxonomy.findFirst({
    where: {
      slug_de: {
        contains: "einrichtungsart",
      },
    },
  });

  if (!testTaxonomy) {
    console.log("create new tax: Einrichtungsart");

    await prisma.taxonomy.create({
      data: {
        name_de: "Einrichtungsart",
        name_en: "Type of Institution",
        multiTerm: true,
        slug_de: "einrichtungsart",
        slug_en: "type",
        modules: {
          connect: {
            key: "location",
          },
        },
        fullText: "Einrichtungsart einrichtungsart Type of Institution type",
        terms: {
          createMany: {
            data: categories.map((term) => ({
              name_de: term[0],
              name_en: term[1],
              slug_de: slugify(term[0]),
              slug_en: slugify(term[1]),
              fullText: `${term[0]} ${term[1]} ${slugify(term[0])} ${slugify(
                term[1]
              )}`,
            })),
          },
        },
      },
    });
  }

  testTaxonomy = await prisma.taxonomy.findFirst({
    where: {
      slug_de: {
        contains: "angebote-fuer",
      },
    },
  });

  if (!testTaxonomy) {
    console.log("create new tax: Angebote für");

    await prisma.taxonomy.create({
      data: {
        name_de: "Angebote für",
        name_en: "Target Audience",
        multiTerm: true,
        slug_de: "angebote-fuer",
        slug_en: "target-audience",
        modules: {
          connect: {
            key: "location",
          },
        },
        fullText: "Angebote für angebote-fuer Target Audience target-audience",
        terms: {
          createMany: {
            data: targetAudience.map((term) => ({
              name_de: term[0],
              name_en: term[1],
              slug_de: slugify(term[0]),
              slug_en: slugify(term[1]),
              fullText: `${term[0]} ${term[1]} ${slugify(term[0])} ${slugify(
                term[1]
              )}`,
            })),
          },
        },
      },
    });
  }

  testTaxonomy = await prisma.taxonomy.findFirst({
    where: {
      slug_de: {
        contains: "traegerart",
      },
    },
  });

  if (!testTaxonomy) {
    console.log("create new tax: Trägerart");

    await prisma.taxonomy.create({
      data: {
        name_de: "Trägerart",
        name_en: "Type of Institution",
        multiTerm: true,
        slug_de: "traegerart",
        slug_en: "type",
        modules: {
          connect: {
            key: "location",
          },
        },
        fullText: "Trägerart traegerart Type of Institution type",
        terms: {
          createMany: {
            data: institutionType.map((term) => ({
              name_de: term[0],
              name_en: term[1],
              slug_de: slugify(term[0]),
              slug_en: slugify(term[1]),
              fullText: `${term[0]} ${term[1]} ${slugify(term[0])} ${slugify(
                term[1]
              )}`,
            })),
          },
        },
      },
    });
  }

  const eventTaxonomy = await prisma.taxonomy.findFirst({
    where: {
      slug_de: {
        contains: "veranstaltungsart",
      },
    },
  });

  if (!eventTaxonomy) {
    console.log("create new veranstaltungsart");

    await prisma.taxonomy.create({
      data: {
        name_de: "Veranstaltungsart",
        name_en: "Event Categories",
        multiTerm: true,
        slug_de: "veranstaltungsart",
        slug_en: "event-categories",
        modules: {
          connect: {
            key: "event",
          },
        },
        fullText:
          "Veranstaltungsart veranstaltungsart Event Categories event-categories",
        terms: {
          createMany: {
            data: eventCategories.map((term) => ({
              name_de: term[0],
              name_en: term[1],
              slug_de: slugify(term[0]),
              slug_en: slugify(term[1]),
              fullText: `${term[0]} ${term[1]} ${slugify(term[0])} ${slugify(
                term[1]
              )}`,
            })),
          },
        },
      },
    });
  }

  const accessibilityTaxonomy = await prisma.taxonomy.findFirst({
    where: {
      slug_de: {
        contains: "barrierefreiheit",
      },
    },
  });

  if (!accessibilityTaxonomy) {
    console.log("create new accessibility taxonomy");

    await prisma.taxonomy.create({
      data: {
        name_de: "Barrierefreiheit",
        name_en: "Accessibility Information",
        multiTerm: true,
        slug_de: "barrierefreiheit",
        slug_en: "accessibility-information",
        modules: {
          connect: [
            {
              key: "event",
            },
            {
              key: "location",
            },
          ],
        },
        fullText:
          "Barrierefreiheit barrierefreiheit Accessibility Information accessibility-information",
        terms: {
          createMany: {
            data: accessibility.map((term) => ({
              name_de: term[0],
              name_en: term[1],
              slug_de: slugify(term[0]),
              slug_en: slugify(term[1]),
              fullText: `${term[0]} ${term[1]} ${slugify(term[0])} ${slugify(
                term[1]
              )}`,
            })),
          },
        },
      },
    });
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
