import { Level } from "@chalk/content";
import { dec } from "@chalk/exact";
import { PropRole } from "@chalk/prop";
import { action, prop } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { family, isFamily } from "./family";
import { idOf, rowKey, versionOf } from "./id";
import { decimal } from "./params";
import { place, scene, tap } from "./scene";

const dial = prop({
  type: "dial",
  role: PropRole.Explainer,
  describe: "A dial",
  variables: z.object({ at: z.number() }).strict(),
  start: { at: 0 },
  actions: { turn: action({ to: z.number() }, { from: "screen", describe: "Turn it" }) },
  on: { turn: (_, { to }, t) => t.set({ at: to }) },
});

describe("question families", () => {
  const turnTo = family({
    level: Level.Easy,
    tests: ["dials"],
    params: z.object({ to: decimal }).strict(),
    build: ({ to }) =>
      scene({ pieces: { d: place(dial) }, witness: [tap("d", "turn", { to: Number(to) })] }),
  });

  it("checks a row's params and hands the family exact decimals", () => {
    const parsed = turnTo.params.safeParse({ to: "2.50" });
    expect(parsed.success && parsed.data.to.toString()).toBe("2.50");
    expect(turnTo.params.safeParse({ to: 2.5 }).success).toBe(false);
    expect(turnTo.params.safeParse({ to: "2.5", extra: 1 }).success).toBe(false);
    expect(isFamily(turnTo)).toBe(true);
  });

  it("builds one board per params, named after the family's folder", () => {
    const built = turnTo.build({ to: dec("7.384") }, "turn-to");
    expect(built.board.name).toBe("turnTo");
    expect(built.witness).toEqual([
      { kind: "act", prop: "d", action: "turn", args: { to: 7.384 } },
    ]);
  });
});

describe("ids and versions", () => {
  it("an id is a hash of the path; a bank row is named by its params, whatever order the keys come in", () => {
    expect(idOf("a/b")).not.toBe(idOf("a/c"));
    expect(idOf("a/b")).toMatch(/^[0-9a-f]{16}$/);
    expect(rowKey({ x: 1, y: [2, { d: 3, c: 4 }] })).toBe(rowKey({ y: [2, { c: 4, d: 3 }], x: 1 }));
    expect(rowKey({ x: 1 })).not.toBe(rowKey({ x: 2 }));
    expect(rowKey({ x: 1 })).toMatch(/^[0-9a-f]{8}$/);
  });

  it("a version is the item's content and what it is made from, not its own version field", () => {
    const item = (title: string, version = "") => ({ id: "x", version, path: "p", title });
    expect(versionOf(item("A"))).toBe(versionOf(item("A", "old")));
    expect(versionOf(item("A"))).not.toBe(versionOf(item("B")));
    expect(versionOf(item("A"), { code: "1" })).not.toBe(versionOf(item("A"), { code: "2" }));
  });
});
