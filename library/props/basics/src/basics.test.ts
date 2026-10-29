import { checkProp } from "@chalk/player";
import {
  AnswerStatus,
  EffectKind,
  QuestionSignal,
  asAnyProp,
  initialState,
  prepareAction,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { choice } from "./choice";
import { goal } from "./goal";
import { basicProps } from "./index";
import { multiChoice } from "./multi-choice";
import { firstWrong, orderSteps } from "./order-steps";

const choiceDef = asAnyProp(choice);
const quiz = initialState(choiceDef, {
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
  concepts: ["irrational-numbers"],
});

function stateOf(result: typeof quiz) {
  if (!result.isOk) throw new Error(result.errors.join("; "));
  return result.state;
}

describe("choice", () => {
  it("checks the picked option, shows its feedback and raises the check", () => {
    const picked = { ...stateOf(quiz), selected: "exact" };
    const result = prepareAction(choiceDef, picked, "check");
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("expected a set");
    expect(result.effect.set).toMatchObject({
      status: AnswerStatus.Wrong,
      attempts: 1,
      feedback: { en: "Close, not exact." },
    });
    expect(result.effect.emit).toEqual([
      {
        signal: QuestionSignal.Checked,
        payload: { status: AnswerStatus.Wrong, attempts: 1, isGraded: false, optionId: "exact" },
      },
      { signal: QuestionSignal.Wrong },
    ]);
  });

  it("refuses an answer key that isn't an option", () => {
    expect(initialState(choiceDef, { ...stateOf(quiz), answer: "nope" }).isOk).toBe(false);
  });
});

describe("multiChoice", () => {
  const def = asAnyProp(multiChoice);
  const sizes = stateOf(
    initialState(def, {
      prompt: { en: "Which tiles fit?", hi: "कौन-सी?" },
      options: ["2", "3", "4", "6"].map((id) => ({
        id,
        label: { en: id, hi: id },
        ...(id === "4" ? { feedback: { en: "4 leaves a gap.", hi: "जगह बचती है।" } } : {}),
      })),
      answers: ["2", "3", "6"],
      missing: { en: "Some are missing.", hi: "कुछ छूटे।" },
    }),
  );
  const check = (selected: string[]) => {
    const result = prepareAction(def, { ...sizes, selected }, "check");
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("expected a set");
    return result.effect.set;
  };
  it("is right only with every right option and no wrong one", () => {
    expect(check(["6", "2", "3"])).toMatchObject({ status: AnswerStatus.Correct });
    expect(check(["2", "3", "4", "6"])).toMatchObject({
      status: AnswerStatus.Wrong,
      feedback: { en: "4 leaves a gap." },
    });
    expect(check(["2", "6"])).toMatchObject({
      status: AnswerStatus.Wrong,
      feedback: { en: "Some are missing." },
    });
  });
  it("a tap picks or unpicks, and doesn't check", () => {
    const result = prepareAction(def, { ...sizes, selected: ["2"] }, "toggle", { option: "2" });
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("expected a set");
    expect(result.effect.set).toMatchObject({ selected: [] });
    expect(result.effect.emit).toEqual([]);
  });
});

describe("orderSteps", () => {
  const def = asAnyProp(orderSteps);
  const proof = stateOf(
    initialState(def, {
      prompt: { en: "Order the proof", hi: "क्रम" },
      steps: ["c", "a", "b"].map((id) => ({
        id,
        label: { en: id, hi: id },
        ...(id === "c" ? { hint: { en: "c needs b first.", hi: "पहले b।" } } : {}),
      })),
      answers: [
        ["a", "b", "c"],
        ["b", "a", "c"],
      ],
    }),
  );
  const check = (placed: string[]) => {
    const result = prepareAction(def, { ...proof, placed }, "check");
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("expected a set");
    return result.effect.set;
  };
  it("accepts any right order, and a misplaced step gives its hint", () => {
    expect(check(["a", "b", "c"])).toMatchObject({ status: AnswerStatus.Correct });
    expect(check(["b", "a", "c"])).toMatchObject({ status: AnswerStatus.Correct });
    expect(check(["a", "c", "b"])).toMatchObject({
      status: AnswerStatus.Wrong,
      feedback: { en: "c needs b first." },
    });
  });
  it("finds the first line that leaves every right order", () => {
    expect(firstWrong(["a", "c", "b"], [["a", "b", "c"]])).toBe(1);
    expect(firstWrong(["a", "b", "c"], [["a", "b", "c"]])).toBe(-1);
  });
});

describe("every basic prop, used the way a lesson uses it", () => {
  const options = [
    { id: "a", label: { en: "A", hi: "A" } },
    { id: "b", label: { en: "B", hi: "B" } },
  ];
  const steps = [
    { id: "one", label: { en: "One", hi: "एक" } },
    { id: "two", label: { en: "Two", hi: "दो" } },
  ];
  const prompt = { en: "Which?", hi: "कौन-सा?" };
  it.each([
    ["text", { text: { en: "Hello", hi: "नमस्ते" } }],
    ["choice", { prompt, options, answer: "a" }],
    ["multiChoice", { prompt, options, answers: ["a"] }],
    ["orderSteps", { prompt, steps, answers: [["one", "two"]] }],
    ["goal", { prompt, about: "town" }],
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
  const def = asAnyProp(goal);
  const ask = stateOf(
    initialState(def, {
      prompt: { en: "Walk Riya there.", hi: "रिया को वहाँ ले जाओ।" },
      about: "town",
    }),
  );
  const check = (state: typeof ask) => {
    const prepared = prepareAction(def, state, "check", {});
    if (!prepared.isOk || prepared.effect.kind !== EffectKind.Set) throw new Error("check refused");
    return prepared.effect;
  };
  it("Check reads whether the prop is right now, and records the attempt", () => {
    const wrong = check({ ...ask, isMet: false });
    expect(wrong.set).toMatchObject({ status: AnswerStatus.Wrong, attempts: 1 });
    expect(wrong.emit.map((e) => e.signal)).toEqual([QuestionSignal.Checked, QuestionSignal.Wrong]);
    const right = check({ ...ask, isMet: true, attempts: 1 });
    expect(right.set).toMatchObject({ status: AnswerStatus.Correct, attempts: 2 });
  });
  it("whether it's right is known but never on screen", () => {
    expect(goal.offScreen).toContain("isMet");
  });
});
