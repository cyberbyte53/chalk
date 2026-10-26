import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { nextRandom, wordsSchema } from "./chance";
import { clean, fracText, numText, simplify } from "./numbers";

/**
 * Beyond counting, NCERT 15.2 Examples 10* and 11* (not for the examination): when the outcomes
 * fill a stretch of the number line or a region, the probability is a ratio of lengths or areas.
 * Random points are dropped (seeded), and the fraction that land in the favourable part settles
 * towards that ratio.
 */

export const RegionAction = { Drop: "drop", Reset: "reset", ShowAnswer: "showAnswer" } as const;
export const RegionSignal = { Dropped: "dropped", Answered: "answered" } as const;
export const RegionDerived = {
  Ratio: "ratio",
  RatioText: "ratioText",
  Empirical: "empirical",
} as const;
export const RegionPart = {
  Picture: "picture",
  Counts: "counts",
  Drop: "drop",
  Answer: "answer",
} as const;

export const RegionMode = { Line: "line", Rect: "rect" } as const;
export type RegionMode = (typeof RegionMode)[keyof typeof RegionMode];

/** Points drawn on the picture (the rest are only counted). */
export const DRAWN = 400;

const regionState = z
  .object({
    mode: z.nativeEnum(RegionMode),
    /** The whole: a length (line) or width × height (rect), in the content's units. */
    width: z.number().positive(),
    height: z.number().positive(),
    /** The favourable part, inside the whole (y0, y1 ignored for a line). */
    x0: z.number().min(0),
    x1: z.number().min(0),
    y0: z.number().min(0),
    y1: z.number().min(0),
    unit: wordsSchema,
    wholeLabel: wordsSchema,
    partLabel: wordsSchema,
    trials: z.number().int().min(0).max(100000),
    hits: z.number().int().min(0).max(100000),
    /** The seed the drawn points start from, and the seed now. */
    startSeed: z.number().int().min(0),
    seed: z.number().int().min(0),
    batches: z.array(z.number().int().min(1).max(10000)).min(1).max(4),
    isAnswerShown: z.boolean(),
    canDrop: z.boolean(),
  })
  .strict();
export type RegionState = z.infer<typeof regionState>;

/** One random point in the whole (y = 0 on a line). */
export function pointAt(s: Pick<RegionState, "mode" | "width" | "height">, seed: number) {
  const a = nextRandom(seed);
  if (s.mode === RegionMode.Line) return { x: a.value * s.width, y: 0, seed: a.seed };
  const b = nextRandom(a.seed);
  return { x: a.value * s.width, y: b.value * s.height, seed: b.seed };
}

export const isInside = (s: RegionState, x: number, y: number) =>
  x >= s.x0 && x <= s.x1 && (s.mode === RegionMode.Line || (y >= s.y0 && y <= s.y1));

/** The points from startSeed, up to DRAWN of them. */
export function drawnPoints(s: RegionState): { x: number; y: number; isIn: boolean }[] {
  const out: { x: number; y: number; isIn: boolean }[] = [];
  let seed = s.startSeed;
  for (let i = 0; i < Math.min(s.trials, DRAWN); i++) {
    const p = pointAt(s, seed);
    seed = p.seed;
    out.push({ x: p.x, y: p.y, isIn: isInside(s, p.x, p.y) });
  }
  return out;
}

const partSize = (s: RegionState) => (s.x1 - s.x0) * (s.mode === RegionMode.Rect ? s.y1 - s.y0 : 1);
const wholeSize = (s: RegionState) => s.width * (s.mode === RegionMode.Rect ? s.height : 1);
export const ratioOf = (s: RegionState) => clean(partSize(s) / wholeSize(s));

/** The ratio as a fraction when the sizes are tidy (to 1 decimal), else a decimal. */
export function ratioText(s: RegionState): string {
  const p = Math.round(partSize(s) * 100);
  const w = Math.round(wholeSize(s) * 100);
  return Math.abs(p / 100 - partSize(s)) < 1e-9 && Math.abs(w / 100 - wholeSize(s)) < 1e-9
    ? fracText(simplify(p, w))
    : numText(ratioOf(s), 3);
}

/** The working: how big the favourable part and the whole are, and the ratio. */
export function answerLines(s: RegionState, locale = "en"): string[] {
  const say = (w: { en: string; hi: string }) => (locale === "hi" ? w.hi : w.en);
  const part = numText(partSize(s));
  const whole = numText(wholeSize(s));
  const sizes =
    s.mode === RegionMode.Line
      ? [
          `${say(s.partLabel)}: ${numText(s.x1 - s.x0)} ${say(s.unit)}`,
          `${say(s.wholeLabel)}: ${whole} ${say(s.unit)}`,
        ]
      : [
          `${say(s.partLabel)}: ${numText(s.x1 - s.x0)} × ${numText(s.y1 - s.y0)} = ${part} ${say(s.unit)}`,
          `${say(s.wholeLabel)}: ${numText(s.width)} × ${numText(s.height)} = ${whole} ${say(s.unit)}`,
        ];
  return [...sizes, `P = ${part} ÷ ${whole} = ${ratioText(s)}`];
}

