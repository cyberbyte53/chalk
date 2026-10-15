import { Level } from "@chalk/content";
import { dec } from "@chalk/exact";
import { actionsFor, defineProp, set } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { buildBoard, column, inOrder, theBoard, wait } from "./board";
import { family, isFamily } from "./family";
import { idOf, versionOf } from "./id";
import { decimal } from "./params";

const dialState = z.object({ at: z.number(), isOn: z.boolean() }).strict();
type DialState = z.infer<typeof dialState>;
const act = actionsFor<DialState>();
const dial = defineProp({
  type: "dial",
  describe: "A dial",
  state: dialState,
  defaults: { at: 0, isOn: true },
  inputs: ["isOn"],
  derived: { double: { describe: "twice", compute: (s) => s.at * 2 } },
  actions: {
    turn: act({
      describe: "turn",
      byLearner: true,
      args: z.object({ to: z.number() }).strict(),
      run: (_s, a) => set({ at: a.to }),
    }),
  },
  signals: { turned: { describe: "turned" } },
});

describe("building a board", () => {
  it("writes props, IS, WHEN and witnesses as plain data", () => {
    const built = buildBoard("demo", (b) => {
      const d = b.prop(dial, "d", { at: dec("2.50") });
      b.is(d.field("isOn"), d.field("at").isAt(dec("7.384")));
      b.when(
        d.on("turned"),
        inOrder(d.call("turn", { to: dec("1.5") }), wait(1), theBoard.pass()),
        d.derived("double").gt(3),
      );
      b.witness(d.learner("turn", { to: dec("7.384") }));
      return column([d]);
    });
    expect(built.board.root).toEqual({
      kind: "column",
      name: "page",
      children: [{ kind: "prop", name: "d", prop: "dial", with: { at: 2.5 } }],
    });
    expect(built.board.is).toEqual([{ set: "d.isOn", to: '(fixed(d.at, 3) == "7.384")' }]);
    expect(built.board.when).toEqual([
      {
        on: "d.turned",
        if: "(d.double > 3)",
        do: { seq: [{ call: "d.turn", args: { to: 1.5 } }, { wait: 1 }, { call: "board.pass" }] },
      },
    ]);
    expect(built.witness).toEqual([
      { kind: "act", prop: "d", action: "turn", args: { to: 7.384 } },
    ]);
  });

  it("catches authoring mistakes when the board is built", () => {
    expect(() => buildBoard("x", (b) => column([b.prop(dial, "d"), b.prop(dial, "d")]))).toThrow(
      /Two props named "d"/,
    );
    expect(() =>
      buildBoard("x", (b) => {
        b.prop(dial, "d");
        return column([]);
      }),
    ).toThrow(/not in the layout: d/);
  });

  it("names an action, signal or field the prop doesn't have: a compile error, not a runtime one", () => {
    buildBoard("x", (b) => {
      const d = b.prop(dial, "d");
      // @ts-expect-error the dial has no action "spin"
      d.call("spin");
      // @ts-expect-error the dial has no derived field "triple"
      d.derived("triple");
      // @ts-expect-error the dial has no signal "spun"
      d.on("spun");
      // @ts-expect-error the dial has no stored field "angle"
      d.field("angle");
      return column([d]);
    });
  });
});

describe("question families", () => {
  const turnTo = family({
    level: Level.Easy,
    tests: ["dials"],
    params: z.object({ to: decimal }).strict(),
    build: ({ to }, b) => {
      const d = b.prop(dial, "d");
      b.witness(d.learner("turn", { to }));
      return column([d]);
    },
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
  it("an id is the path (and a question's params), whatever order the keys come in", () => {
    expect(idOf("a/b", { x: 1, y: [2, { d: 3, c: 4 }] })).toBe(
      idOf("a/b", { y: [2, { c: 4, d: 3 }], x: 1 }),
    );
    expect(idOf("a/b")).not.toBe(idOf("a/c"));
    expect(idOf("a/b")).toMatch(/^[0-9a-f]{16}$/);
  });

  it("a version is the content, not the commit it was built from", () => {
    const item = (commit: string, title: string) => ({
      id: "x",
      version: "",
      source: { path: "p", file: "f", commit },
      title,
    });
    expect(versionOf(item("abc", "A"))).toBe(versionOf(item("def", "A")));
    expect(versionOf(item("abc", "A"))).not.toBe(versionOf(item("abc", "B")));
  });
});
