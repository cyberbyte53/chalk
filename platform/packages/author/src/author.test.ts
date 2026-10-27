import { Level, type RuleFn } from "@chalk/content";
import { dec } from "@chalk/exact";
import { AnswerStatus, PropRole, QuestionSignal, actionsFor, defineProp, set } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { buildBoard, column, inOrder, theBoard, wait } from "./board";
import { family, isFamily } from "./family";
import { idOf, rowKey, versionOf } from "./id";
import { page } from "./page";
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
      changes: ["at"],
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
      b.is(d.input.isOn, (at) => at(d).at === 7.384);
      b.when(
        d.on.turned,
        inOrder(d.call.turn({ to: dec("1.5") }), wait(1), theBoard.show(d)),
        (at) => at(d).double > 3,
      );
      b.witness(d.learner.turn({ to: dec("7.384") }));
      return [d];
    });
    expect(built.board.root).toEqual({
      kind: "column",
      name: "page",
      children: [
        { kind: "prop", name: "d", prop: "dial", with: { at: 2.5 } },
        { kind: "space", name: "space1" },
      ],
    });
    expect(built.board.is).toEqual([{ set: "d.isOn", to: expect.any(Function) }]);
    expect(built.board.when).toEqual([
      // No questions: it passes at once.
      { on: "board.started", do: { call: "board.pass" } },
      {
        on: "d.turned",
        if: expect.any(Function),
        do: {
          seq: [
            { call: "d.turn", args: { to: 1.5 } },
            { wait: 1 },
            { call: "board.show", args: { name: "d" } },
          ],
        },
      },
    ]);
    expect(built.witness).toEqual([
      { kind: "act", prop: "d", action: "turn", args: { to: 7.384 } },
    ]);
  });

  it("catches authoring mistakes when the board is built", () => {
    expect(() => buildBoard("x", (b) => [b.prop(dial, "d"), b.prop(dial, "d")])).toThrow(
      /Two props named "d"/,
    );
    expect(() =>
      buildBoard("x", (b) => {
        b.prop(dial, "d");
        return [];
      }),
    ).toThrow(/not in the layout: d/);
    expect(() => buildBoard("x", (b) => column([b.prop(dial, "d")]) as never)).toThrow(
      /return its pieces as a list/,
    );
  });

  it("names an action, signal or field the prop doesn't have, or gives an action the wrong arguments: a compile error, not a runtime one", () => {
    buildBoard("x", (b) => {
      const d = b.prop(dial, "d");
      // Only checked by the compiler: the lines below are never run.
      const never = () => {
        // @ts-expect-error the dial has no action "spin"
        d.call.spin();
        // @ts-expect-error turn takes { to }
        d.learner.turn({ from: 1 });
        // @ts-expect-error turn needs its arguments
        d.call.turn();
        // @ts-expect-error the dial has no signal "spun"
        d.on.spun;
        // @ts-expect-error the dial's "at" isn't one a lesson may own (only its inputs are)
        b.is(d.input.at, () => 1);
        // @ts-expect-error an input is set to a value of its own type
        b.is(d.input.isOn, () => 3);
        // @ts-expect-error the dial has no derived field "triple"
        b.when(d.on.turned, d.call.turn({ to: 1 }), (at) => at(d).triple > 0);
      };
      expect(typeof never).toBe("function");
      return [d];
    });
  });
});

const askState = z.object({ status: z.enum(["open", "correct", "wrong"]) }).strict();
const ask = defineProp({
  type: "ask",
  describe: "A question",
  role: PropRole.Question,
  state: askState,
  defaults: { status: "open" },
  actions: {},
  signals: { [QuestionSignal.Correct]: { describe: "right" } },
});

describe("a page", () => {
  it("is a column with room at the bottom; what comes later starts hidden and shows after", () => {
    const built = page("later", (b) => {
      const d = b.prop(dial, "d");
      const q = b.prop(ask, "q");
      const note = b.prop(dial, "note");
      b.after(d.on.turned, q);
      b.after(q, [note], { if: (at) => at(d).at > 2 });
      return [d, q, note];
    }).build().board;
    expect(built.root).toMatchObject({
      kind: "column",
      children: [
        { name: "d" },
        { name: "q", isHidden: true },
        { name: "note", isHidden: true },
        { kind: "space" },
      ],
    });
    expect(built.when.map((r) => [r.on, r.do, typeof r.if])).toEqual([
      ["d.turned", [{ call: "board.show", args: { name: "q" } }], "undefined"],
      ["q.correct", [{ call: "board.show", args: { name: "note" } }], "function"],
      // Its one question passes it.
      ["q.correct", { call: "board.pass" }, "undefined"],
    ]);
  });

  it("passes when every question is right, at once with none, or by passWhen", () => {
    const two = page("two", (b) => [b.prop(ask, "a"), b.prop(ask, "b")]).build().board;
    const passes = two.when.filter((r) => JSON.stringify(r.do).includes("board.pass"));
    expect(passes.map((r) => r.on)).toEqual(["a.correct", "b.correct"]);
    const allRight = passes[0]?.if as RuleFn;
    const statuses: Record<string, string> = { a: AnswerStatus.Correct, b: AnswerStatus.Open };
    const at = (p: string | { name: string }) => ({
      status: statuses[typeof p === "string" ? p : p.name],
    });
    expect(allRight(at)).toBe(false);
    statuses.b = AnswerStatus.Correct;
    expect(allRight(at)).toBe(true);

    const reading = page("reading", (b) => [b.prop(dial, "d")]).build().board;
    expect(reading.when).toEqual([{ on: "board.started", do: { call: "board.pass" } }]);

    const onSignal = page("on-signal", (b) => {
      const d = b.prop(dial, "d");
      b.passWhen(d.on.turned, { if: (at) => at(d).at === 3 });
      return [d, b.prop(ask, "q")];
    }).build().board;
    // passWhen replaces passing on the question.
    expect(onSignal.when.map((r) => [r.on, r.do])).toEqual([["d.turned", { call: "board.pass" }]]);
  });

  it("refuses a rule that passes the board, and a piece hidden that nothing shows", () => {
    expect(() =>
      page("b", (b) => {
        const d = b.prop(dial, "d");
        b.when(d.on.turned, theBoard.pass());
        return [d];
      }).build(),
    ).toThrow(/use passWhen/);
    expect(() => page("c", (b) => [b.prop(dial, "d", {}, { isHidden: true })]).build()).toThrow(
      /nothing shows them/,
    );
  });
});

describe("question families", () => {
  const turnTo = family({
    level: Level.Easy,
    tests: ["dials"],
    params: z.object({ to: decimal }).strict(),
    build: ({ to }, b) => {
      const d = b.prop(dial, "d");
      b.witness(d.learner.turn({ to }));
      return [d];
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