const act = actionsFor<RegionState>();

export const regionChance = defineProp({
  type: "regionChance",
  describe:
    "Probability as a ratio of lengths or areas (NCERT 15.2, Examples 10* and 11*, not for the examination). A line of some length, or a rectangle, holds a favourable stretch or patch; random points are dropped 1, 10, 100 or 1000 at a time (seeded) and the fraction landing in the favourable part is counted. It settles towards favourable length ÷ whole length (or area ÷ area), which can be shown.",
  state: regionState,
  defaults: {
    mode: RegionMode.Line,
    width: 2,
    height: 1,
    x0: 0,
    x1: 0.5,
    y0: 0,
    y1: 1,
    unit: { en: "min", hi: "मिनट" },
    wholeLabel: { en: "0 to 2 minutes", hi: "0 से 2 मिनट" },
    partLabel: { en: "first half-minute", hi: "पहला आधा मिनट" },
    trials: 0,
    hits: 0,
    startSeed: 11,
    seed: 11,
    batches: [1, 10, 100, 1000],
    isAnswerShown: false,
    canDrop: true,
  },
  inputs: ["canDrop"],
  invariant: (s) => {
    if (s.x0 >= s.x1 || s.x1 > s.width) return "the favourable stretch must lie inside the whole";
    if (s.mode === RegionMode.Rect && (s.y0 >= s.y1 || s.y1 > s.height))
      return "the favourable patch must lie inside the whole";
    if (s.hits > s.trials) return "more hits than trials";
    return undefined;
  },
  derived: {
    [RegionDerived.Ratio]: { describe: "Favourable ÷ whole, as a decimal", compute: ratioOf },
    [RegionDerived.RatioText]: {
      describe: "Favourable ÷ whole, as a fraction where tidy",
      compute: ratioText,
    },
    [RegionDerived.Empirical]: {
      describe: "The fraction of dropped points in the favourable part",
      compute: (s) => (s.trials === 0 ? 0 : clean(s.hits / s.trials)),
    },
  },
  actions: {
    [RegionAction.Drop]: act({
      describe: "Drop this many more random points (one of the batch sizes)",
      byLearner: true,
      args: z.object({ times: z.number().int().min(1).max(10000) }).strict(),
      run: (s, a) => {
        if (!s.canDrop || !s.batches.includes(a.times)) return set({});
        let seed = s.seed;
        let hits = s.hits;
        const n = Math.min(a.times, 100000 - s.trials);
        for (let i = 0; i < n; i++) {
          const p = pointAt(s, seed);
          seed = p.seed;
          if (isInside(s, p.x, p.y)) hits += 1;
        }
        const trials = s.trials + n;
        return set(
          { trials, hits, seed },
          {
            signal: RegionSignal.Dropped,
            payload: { trials, hits, fraction: clean(hits / Math.max(1, trials)) },
          },
        );
      },
    }),
    [RegionAction.Reset]: act({
      describe: "Clear the points (the random sequence carries on)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ trials: 0, hits: 0, startSeed: s.seed }),
    }),
    [RegionAction.ShowAnswer]: act({
      describe: "Show the probability as favourable ÷ whole",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        s.isAnswerShown
          ? set({})
          : set(
              { isAnswerShown: true },
              { signal: RegionSignal.Answered, payload: { ratio: ratioOf(s) } },
            ),
    }),
  },
  signals: {
    [RegionSignal.Dropped]: {
      describe: "Points were dropped; the payload has trials, hits and the fraction",
    },
    [RegionSignal.Answered]: { describe: "The ratio was shown" },
  },
  observe: (s) => {
    const elements: Element[] = [
      {
        id: RegionPart.Picture,
        value:
          s.mode === RegionMode.Line
            ? `a line ${s.wholeLabel.en}, the stretch ${numText(s.x0)} to ${numText(s.x1)} is the ${s.partLabel.en}`
            : `a ${numText(s.width)} by ${numText(s.height)} region with ${s.partLabel.en} from x ${numText(s.x0)}–${numText(
                s.x1,
              )}, y ${numText(s.y0)}–${numText(s.y1)}`,
      },
      {
        id: RegionPart.Counts,
        value: `${s.trials} points, ${s.hits} in the ${s.partLabel.en}, fraction ${numText(
          s.trials === 0 ? 0 : s.hits / s.trials,
          3,
        )}`,
      },
    ];
    if (s.isAnswerShown)
      elements.push({
        id: RegionPart.Answer,
        value: answerLines(s).join("; "),
      });
    return {
      summary: `Probability by ${s.mode === RegionMode.Line ? "length" : "area"}: ${s.partLabel.en}.`,
      elements,
    };
  },
  parts: (s) => [
    RegionPart.Picture,
    RegionPart.Counts,
    ...(s.canDrop ? [RegionPart.Drop] : []),
    ...(s.isAnswerShown ? [RegionPart.Answer] : []),
  ],
});
