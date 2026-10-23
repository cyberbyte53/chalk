import { describe, expect, it } from "vitest";
import { readConfig } from "./config";

const base = { DATABASE_URL: "postgres://x", GOOGLE_CLIENT_ID: "id" };

describe("config", () => {
  it("allows dev sign-in only on localhost", () => {
    expect(
      readConfig({ ...base, ORIGIN: "http://localhost:5173", DEV_SIGN_IN: "on" }).DEV_SIGN_IN,
    ).toBe("on");
    expect(() =>
      readConfig({
        ...base,
        ORIGIN: "https://chalk1.centralindia.cloudapp.azure.com",
        DEV_SIGN_IN: "on",
      }),
    ).toThrow(/only for localhost/);
  });

  it("says which settings are missing", () => {
    expect(() => readConfig({ ORIGIN: "http://localhost:5173" })).toThrow(/DATABASE_URL/);
  });
});
