import type { BoardAt as At, Lesson } from "@chalk/content";
import { propDefs } from "@chalk/library";
import { testLesson } from "@chalk/library/test-lesson";
import { describe, expect, it } from "vitest";
import { loadReadings } from "./pronunciations";
import { validateLesson } from "./validate";

const readings = loadReadings(
  new URL("../../../authoring/pronunciations.json", import.meta.url).pathname,
);
const messages = (input: unknown) =>
  validateLesson(input, propDefs, readings).map((p) => `${p.where}: ${p.message}`);
const has = (input: unknown, pattern: RegExp) =>
  expect(messages(input).some((m) => pattern.test(m))).toBe(true);

// The test lesson, as plain data to change: boards by name, pieces by name.
// biome-ignore lint/suspicious/noExplicitAny: a lesson changed in place to break it
type Loose = Record<string, any>;
const fresh = () => testLesson() as unknown as Loose;
const board = (lesson: Loose, name: string): Loose =>
  lesson.boards.find((b: Loose) => b.name === name);
const piece = (lesson: Loose, boardName: string, name: string): Loose => {
  const walk = (p: Loose): Loose | undefined =>
    p.name === name ? p : (p.children ?? []).map(walk).find((x: Loose | undefined) => x);
  return walk(board(lesson, boardName).root) as Loose;
};

describe("validateLesson", () => {
  it("passes the test lesson", () => {
    expect(messages(testLesson() satisfies Lesson)).toEqual([]);
  });

  it("checks rich text everywhere: maths must typeset, in every language", () => {
    const bad = fresh();
    piece(bad, "share", "title").with.text.hi = "आधा $\\frac{1}{$";
    board(bad, "share").when.push({
      on: "board.started",
      do: { call: "board.show", args: { name: "left", note: { en: "$x^{2", hi: "ठीक" } } },
    });
    has(bad, /text\.hi: .*frac/);
    has(bad, /note\.en: .*never closed/);
  });

  it("checks a prop's starting state at its one door", () => {
    const bad = fresh();
    piece(bad, "share", "game").with.sweets = 2_000_000;
    has(bad, /game: .*sweets/);
  });

  it("catches unknown prop types and fields", () => {
    const bad = fresh();
    piece(bad, "share", "game").prop = "mirror";
    piece(bad, "race", "runners").with.rootOf = 2;
    has(bad, /unknown prop type "mirror"/);
    has(bad, /lapRace has no field "rootOf"/);
  });

  it("checks IS: an input of a real prop, real fields read, one writer", () => {
    const bad = fresh();
    board(bad, "share").is.push({ set: "game.sweets", to: () => 1 });
    board(bad, "share").is.push({ set: "box.text", to: (at: At) => at("game").nowhere });
    has(bad, /sweetShare.sweets can't be set by IS/);
    has(bad, /has no field "nowhere"/);
    has(bad, /2 IS rules set box.text/);
  });

  it("checks IS rules don't feed each other in a loop", () => {
    const bad = fresh();
    board(bad, "share").is.push(
      { set: "box.text", to: (at: At) => at("title").text },
      { set: "title.text", to: (at: At) => at("box").text },
    );
    has(bad, /feed each other in a loop/);
  });

  it("checks WHEN: real signals, actions and arguments", () => {
    const bad = fresh();
    board(bad, "share").when.push({
      on: "game.exploded",
      do: { call: "game.setSweets", args: { from: 1 } },
    });
    board(bad, "share").when.push({ on: "board.started", do: { call: "game.fly" } });
    has(bad, /no signal "exploded"/);
    has(bad, /game.setSweets\(value\)/);
    has(bad, /no action "fly"/);
  });

  it("checks arguments worked out from the board: real fields, and a value the action accepts", () => {
    const bad = fresh();
    board(bad, "share").when.push({
      on: "board.started",
      do: [
        { call: "game.setSweets", args: (at: At) => ({ value: at("game").nowhere }) },
        { call: "game.setSweets", args: () => ({ value: "far" }) },
      ],
    });
    has(bad, /no field "nowhere"/);
    has(bad, /game.setSweets\(value\)/);
    const fine = fresh();
    board(fine, "share").when.push({
      on: "board.started",
      do: {
        call: "game.setSweets",
        args: (at: At) => ({ value: (at("game").sweets as number) + 1 }),
      },
    });
    expect(messages(fine)).toEqual([]);
  });

  it("needs a way on: something must call board.pass", () => {
    const bad = fresh();
    const divide = board(bad, "divide");
    divide.when = divide.when.filter((r: Loose) => !JSON.stringify(r.do).includes("board.pass"));
    has(bad, /nothing ever calls board.pass/);
  });

  it("refuses answer-revealing actions on a board with a question", () => {
    // giveAll gives every round at once: the question's answer, on the board that asks it.
    const bad = fresh();
    board(bad, "share").when.push({ on: "board.started", do: { call: "game.giveAll" } });
    has(bad, /reveals the answer/);
    const fine = fresh();
    board(fine, "share").when.push({ on: "board.started", do: { call: "game.startAgain" } });
    expect(messages(fine)).toEqual([]);
  });

  it("refuses any character the voice can't read, not just known maths symbols", () => {
    const bad = fresh();
    piece(bad, "share", "title").with.text.en = "What is ∜16 → λ?";
    piece(bad, "share", "title").with.speak = null;
    has(bad, /can't read/);
    has(bad, /∜ → λ/);
  });

  it("only cares about the voice for lines a script actually says", () => {
    const quiet = fresh();
    piece(quiet, "share", "title").with.text.en = "What is ∜16 → λ?";
    piece(quiet, "share", "title").with.speak = null;
    const share = board(quiet, "share");
    share.when = share.when.filter((r: Loose) => !JSON.stringify(r.do).includes("title.say"));
    expect(messages(quiet)).toEqual([]);
  });
});
