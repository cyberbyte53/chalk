import { localizedSchema } from "@chalk/content";
import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type DivisionStep, euclidSteps } from "./arithmetic";
import { button, option } from "./seen";

export const MAX_STICK = 100_000;

export const StickMeasureAction = {
  Lay: "lay",
  Keep: "keep",
  LayAll: "layAll",
  StartAgain: "startAgain",
  SetSticks: "setSticks",
  TryPiece: "tryPiece",
} as const;

export const StickMeasureDerived = {
  Pair: "pair",
  IsDone: "isDone",
  Hcf: "hcf",
} as const;

export const StickMeasureSignal = {
  Laid: "laid",
  Kept: "kept",
  Finished: "finished",
  Tried: "tried",
} as const;

const stickMeasureState = z
  .object({
    /** The two sticks the learner starts with. */
    stickA: z.number().int().min(1).max(MAX_STICK),
    stickB: z.number().int().min(1).max(MAX_STICK),
    /** How many times the leftover has been kept: which pair of sticks is in front of the learner. */
    rounds: z.number().int().min(0),
    /** Whether the shorter stick of this pair is laid along the longer, showing the leftover. */
    isLaid: z.boolean(),
    /** The piece length marked along every stick; 0 for none. */
    piece: z.number().int().min(0),
    /** The piece lengths the learner can try; none means no row of them. */
    pieceChoices: z.array(z.number().int().min(1)),
    /** Whether the learner can lay and keep (the buttons show). */
    canLay: z.boolean(),
    /** Whether the learner can type the two sticks. */
    isEditable: z.boolean(),
    /** Whether each step is written as a division, a = b × q + r, rather than in words. */
    showDivision: z.boolean(),
    /** Letters written on the sticks in place of numbers, for a proof about any two sticks. */
    letters: z
      .object({ long: z.string(), short: z.string(), left: z.string() })
      .strict()
      .nullable(),
    /**
     * When a piece is marked, a line per stick saying whether it fits, in the lesson's words; null
     * for none. Placeholders: {stick}, {piece}, {n} (whole pieces), {pieces} ("1 piece", "3 pieces"),
     * {gap} (what's left at the end).
     */
    fitWords: z.object({ fits: localizedSchema, leaves: localizedSchema }).strict().nullable(),
    /** Words from the lesson. Placeholders: {long}, {short}, {q}, {times} ("3 times"), {r}. */
    words: z
      .object({
        lay: localizedSchema,
        keep: localizedSchema,
        /** One step in words: "12 fits 1 time along 18, 6 left over". */
        step: localizedSchema,
        /** The last step in words: "6 fits 2 times along 12, nothing left over". */
        last: localizedSchema,
      })
      .strict(),
  })
  .strict();
export type StickMeasureState = z.infer<typeof stickMeasureState>;

const act = actionsFor<StickMeasureState>();
const none = z.object({}).strict();

const stepsOf = (s: StickMeasureState): DivisionStep[] => euclidSteps(s.stickA, s.stickB);
const stepNow = (s: StickMeasureState): DivisionStep | undefined => stepsOf(s)[s.rounds];
const isDoneOf = (s: StickMeasureState) => s.isLaid && stepNow(s)?.r === 0;

/** Fill a lesson's words: {long}, {short}, {q}, {r}. */
export function fillStep(text: string, step: DivisionStep): string {
  return text
    .replaceAll("{long}", String(step.a))
    .replaceAll("{short}", String(step.b))
    .replaceAll("{times}", step.q === 1 ? "1 time" : `${step.q} times`)
    .replaceAll("{q}", String(step.q))
    .replaceAll("{r}", String(step.r));
}

/** The steps written so far, in words or as divisions: every pair laid. */
export function workingOf(s: StickMeasureState, locale = "en"): string[] {
  const steps = stepsOf(s).slice(0, s.rounds + (s.isLaid ? 1 : 0));
  const word = (w: { en: string; hi?: string }) => w[locale as "en" | "hi"] ?? w.en;
  return steps.map((st) =>
    s.showDivision
      ? `${st.a} = ${st.b} × ${st.q} + ${st.r}`
      : fillStep(word(st.r === 0 ? s.words.last : s.words.step), st),
  );
}

/** Where a piece length leaves a gap along a stick: the length not measured, 0 when it fits. */
export function pieceGap(stick: number, piece: number): number {
  return stick % piece;
}

/** The sticks a piece is tried on now: the pair, and the leftover once laid. */
function measuredSticks(s: StickMeasureState): number[] {
  const step = stepNow(s);
  if (step === undefined) return [];
  return s.isLaid && step.r > 0 ? [step.a, step.b, step.r] : [step.a, step.b];
}

