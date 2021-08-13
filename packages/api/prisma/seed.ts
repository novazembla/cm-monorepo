import Prisma from "@prisma/client";
import argon2 from "argon2";
import { match } from "assert/strict";

import { LoremIpsum } from "lorem-ipsum";

const { PrismaClient } = Prisma;

const prisma = new PrismaClient();

// const LoremIpsum = require("lorem-ipsum").LoremIpsum;

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
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
};

const lat = [
  52.536821, 52.522971, 52.517696, 52.529969, 52.522971, 52.510593, 52.506675,
  52.519315, 52.55175, 52.547888,
];

const lng = [
  13.514006, 13.492928, 13.479444, 13.491897, 13.471944, 13.498654, 13.47827,
  13.472438, 13.437911, 13.472609,
];

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

const rndBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const categories = [
  ["Einrichtungen der kulturellen Bildung", "Cultural for Cultural Education"],
  ["Kirchen", "Churches"],
  ["Kultureinrichtungen", "Cultural Institutions"],
  ["Kulturinitiativen", "Cultural Initiatives"],
  ["Begegnungsstätten", "Social Meeting Places"],
  ["Stiftungen", "Foundations"],
  ["Universitäten/ Hochschulen", "Universities"],
  ["freischaffende Künstler*innen", "Artists"],
  ["Unternehmen der Kreativwirtschaft", "Creative Industry"],
  ["Erinnerungsorte", "Memorial Sites"],
  ["Kunst im Stadtraum", "Public Art"],
];

const eventCategories = [
  ["Kunst", "Arts"],
  ["Tanz", "Dance"],
  ["Klassische Musik", "Classical Music"],
  ["Moderne Musik", "Modern Music"],
  ["Expreimentelle Musik", "Experimental Music"],
  ["Lesung", "Lecture"],
  ["Workshop", "Workshop"],
  ["Ausstellungen", "Exhibitions"],
];

