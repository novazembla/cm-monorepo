import { ApiError } from "../../src/utils";

describe("/utils/ApiError.ts", () => {
  test("class instatiation", async () => {
    const testClass = new ApiError(500, "Internal Server Error");

    expect(testClass).toBeInstanceOf(ApiError);
  });

  test("throws error", async () => {
    const t = () => {
      throw new ApiError(500, "Internal Server Error");
    };
    expect(t).toThrow(ApiError);
    expect(t).toThrow("Internal Server Error");
  });

  test("custom stack", async () => {
    expect.assertions(2);

    let error = false;
    try {
      throw new ApiError(
        500,
        "Internal Server Error",
        true,
        "custom stack info"
      );
    } catch (Err) {
      error = Err;
    }

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toHaveProperty("stack", "custom stack info");
  });
});