/** One line per stick for the marked piece, in the lesson's words; none without fitWords or a piece. */
export function fitLines(s: StickMeasureState, locale = "en"): { text: string; fits: boolean }[] {
  if (s.fitWords === null || s.piece <= 0) return [];
  const word = (w: { en: string; hi?: string }) => w[locale as "en" | "hi"] ?? w.en;
  const { fits, leaves } = s.fitWords;
  return measuredSticks(s).map((stick) => {
    const gap = pieceGap(stick, s.piece);
    const text = word(gap === 0 ? fits : leaves)
      .replaceAll("{stick}", String(stick))
      .replaceAll("{piece}", String(s.piece))
      .replaceAll(
        "{pieces}",
        Math.floor(stick / s.piece) === 1 ? "1 piece" : `${Math.floor(stick / s.piece)} pieces`,
      )
      .replaceAll("{n}", String(Math.floor(stick / s.piece)))
      .replaceAll("{gap}", String(gap));
    return { text, fits: gap === 0 };
  });
}

/** What the sticks show, in words. */
export function sticksText(s: StickMeasureState): string {
  const step = stepNow(s);
  if (step === undefined) return `${s.stickA} and ${s.stickB}`;
  const L = s.letters;
  const long = L === null ? String(step.a) : L.long;
  const short = L === null ? String(step.b) : L.short;
  const left = L === null ? String(step.r) : L.left;
  const parts = [`a stick of ${long} and a stick of ${short}`];
  if (s.isLaid) {
    parts.push(
      step.r === 0
        ? `${short} laid along ${long} ${step.q === 1 ? "1 time" : `${step.q} times`}: nothing left over`
        : `${short} laid along ${long} ${step.q === 1 ? "1 time" : `${step.q} times`}: ${left} left over`,
    );
  }
  if (s.piece > 0) {
    const sticks = measuredSticks(s);
    parts.push(
      `pieces of ${s.piece} marked: ${sticks
        .map((x) =>
          pieceGap(x, s.piece) === 0 ? `${x} fits` : `${x} leaves ${pieceGap(x, s.piece)}`,
        )
        .join(", ")}`,
    );
  }
  return parts.join("; ");
}

/**
 * Euclid's method with two sticks: lay the shorter along the longer as many times as it fits, keep
 * the leftover, and do the same with the shorter stick and the leftover, until nothing is left over.
 * The last stick laid measures both sticks: it is the longest piece that does, HCF(a, b). Piece
 * lengths can be marked along every stick, to see that a piece that measures both sticks measures
 * the leftover too.
 */
