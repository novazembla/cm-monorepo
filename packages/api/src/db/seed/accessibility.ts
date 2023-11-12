import Prisma from "@prisma/client";

const { PrismaClient } = Prisma;

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
