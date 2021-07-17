import { filteredOutput, filteredOutputOrNotFound } from "../../src/utils";

describe("/utils/filteredOutput.ts", () => {
  const testObject = {
    a: 1,
    b: 1,
    c: 1,
    d: 1,
    e: 1,
  };

  const testKeys = ["a", "c", "e"];

  test("object filter", async () => {
    expect(filteredOutput(testObject, testKeys)).toEqual({
      b: 1,
      d: 1,
    });
  });

  test("object filter no keys", async () => {
    expect(filteredOutput(testObject)).toEqual(testObject);
  });

  test("array of objects filter", async () => {
    expect(filteredOutput([testObject, testObject], testKeys)).toEqual([
      {
        b: 1,
        d: 1,
      },
      {
        b: 1,
        d: 1,
      },
    ]);
  });

  test("filteredOutputOrNotFound: throws not found", async () => {
    const t = () => filteredOutputOrNotFound(null, testKeys);
    expect(t).toThrow("Not found");
  });

  test("filteredOutputOrNotFound: no keys", async () => {
    expect(filteredOutputOrNotFound(testObject)).toEqual(testObject);
  });
});
