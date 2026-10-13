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
  it("checks the picked option, shows its feedback and raises the commit", () => {
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
        payload: { status: AnswerStatus.Wrong, attempts: 1, optionId: "exact" },
      },
      { signal: QuestionSignal.Wrong },
    ]);
  });

  it("refuses an answer key that isn't an option", () => {
    expect(initialState(choiceDef, { ...stateOf(quiz), answer: "nope" }).isOk).toBe(false);
  });
});

describe("goal", () => {
  it("is right exactly when the lesson says the goal is met", () => {
    const def = asAnyProp(goal);
    const start = stateOf(
      initialState(def, {
        prompt: { en: "Find √2", hi: "√2 खोजो" },
        about: "line",
        concepts: ["sqrt-estimation"],
      }),
    );
    const miss = prepareAction(def, { ...start, isMet: false }, "check");
    const hit = prepareAction(def, { ...start, isMet: true }, "check");
    expect(miss.isOk && miss.effect.kind === EffectKind.Set && miss.effect.set.status).toBe(
      AnswerStatus.Wrong,
    );
    expect(hit.isOk && hit.effect.kind === EffectKind.Set && hit.effect.emit[0]?.payload).toEqual({
      status: AnswerStatus.Correct,
      attempts: 1,
      about: "line",
    });
  });
});
