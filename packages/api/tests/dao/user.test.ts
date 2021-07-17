import { Prisma } from "@prisma/client";

import {
  daoUserCheckIsEmailTaken,
  daoUserCreate,
  // daoUserQuery,
} from "../../src/dao/user";
import { filteredOutputOrNotFound } from "../../src/utils";
import { db } from "../../src/config";

describe("/dao/user.ts", () => {
  const newUserData: Prisma.UserCreateInput = {
    firstName: "Peter",
    lastName: "Pattern",
    email: "peter@pattern.com",
    password: "superTestSecret",
    acceptedTerms: false,
  };

  test("daoUserCheckIsEmailTaken", async () => {
    const isEmailTaken = await daoUserCheckIsEmailTaken("test@test.com");

    expect(isEmailTaken).toBe(true);

    const isEmailNotTaken = await daoUserCheckIsEmailTaken("test2@test.com");

    expect(isEmailNotTaken).toBe(false);
  });

  test("daoUserCreate", async () => {
    const user = await daoUserCreate(newUserData);

    expect(user).not.toBe(null);
    expect(typeof user).toEqual("object");
    expect(user).not.toEqual(newUserData);
    expect(user).toEqual(
      filteredOutputOrNotFound(user, db.privateJSONDataKeys.user)
    );
  });

  // te st("daoUserQuery", async () => {
  //   const user = await daoUserQuery(newUserData);

  //   expect(user).not.toBe(null);
  //   expect(typeof user).toEqual("object");
  //   expect(user).not.toEqual(newUserData);
  //   expect(user).toEqual(
  //     filteredOutputOrNotFound(user, db.privateJSONDataKeys.user)
  //   );
  // });
});