export const stickMeasure = defineProp({
  type: "stickMeasure",
  describe:
    "Two sticks, a and b. Lay the shorter along the longer as many times as it fits (a = b × q + r) and keep the leftover r; then do the same with b and r, until nothing is left over. The last stick laid is the longest piece that measures both a and b exactly: HCF(a, b). Marks of a chosen piece length show that a piece measuring both sticks measures the leftover too.",
  state: stickMeasureState,
  defaults: {
    stickA: 18,
    stickB: 12,
    rounds: 0,
    isLaid: false,
    piece: 0,
    pieceChoices: [],
    canLay: true,
    isEditable: false,
    showDivision: false,
    letters: null,
    fitWords: null,
    words: {
      lay: { en: "Lay {short} along {long}", hi: "{short} को {long} पर रखो" },
      keep: { en: "Keep the leftover", hi: "बचा हुआ टुकड़ा लो" },
      step: {
        en: "{short} fits {times} along {long}, {r} left over",
        hi: "{short}, {long} पर {q} बार आया, {r} बचा",
      },
      last: {
        en: "{short} fits {times} along {long}, nothing left over",
        hi: "{short}, {long} पर {q} बार आया, कुछ नहीं बचा",
      },
    },
  },
  inputs: ["canLay", "showDivision"],
  derived: {
    [StickMeasureDerived.Pair]: {
      describe: "The two sticks in front of the learner now, { long, short }",
      compute: (s) => {
        const step = stepNow(s);
        return step === undefined ? null : { long: step.a, short: step.b };
      },
    },
    [StickMeasureDerived.IsDone]: {
      describe: "The last stick laid fits exactly: nothing is left over",
      compute: isDoneOf,
    },
    [StickMeasureDerived.Hcf]: {
      describe: "The longest piece that measures both sticks: HCF(a, b)",
      compute: (s) => stepsOf(s).at(-1)?.b ?? Math.max(s.stickA, s.stickB),
    },
  },
  actions: {
    [StickMeasureAction.Lay]: act({
      describe:
        "Lay the shorter stick along the longer as many times as it fits (the learner's button)",
      byLearner: true,
      args: none,
      run: (s) => {
        const step = stepNow(s);
        if (s.isLaid || step === undefined) return set({});
        const emits: Emit[] = [{ signal: StickMeasureSignal.Laid, payload: { ...step } }];
        if (step.r === 0)
          emits.push({ signal: StickMeasureSignal.Finished, payload: { hcf: step.b } });
        return set({ isLaid: true }, ...emits);
      },
    }),
    [StickMeasureAction.Keep]: act({
      describe: "Keep the shorter stick and the leftover, and set the rest aside",
      byLearner: true,
      args: none,
      run: (s) => {
        const step = stepNow(s);
        if (!s.isLaid || step === undefined || step.r === 0) return set({});
        return set(
          { rounds: s.rounds + 1, isLaid: false },
          { signal: StickMeasureSignal.Kept, payload: { long: step.b, short: step.r } },
        );
      },
    }),
    [StickMeasureAction.LayAll]: act({
      describe: "Do every step at once",
      reveals: true,
      args: none,
      run: (s) => {
        const steps = stepsOf(s);
        const last = steps.at(-1);
        if (last === undefined || isDoneOf(s)) return set({});
        return set(
          { rounds: steps.length - 1, isLaid: true },
          { signal: StickMeasureSignal.Finished, payload: { hcf: last.b } },
        );
      },
    }),
    [StickMeasureAction.StartAgain]: act({
      describe: "Back to the two sticks the learner started with",
      byLearner: true,
      args: none,
      run: () => set({ rounds: 0, isLaid: false }),
    }),
    [StickMeasureAction.SetSticks]: act({
      describe: "Two new sticks",
      byLearner: true,
      args: z
        .object({
          stickA: z.number().int().min(1).max(MAX_STICK),
          stickB: z.number().int().min(1).max(MAX_STICK),
        })
        .strict(),
      run: (_s, a) =>
        set({ stickA: a.stickA, stickB: a.stickB, rounds: 0, isLaid: false, piece: 0 }),
    }),
    [StickMeasureAction.TryPiece]: act({
      describe: "Mark pieces of this length along every stick (0 takes the marks off)",
      byLearner: true,
      args: z.object({ length: z.number().int().min(0) }).strict(),
      run: (s, a) => {
        const step = stepNow(s);
        if (a.length === 0 || step === undefined) return set({ piece: a.length });
        return set(
          { piece: a.length },
          {
            signal: StickMeasureSignal.Tried,
            payload: {
              length: a.length,
              fitsBoth: step.a % a.length === 0 && step.b % a.length === 0,
            },
          },
        );
      },
    }),
  },
  signals: {
    [StickMeasureSignal.Laid]: {
      describe: "The shorter stick was laid along the longer; the division",
    },
    [StickMeasureSignal.Kept]: { describe: "The leftover was kept: the new `long` and `short`" },
    [StickMeasureSignal.Finished]: {
      describe: "Nothing was left over; `hcf` is the last stick laid",
    },
    [StickMeasureSignal.Tried]: { describe: "A piece `length` was marked; `fitsBoth` sticks" },
  },
  invariant: (s) =>
    s.rounds < Math.max(1, stepsOf(s).length) ? undefined : `only ${stepsOf(s).length} steps`,
  observe: (s) => {
    const done = isDoneOf(s);
    const step = stepNow(s);
    const working = workingOf(s);
    return {
      summary: `Euclid's method on sticks of ${s.stickA} and ${s.stickB}: ${sticksText(s)}`,
      elements: [
        ...(s.isEditable
          ? [
              { id: "a", value: s.stickA },
              { id: "b", value: s.stickB },
            ]
          : []),
        { id: "sticks", value: sticksText(s) },
        ...(working.length > 0 && s.letters === null && s.canLay
          ? [{ id: "working", value: working }]
          : []),
        ...(fitLines(s).length > 0
          ? [{ id: "fit", value: fitLines(s).map((line) => line.text) }]
          : []),
        ...(s.pieceChoices.length > 0
          ? s.pieceChoices.map((n) => option(`piece-${n}`, s.piece === n))
          : []),
        ...(s.canLay
          ? [
              s.isLaid && step !== undefined && step.r > 0
                ? button("keep")
                : button("lay", !s.isLaid),
              button("startAgain", s.rounds > 0 || s.isLaid),
            ]
          : []),
      ],
      ...(done ? {} : { hidden: { hcf: stepsOf(s).at(-1)?.b ?? 0 } }),
    };
  },
});
