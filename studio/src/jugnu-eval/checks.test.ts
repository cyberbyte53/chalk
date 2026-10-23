import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type JugnuTurn, scriptedProvider } from "@chalk/jugnu";
import { propDefs } from "@chalk/library";
import { describe, expect, it } from "vitest";
import cases from "../../evals/jugnu-cases.json";
import toolCases from "../../evals/jugnu-tool-cases.json";
import { loadReadings } from "../pronunciations";
import { validateLesson } from "../validate";
import { type EvalCase, evalCasesSchema } from "./cases";
import { CheckName, devanagariShare, runChecks } from "./checks";
import { type TurnRecord, runCase } from "./run";

const root = resolve(new URL(".", import.meta.url).pathname, "../../..");
const all = [...evalCasesSchema.parse(cases).cases, ...evalCasesSchema.parse(toolCases).cases];
const byId = (id: string): EvalCase => {
  const found = all.find((c) => c.id === id);
  if (found === undefined) throw new Error(`missing case ${id}`);
  return found;
};

const turn = (events: JugnuTurn["events"], extra: Partial<JugnuTurn> = {}): JugnuTurn => ({
  asked: "q",
  reply: events.flatMap((e) => (e.kind === "say" ? [e.text] : [])).join(" "),
  events,
  cues: [],
  options: [],
  model: "m",
  modelCalls: 1,
  usage: { input: 0, cached: 0, output: 0 },
  isFallback: false,
  ...extra,
});
const failed = (testCase: EvalCase, events: JugnuTurn["events"]) => {
  const turns: TurnRecord[] = [{ kind: "ask", text: "q", turn: turn(events), seconds: 1 }];
  return runChecks(testCase, turns)
    .filter((c) => !c.isPassed)
    .map((c) => c.name);
};
const say = (text: string) => ({ kind: "say" as const, text });

describe("Jugnu test cases", () => {
  it("are well formed, with unique ids and working patterns", () => {
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
    for (const c of all)
      for (const p of [...(c.expect.notSay ?? []), ...(c.expect.say ?? [])]) new RegExp(p, "iu");
  });

  it.each(["jugnu-boards", "jugnu-demos"])("the test boards are valid lessons (%s)", (name) => {
    const lesson = JSON.parse(
      readFileSync(resolve(root, `studio/evals/boards/lessons/${name}.json`), "utf8"),
    );
    const readings = loadReadings(resolve(root, "content/pronunciations.json"));
    expect(
      validateLesson(lesson, propDefs, readings).map((p) => `${p.where}: ${p.message}`),
    ).toEqual([]);
  });

  it("every case plays on its board: setup, turns, the student's moves", async () => {
    const model = scriptedProvider([{ say: "Let's think." }]);
    for (const testCase of all) {
      const result = await runCase(testCase, root, model, undefined);
      expect(result.error, testCase.id).toBeUndefined();
      expect(result.turns.length, testCase.id).toBeGreaterThanOrEqual(testCase.turns.length);
      // Nothing the student did in setup was refused, so the board is in the state the case means.
      expect(result.end.isPassed, testCase.id).toBe(false);
    }
  }, 60_000);
});

describe("Jugnu test checks", () => {
  const tooBig = byId("root2-too-big");

  it("passes good help", () => {
    expect(failed(tooBig, [say("1.7 × 1.7 = 2.89, more than 2. Left or right?")])).toEqual([]);
  });

  it("catches the answer given away, a missing fact and rambling", () => {
    expect(failed(tooBig, [say("It's 1.414, move there. More than 2 is too big.")])).toContain(
      CheckName.NoLeak,
    );
    expect(failed(tooBig, [say("Hmm, think again.")])).toContain(CheckName.SaysFact);
    expect(failed(tooBig, [say(`2.89 is more than 2. ${"word ".repeat(80)}`)])).toContain(
      CheckName.Short,
    );
  });

  it("catches doing the student's part, and actions that show the answer", () => {
    const meters = byId("meters-just-tell");
    const opened = failed(meters, [
      { kind: "act", prop: "circuit", action: "toggleSwitch", args: { component: "switchB" } },
      say("Look at the meter."),
    ]);
    expect(opened).toContain(CheckName.NotDo);
    const pressed = failed(meters, [
      {
        kind: "act",
        prop: "mainAfter",
        action: "check",
        args: {},
        refused: "mainAfter is the question: only the student answers it",
      },
      say("Try it."),
    ]);
    expect(pressed).toEqual(expect.arrayContaining([CheckName.HoldsLine, CheckName.NoRefusals]));
  });

  it("checks the calculator and the hand-back when a case asks for them", () => {
    const calc = byId("meters-how-calc");
    expect(failed(calc, [say("1.5 ÷ 10 = 0.15 A.")])).toContain(CheckName.Calculates);
    expect(
      failed(calc, [
        { kind: "calculate", expression: "1.5 / 10", result: 0.15 },
        say("1.5 ÷ 10 = 0.15 A."),
      ]),
    ).toEqual([]);
  });

  it("checks pointing and where the board ended", () => {
    const label = byId("tool-point-label");
    expect(failed(label, [say("Look here."), { kind: "point", prop: "squareLabel" }])).toEqual([]);
    expect(failed(label, [say("It's under the line.")])).toContain(CheckName.Points);
    const quiet = byId("tool-stay-quiet");
    expect(failed(quiet, [say("Go for it!"), { kind: "point", prop: "line" }])).toContain(
      CheckName.Points,
    );
    const show = byId("tool-show-try");
    const turns: TurnRecord[] = [
      { kind: "ask", text: "q", turn: turn([say("Watch.")]), seconds: 1 },
    ];
    const results = runChecks(show, turns, [{ expression: "line.marker > 2", holds: false }]);
    expect(results.find((c) => c.name === CheckName.BoardAfter)?.isPassed).toBe(false);
  });

  it("checks the language by script", () => {
    expect(devanagariShare("चलो साथ में सोचते हैं")).toBe(1);
    expect(devanagariShare("Let's think 2.89")).toBe(0);
    expect(failed(tooBig, [say("चलो सोचें: 2.89 तो 2 से ज़्यादा है")])).toContain(CheckName.Language);
  });
});
