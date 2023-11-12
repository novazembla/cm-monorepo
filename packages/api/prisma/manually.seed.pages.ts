import {default as PrismaComplete, type Prisma} from "@prisma/client";
import bcrypt from "bcrypt";
import { LoremIpsum } from "lorem-ipsum";

const { PrismaClient } = PrismaComplete;

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

  return result.filter((n) => n);
};

const daoSharedGenerateFullText = (data: any, keys: string[]) => {
  return keys.reduce((fullText: string, key) => {
    if (!(key in data)) return fullText;

    if (typeof data[key] !== "object") return fullText;

    return `${fullText} ${Object.keys(data[key])
      .map((oKey) => data[key][oKey])
      .join("\n")}`;
  }, "");
};

const rndBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;


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
  await Promise.all(
    // ["administrator", "editor", "contributor", "user"].map(async (role) => {
    ["editor", "contributor", "user"].map(async (role) => {
      const user = await upsertUser(`${role}@user.com`, role, `${role}FIT432!`, 1);

      console.log(`Seeded: ${user?.email}`);
      return user;
    })
  );

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

  if (contributor && editor) {
    console.log("Create pages if needed");
    await Promise.all(
      pages.map(async (page) => {
        const pageTest = await prisma.page.findFirst({
          where: {
            slug_de: { contains: slugify(page[0]) },
          },
        });

        if (!pageTest) {
          const keywordSelection = getRandomElements(
            keywords,
            rndBetween(2, 5)
          ).join(" ");
          const data: Prisma.PageCreateInput = {
            status: Math.random() > 0.3 ? 4 : rndBetween(1, 4),
            title_de: page[0],
            title_en: page[0],
            slug_de: slugify(page[0]),
            slug_en: slugify(page[1]),
            intro_de: `${keywordSelection} ${lorem
              .generateParagraphs(rndBetween(1, 5))
              .replace(/(\r\n|\n|\r)/g, "<br/><br/>")}`,
            intro_en: lorem
              .generateParagraphs(rndBetween(1, 5))
              .replace(/(\r\n|\n|\r)/g, "<br/><br/>"),
            content_de: `${keywordSelection} ${lorem
                .generateParagraphs(rndBetween(5, 10))
                .replace(/(\r\n|\n|\r)/g, "<br/><br/>")}`,
            content_en: lorem
                .generateParagraphs(rndBetween(5, 10))
                .replace(/(\r\n|\n|\r)/g, "<br/><br/>"),
            owner: {
              connect: {
                id: Math.random() > 0.5 ? contributor.id : editor.id,
              },
            },
          };
          await prisma.page.create({
            data: {
              ...data,
              fullText: daoSharedGenerateFullText(data, [
                "title",
                "slug",
                "content",
              ]),
            },
          });
        }
      })
    );
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
