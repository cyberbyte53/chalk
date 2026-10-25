import { readFileSync } from "node:fs";
import { propDefs } from "@chalk/library";
import { describe, expect, it } from "vitest";
import { loadReadings } from "./pronunciations";
import { validateLesson } from "./validate";

const lesson = JSON.parse(
  readFileSync(new URL("../evals/boards/where-is-root-2.json", import.meta.url), "utf8"),
);
const clone = () => structuredClone(lesson);
const readings = loadReadings(
  new URL("../../../content/pronunciations.json", import.meta.url).pathname,
);
const messages = (input: unknown) =>
  validateLesson(input, propDefs, readings).map((p) => `${p.where}: ${p.message}`);
const has = (input: unknown, pattern: RegExp) =>
  expect(messages(input).some((m) => pattern.test(m))).toBe(true);

describe("validateLesson", () => {
  it("passes the real √2 lesson", () => {
    expect(messages(lesson)).toEqual([]);
  });

  it("checks rich text everywhere: maths must typeset, in every language", () => {
    const bad = clone();
    bad.boards[0].root.children[0].with.text.hi = "आधा $\\frac{1}{$";
    bad.boards[0].when.push({
      on: "board.started",
      do: { call: "board.show", args: { name: "line", note: { en: "$x^{2", hi: "ठीक" } } },
    });
    has(bad, /text\.hi: .*frac/);
    has(bad, /note\.en: .*never closed/);
  });

  it("checks a prop's starting state at its one door", () => {
    const bad = clone();
    bad.boards[0].root.children[2].with.to = 2_000_000;
    has(bad, /line: .*to/);
  });

  it("catches unknown prop types and fields", () => {
    const bad = clone();
    bad.boards[0].root.children[2].prop = "mirror";
    bad.boards[1].root.children[1].with.rootOf = 2;
    has(bad, /unknown prop type "mirror"/);
    has(bad, /numberLine has no field "rootOf"/);
  });

  it("checks IS: an input of a real prop, real fields read, one writer", () => {
    const bad = clone();
    bad.boards[1].is.push({ set: "line.marker", to: "1.5" });
    bad.boards[1].is.push({ set: "guessRoot.isMet", to: "line.markerSquared > 2" });
    has(bad, /numberLine.marker can't be set by IS/);
    has(bad, /numberLine has no field "markerSquared"|has no field "markerSquared"/);
    has(bad, /2 IS rules set guessRoot.isMet/);
  });

  it("checks WHEN: real signals, actions and arguments", () => {
    const bad = clone();
    bad.boards[0].when.push({
      on: "line.exploded",
      do: { call: "line.zoomTo", args: { from: 1 } },
    });
    bad.boards[0].when.push({ on: "board.started", do: { call: "line.fly" } });
    has(bad, /no signal "exploded"/);
    has(bad, /line.zoomTo\(to\)/);
    has(bad, /no action "fly"/);
  });

  it("checks expression arguments: real fields, and a value the action accepts", () => {
    const bad = clone();
    bad.boards[1].when.push({
      on: "board.started",
      do: [
        { call: "line.moveMarker", args: { to: { expr: "line.nowhere" } } },
        { call: "line.moveMarker", args: { to: { expr: '"far"' } } },
      ],
    });
    has(bad, /no field "nowhere"/);
    has(bad, /line.moveMarker\(to\)/);
    const fine = clone();
    fine.boards[1].when.push({
      on: "board.started",
      do: { call: "line.moveMarker", args: { to: { expr: "line.from + 0.4" } } },
    });
    expect(messages(fine)).toEqual([]);
  });

  it("needs a way on: something must call board.pass", () => {
    const bad = clone();
    bad.boards[3].when = bad.boards[3].when.filter(
      (r: { on: string }) => r.on !== "whatIsRoot2.correct",
    );
    has(bad, /nothing ever calls board.pass/);
  });

  it("refuses answer-revealing actions on a board with a question", () => {
    const numberLine = propDefs.numberLine;
    if (numberLine === undefined) throw new Error("no numberLine in the library");
    const action = numberLine.actions.zoomIn;
    if (action === undefined) throw new Error("no zoomIn");
    const defs = {
      ...propDefs,
      numberLine: {
        ...numberLine,
        actions: { ...numberLine.actions, peek: { ...action, reveals: true } },
      },
    };
    const bad = clone();
    bad.boards[1].when.push({ on: "board.started", do: { call: "line.peek" } });
    expect(
      validateLesson(bad, defs, readings).some((p) => /reveals the answer/.test(p.message)),
    ).toBe(true);
    const fine = clone();
    fine.boards[1].when.push({ on: "board.started", do: { call: "line.zoomIn" } });
    expect(messages(fine)).toEqual([]);
  });

  it("refuses any character the voice can't read, not just known maths symbols", () => {
    const bad = clone();
    bad.boards[0].root.children[0].with.text.en = "What is ∜16 → λ?";
    has(bad, /can't read/);
    has(bad, /∜ → λ/);
  });

  it("only cares about the voice for lines a script actually says", () => {
    const quiet = clone();
    quiet.boards[0].root.children[0].with.text.en = "What is ∜16 → λ?";
    quiet.boards[0].when[0].do = quiet.boards[0].when[0].do.filter(
      (s: { call?: string }) => s.call !== "title.say",
    );
    expect(messages(quiet)).toEqual([]);
  });
});
