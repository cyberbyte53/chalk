import { describe, expect, it } from "vitest";
import { EVENT_SCHEMA_VERSION, eventSchema, isKind } from "./event";
import { hashOf, idOf, sha256 } from "./hash";

const envelope = {
  id: "e1",
  schemaVersion: EVENT_SCHEMA_VERSION,
  session: "s1",
  seq: 7,
  at: 1791692957412,
  commit: "6fcca4a2c723184deabffb765c4d0d76330028d4",
  actor: "learner",
  opening: "o1",
  board: "aaaaaaaaaaaaaaaa",
  version: "0123456789abcdef",
  node: "bbbbbbbbbbbbbbbb",
};

describe("eventSchema", () => {
  it("takes each kind with its own payload", () => {
    const checked = eventSchema.parse({
      ...envelope,
      kind: "signal",
      payload: { signal: "checked", payload: { status: "wrong", attempts: 1 }, from: 6 },
    });
    expect(isKind(checked, "signal") && checked.payload.from).toBe(6);
    expect(
      eventSchema.parse({
        ...envelope,
        kind: "cause",
        payload: { action: "select", args: { option: "factor" } },
      }).kind,
    ).toBe("cause");
    expect(
      eventSchema.parse({ ...envelope, node: null, kind: "app", payload: { what: "passed" } }).kind,
    ).toBe("app");
  });

  it("refuses a payload of another kind, and fields that don't belong", () => {
    expect(
      eventSchema.safeParse({ ...envelope, kind: "signal", payload: { action: "x", args: {} } })
        .success,
    ).toBe(false);
    expect(
      eventSchema.safeParse({ ...envelope, extra: 1, kind: "close", payload: {} }).success,
    ).toBe(false);
    expect(eventSchema.safeParse({ ...envelope, kind: "nope", payload: {} }).success).toBe(false);
  });
});

describe("hashes", () => {
  it("are SHA-256, the same as Node's", async () => {
    const { createHash } = await import("node:crypto");
    for (const text of ["", "abc", "ई".repeat(100), "x".repeat(1000)])
      expect(sha256(text)).toBe(createHash("sha256").update(text).digest("hex"));
  });

  it("an id is a hash of the path", () => {
    expect(idOf("a/b")).toBe(hashOf({ path: "a/b" }));
    expect(idOf("a/b")).toMatch(/^[0-9a-f]{16}$/);
  });
});
