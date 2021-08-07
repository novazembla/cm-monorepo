import { Prisma } from "@prisma/client";

export const daoSharedCheckSlugUnique = async (
  findMany: Function,
  slug: Record<string, string>,
  id?: number,
  uniqueInObject?: boolean
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  let errors = {};
  let ok = false;

  // first simply compare all slugs in the json
  // they can't be the same for the same id either
  if (uniqueInObject) {
    errors = Object.keys(slug).reduce((acc, key: string) => {
      if (
        Object.keys(slug).find(
          (testkey: string) => testkey !== key && slug[testkey] === slug[key]
        )
      ) {
        return {
          ...acc,
          [key]: "You can't use the same slug in the same object",
        };
      }
      return acc;
    }, errors);

    // seems like the slugs are not unique for the object
    if (Object.keys(errors).length > 0) {
      ok = false;
      return { ok, errors };
    }
  }

  // now test it with other object in the table
  const slugTests = Object.keys(slug).map((key) => ({
    slug: {
      path: [key],
      equals: slug[key],
    },
  }));

  const terms = await findMany({
    where: {
      OR: slugTests,
      ...(id
        ? {
            NOT: {
              id,
            },
          }
        : {}),
    },
    select: {
      slug: true,
    },
  });

  if (terms) {
    // so there are other objects that have the same slug.
    // lets find the offending one slug.
    errors = terms.reduce((errorsAcc: any, item: any) => {
      if (!item.slug) return errorsAcc;

      return {
        ...errorsAcc,
        ...Object.keys(slug).reduce((acc, key: string) => {
          if (
            Object.keys(item?.slug ?? {}).find(
              (testkey: string) =>
                (item?.slug as Prisma.JsonObject)[testkey] === slug[key]
            )
          ) {
            return {
              ...acc,
              [key]: "This slug is already in use",
            };
          }
          return acc;
        }, {}),
      };
    }, errors);
    ok = !(Object.keys(errors).length > 0);
  } else {
    ok = true;
  }
  return { ok, errors };
};

export default daoSharedCheckSlugUnique;