const pages = [
  ["Kultur in Lichtenberg", "Culture Map Project"],
  ["Nutzungshinweiser", "How to use"],
  ["Impressum", "Imprint"],
  ["Über uns", "About Us"],
  ["Datenschutz", "Privacy information"],
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
      password: await argon2.hash(password),
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
    await prisma.taxonomy.deleteMany();
    await prisma.image.deleteMany();
    await prisma.event.deleteMany();
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
          withTaxonomies: ["location", "event", "tour"].includes(m.key),
        },
        update: {
          key: m.key,
          name: m.name,
          withTaxonomies: ["location", "event", "tour"].includes(m.key),
        },
        where: {
          key: m.key,
        },
      });
    })
  );

  await Promise.all(
    ["administrator", "editor", "contributor", "user"].map(async (role) => {
      const user = await upsertUser(`${role}@user.com`, role, role, 1);

      console.log(`Seeded: ${user?.email}`);
      return user;
    })
  );

  await Promise.all(
    [...Array(100).keys()].map(async (i) => {
      const id = i + 1;
      const user = await upsertUser(
        `user${id}@user.com`,
        `user`,
        `${id} User`,
        id,
        i % 2 === 0
      );

      console.log(`Seeded: user${id}@user.com`);
      return user;
    })
  );

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

  if (administrator) {
    const testTaxonomy = await prisma.taxonomy.findFirst({
      where: {
        slug: {
          path: ["de"],
          string_contains: "kategorien",
        },
      },
    });

    if (!testTaxonomy) {
      console.log("create new tax");

      await prisma.taxonomy.create({
        data: {
          name: {
            de: "Kategorien",
            en: "Categories",
          },
          multiTerm: true,
          slug: {
            de: "kategorien",
            en: "categories",
          },
          modules: {
            connect: {
              key: "location",
            },
          },
          terms: {
            createMany: {
              data: categories.map((term) => ({
                name: {
                  de: term[0],
                  en: term[1],
                },
                slug: {
                  de: slugify(term[0]),
                  en: slugify(term[1]),
                },
              })),
            },
          },
        },
      });
    }

    const eventTaxonomy = await prisma.taxonomy.findFirst({
      where: {
        slug: {
          path: ["de"],
          string_contains: "veranstaltungsarten",
        },
      },
    });

    if (!eventTaxonomy) {
      console.log("create new veranstaltungsart");

      await prisma.taxonomy.create({
        data: {
          name: {
            de: "Veranstaltungsart",
            en: "Event Categories",
          },
          multiTerm: true,
          slug: {
            de: "veranstaltungsarten",
            en: "event-categories",
          },
          modules: {
            connect: {
              key: "event",
            },
          },

          terms: {
            createMany: {
              data: eventCategories.map((term) => ({
                name: {
                  de: term[0],
                  en: term[1],
                },
                slug: {
                  de: slugify(term[0]),
                  en: slugify(term[1]),
                },
              })),
            },
          },
        },
      });
    }
  }

  if (contributor && editor && administrator) {
    const taxCategories = await prisma.taxonomy.findFirst({
      where: {
        slug: {
          path: ["de"],
          string_contains: "kategorien",
        },
      },
    });

    if (taxCategories) {
      const catTerms = await prisma.term.findMany({
        where: {
          taxonomyId: taxCategories.id,
        },
      });

      if (catTerms) {
        console.log("Create locations if needed");

        await Promise.all(
          [...Array(125).keys()].map(async (i) => {
            const id = i + 1;
            console.log(`test location-en-${id}`);

            const tL = await prisma.location.findFirst({
              where: {
                slug: {
                  path: ["en"],
                  string_contains: `location-en-${id}`,
                },
              },
            });

            if (!tL) {
              const name = lorem.generateWords(rndBetween(1, 4));

              let ownerId;

              if (Math.random() > 0.2) {
                ownerId = Math.random() > 0.3 ? editor.id : administrator.id;
              } else {
                ownerId = contributor.id;
              }

              console.log(`Create location: L(${id}) EN ${name}`);

              try {
                await prisma.location.create({
                  data: {
                    status: rndBetween(1, 5),
                    title: {
                      en: `L(${id}) EN ${name}`,
                      de: `L(${id}) DE ${name}`,
                    },
                    slug: {
                      en: `location-en-${id}`,
                      de: `location-de-${id}`,
                    },
                    description: {
                      en: `Description EN: ${lorem.generateWords(
                        rndBetween(5, 40)
                      )}`,
                      de: `Beschreibung DE: ${lorem.generateWords(
                        rndBetween(5, 40)
                      )}`,
                    },
                    address: {
                      en: `Adress EN: ${lorem.generateWords(
                        rndBetween(5, 40)
                      )}`,
                      de: `Adresse DE: ${lorem.generateWords(
                        rndBetween(5, 40)
                      )}`,
                    },
                    offers: {
                      en: `Offering EN: ${lorem.generateWords(
                        rndBetween(5, 40)
                      )}`,
                      de: `Angebot DE: ${lorem.generateWords(
                        rndBetween(5, 40)
                      )}`,
                    },
                    contactInfo: {
                      en: `Contact EN: ${lorem.generateWords(
                        rndBetween(5, 15)
                      )}`,
                      de: `Kontaktinformation DE: ${lorem.generateWords(
                        rndBetween(5, 15)
                      )}`,
                    },

                    lat: lat[Math.floor(Math.random() * lat.length)],
                    lng: lng[Math.floor(Math.random() * lng.length)],

                    terms: {
                      connect: getRandomElements(
                        catTerms,
                        rndBetween(1, 3)
                      ).map((term) => ({ id: term.id })),
                    },

                    owner: {
                      connect: {
                        id: ownerId,
                      },
                    },
                  },
                });
              } catch (err) {
                console.log(err);
              }
            }
          })
        );
      }
    }

    console.log("Create pages if needed");
    await Promise.all(
      pages.map(async (page) => {
        const pageTest = await prisma.page.findFirst({
          where: {
            slug: {
              path: ["de"],
              string_contains: slugify(page[0]),
            },
          },
        });

        if (!pageTest) {
          await prisma.page.create({
            data: {
              status: rndBetween(1, 4),
              title: {
                de: page[0],
                en: page[1],
              },
              slug: {
                de: slugify(page[0]),
                en: slugify(page[1]),
              },
              content: {
                de: lorem
                  .generateParagraphs(rndBetween(5, 10))
                  .replace(/(\r\n|\n|\r)/g, "<br/><br/>"),
                en: lorem
                  .generateParagraphs(rndBetween(5, 10))
                  .replace(/(\r\n|\n|\r)/g, "<br/><br/>"),
              },
              owner: {
                connect: {
                  id: Math.random() > 0.5 ? contributor.id : editor.id,
                },
              },
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
