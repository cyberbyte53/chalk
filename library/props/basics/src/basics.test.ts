import { checkProp } from "@chalk/player";
import { AnswerStatus } from "@chalk/prop";
import { Board, type BoardEvent, prop } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { basicProps } from "./index";
import { choice, goal } from "./props";

/** What the board told, in order: signal names, and payloads. */
function hearing(board: Board) {
  const told: { signal: string; payload: unknown }[] = [];
  board.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push({ signal: e.signal, payload: e.payload });
  });
  return told;
}

const quiz = {
  prompt: { en: "Which is true about √2?", hi: "√2 के बारे में?" },
  options: [
    {
      id: "exact",
      label: { en: "1.41 exactly", hi: "ठीक 1.41" },
      feedback: { en: "Close, not exact.", hi: "पास है।" },
      misconception: "rootIsFiniteDecimal",
    },
    { id: "endless", label: { en: "Never ends", hi: "कभी नहीं रुकता" } },
  ],
  answer: "endless",
};

describe("choice", () => {
  it("checks the picked option, shows its feedback and raises the check", () => {
    const board = new Board(choice, quiz);
    const told = hearing(board);
    board.input("", "select", { option: "exact" });
    board.input("", "check", {});
    expect(board.read<typeof choice>()).toMatchObject({
      status: AnswerStatus.Wrong,
      attempts: 1,
      feedback: { en: "Close, not exact." },
    });
    expect(told).toEqual([
      {
        signal: "checked",
        payload: { status: AnswerStatus.Wrong, attempts: 1, isGraded: false, optionId: "exact" },
      },
      { signal: "wrong", payload: {} },
    ]);
  });

  it("refuses an answer key that isn't an option", () => {
    expect(() => new Board(choice, { ...quiz, answer: "nope" })).toThrow(/isn't an option/);
  });
});

describe("every basic prop, used the way a lesson uses it", () => {
  const options = [
    { id: "a", label: { en: "A", hi: "A" } },
    { id: "b", label: { en: "B", hi: "B" } },
  ];
  const prompt = { en: "Which?", hi: "कौन-सा?" };
  it.each([
    ["text", { text: { en: "Hello", hi: "नमस्ते" } }],
    ["choice", { prompt, options, answer: "a" }],
    ["goal", { prompt, about: "town", isMet: false }],
  ] as const)(
    "%s: every input says what it does, and every learner's action has one",
    (type, given) => {
      const module = basicProps.find((m) => m.def.type === type);
      if (module === undefined) throw new Error(`no ${type}`);
      expect(checkProp(module, [given])).toEqual([]);
    },
  );
});

describe("goal: the answer is another prop's state", () => {
  // What a board does for it: gives it whether the other prop is right now.
  const holder = prop({
    type: "goalHolder",
    describe: "test",
    variables: z.object({ isRight: z.boolean() }).strict(),
    start: { isRight: false },
    actions: {},
    children: { goal },
    give: { goal: { isMet: (me) => me.isRight } },
  });
  const ask = {
    goal: { prompt: { en: "Walk Riya there.", hi: "रिया को वहाँ ले जाओ।" }, about: "town" },
  };
  it("Check reads whether the prop is right now, and records the attempt", () => {
    const wrong = new Board(holder, { isRight: false, ...ask });
    const told = hearing(wrong);
    wrong.input("goal", "check", {});
    expect(wrong.read<typeof holder>().goal).toMatchObject({
      status: AnswerStatus.Wrong,
      attempts: 1,
    });
    expect(told.map((e) => e.signal)).toEqual(["checked", "wrong"]);
    const right = new Board(holder, { isRight: true, ...ask });
    right.input("goal", "check", {});
    expect(right.read<typeof holder>().goal).toMatchObject({
      status: AnswerStatus.Correct,
      attempts: 1,
    });
  });
});
