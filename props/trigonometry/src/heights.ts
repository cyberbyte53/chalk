import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { PROBLEMS, Problem } from "./problems";

/**
 * A heights-and-distances problem (NCERT Ch 9), drawn to scale with its right triangles, lines of
 * sight, horizontals and angles of elevation or depression. The unknowns show as "?" (or h, x)
 * until the working, revealed one line at a time, reaches the answer.
 */

export const HeightsAction = { Next: "next", Reset: "reset" } as const;
export const HeightsSignal = { Stepped: "stepped", Solved: "solved" } as const;
export const HeightsDerived = {
  StepCount: "stepCount",
  Working: "working",
  Answer: "answer",
  Value: "value",
  IsSolved: "isSolved",
} as const;
export const HeightsPart = {
  Question: "question",
  Figure: "figure",
  Working: "working",
  Answer: "answer",
  Next: "next",
} as const;

const heightsState = z
  .object({
    problem: z.nativeEnum(Problem),
    /** Lines of working shown. */
    step: z.number().int().min(0).max(6),
    /** Write the question above the figure. */
    showQuestion: z.boolean(),
    /** Write the answer sentence once solved. */
    showAnswer: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type HeightsState = z.infer<typeof heightsState>;

export const stepCountOf = (s: Pick<HeightsState, "problem">): number =>
  PROBLEMS[s.problem].steps.length;
export const isSolvedOf = (s: HeightsState): boolean => s.step >= stepCountOf(s);

const act = actionsFor<HeightsState>();

export const heightFinder = defineProp({
  type: "heightFinder",
  describe:
    "A heights-and-distances problem from NCERT Ch 9 (or the Kite Hill mission) drawn to scale: the objects (tower, building, chimney, pole with flag, ladder, kite string, balloon, ships, river under a bridge, fort wall and temple), the observer's eye, the line of sight, the horizontal through the eye for angles of depression, the angles and right angles, and the known lengths, with the unknowns marked ? (or h, x). Next reveals the working one line at a time (choose the ratio, set up the equation, solve, add the eye height); at the last line the unknowns get their values and the answer is stated. Problems: Examples 1–7 (tower 15√3, electrician's ladder, chimney 30 m, flagstaff on a building, shadow 40 m longer, two buildings with depressions 30°/45°, river under a bridge), Exercise 9.1 Q5 (kite string), Q13 (two ships from a lighthouse), Q14 (balloon), and the mission's fort tower, kite on 60 m of string and temple across the river.",
  state: heightsState,
  defaults: {
    problem: Problem.Ex1Tower,
    step: 0,
    showQuestion: true,
    showAnswer: true,
    canStep: true,
  },
  inputs: ["showQuestion", "showAnswer", "canStep"],
  invariant: (s) => (s.step > stepCountOf(s) ? "more steps than the problem has" : undefined),
  derived: {
    [HeightsDerived.StepCount]: {
      describe: "Lines of working in this problem",
      compute: stepCountOf,
    },
    [HeightsDerived.Working]: {
      describe: "The working shown so far, as TeX lines",
      compute: (s) => PROBLEMS[s.problem].steps.slice(0, s.step),
    },
    [HeightsDerived.Answer]: {
      describe: "The answer as a sentence (English)",
      compute: (s) => PROBLEMS[s.problem].answer.en,
    },
    [HeightsDerived.Value]: {
      describe: "The main answer as a number (m)",
      compute: (s) => PROBLEMS[s.problem].value,
    },
    [HeightsDerived.IsSolved]: {
      describe: "Whether all the working is shown",
      compute: isSolvedOf,
    },
  },
  actions: {
    [HeightsAction.Next]: act({
      describe: "Show the next line of working; the last one solves the problem",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step >= stepCountOf(s)) return set({});
        const step = s.step + 1;
        const out: Emit[] = [{ signal: HeightsSignal.Stepped, payload: { step } }];
        if (step === stepCountOf(s))
          out.push({
            signal: HeightsSignal.Solved,
            payload: { problem: s.problem, value: PROBLEMS[s.problem].value },
          });
        return set({ step }, ...out);
      },
    }),
    [HeightsAction.Reset]: act({
      describe: "Hide the working again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: {
    [HeightsSignal.Stepped]: { describe: "A line of working was shown" },
    [HeightsSignal.Solved]: { describe: "The last line was shown; the payload has the answer (m)" },
  },
  observe: (s) => {
    const p = PROBLEMS[s.problem];
    const solved = isSolvedOf(s);
    const elements: Element[] = [];
    if (s.showQuestion) elements.push({ id: HeightsPart.Question, value: p.question.en });
    elements.push({
      id: HeightsPart.Figure,
      value: [
        ...p.arcs.map((a) => `angle at ${a.at} = ${a.text}`),
        ...p.lengths.map(
          (l) => `${l.a}${l.b} = ${solved && l.value !== undefined ? l.value : l.text}`,
        ),
      ].join("; "),
    });
    if (s.step > 0)
      elements.push({ id: HeightsPart.Working, value: p.steps.slice(0, s.step).join("; ") });
    if (solved && s.showAnswer) elements.push({ id: HeightsPart.Answer, value: p.answer.en });
    return {
      summary: `${p.title.en}. ${p.question.en}`,
      elements,
      hidden: solved ? undefined : { answer: p.answer.en },
    };
  },
  parts: (s) => [
    ...(s.showQuestion ? [HeightsPart.Question] : []),
    HeightsPart.Figure,
    ...(s.step > 0 ? [HeightsPart.Working] : []),
    ...(isSolvedOf(s) && s.showAnswer ? [HeightsPart.Answer] : []),
    ...(s.canStep ? [HeightsPart.Next] : []),
  ],
});
