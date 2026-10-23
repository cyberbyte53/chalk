import { localizedSchema } from "@chalk/content";
import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type DivisionStep, euclidSteps } from "./arithmetic";
import { button, count } from "./seen";

export const MAX_SIDE = 100_000;

export const SquareCutterAction = {
  Cut: "cut",
  CutAll: "cutAll",
  SetSides: "setSides",
  StartAgain: "startAgain",
  TryTile: "tryTile",
  ToggleZoom: "toggleZoom",
} as const;

export const SquareCutterDerived = {
  Steps: "steps",
  StepCount: "stepCount",
  Hcf: "hcf",
  IsDone: "isDone",
  Piece: "piece",
} as const;

export const SquareCutterSignal = { Cut: "cut", Finished: "finished", Tried: "tried" } as const;

const squareCutterState = z
  .object({
    /** The rectangle's two sides, in units. */
    sideA: z.number().int().min(1).max(MAX_SIDE),
    sideB: z.number().int().min(1).max(MAX_SIDE),
    /** How many rounds of cutting are done: each round cuts as many squares as fit. */
    cuts: z.number().int().min(0),
    /** The side of the trial tile laid over the whole floor; 0 for none. */
    tile: z.number().int().min(0),
    /** The tile sides the learner can try; none means no Try a tile row. */
    tileChoices: z.array(z.number().int().min(1)),
    /** Whether the learner can cut (the Cut and Start again buttons show). */
    canCut: z.boolean(),
    /** Whether the learner can type the two sides. */
    isEditable: z.boolean(),
    /** The words on the cut button, from the lesson. */
    cutLabel: localizedSchema,
    /**
     * Letters written on the drawing in place of numbers, for a proof about any floor: the long
     * side, the short side, the trial tile's side and the gap it leaves (after one cut, the strip
     * left is marked gap by short). Null writes the numbers.
     */
    letters: z
      .object({ long: z.string(), short: z.string(), tile: z.string(), gap: z.string() })
      .strict()
      .nullable(),
    /** Whether the learner chose to see the whole floor while a tiny piece would be zoomed in on. */
    isZoomedOut: z.boolean(),
    /** Words from the lesson: the zoom button's two labels, and the trial tile's lines. */
    words: z
      .object({
        showWhole: localizedSchema,
        zoomIn: localizedSchema,
        /** "Along {side}:" */
        along: localizedSchema,
        /** "gap of {r}" */
        gap: localizedSchema,
        fits: localizedSchema,
      })
      .strict(),
  })
  .strict();
export type SquareCutterState = z.infer<typeof squareCutterState>;

const act = actionsFor<SquareCutterState>();
const none = z.object({}).strict();

const stepsOf = (s: SquareCutterState): DivisionStep[] => euclidSteps(s.sideA, s.sideB);

/** How a t × t tile grid laid from one corner covers a long × short floor. */
export function tileCover(long: number, short: number, t: number) {
  const along = Math.floor(long / t) * t;
  const across = Math.floor(short / t) * t;
  return { along, across, fits: along === long && across === short };
}

/** A piece smaller than this share of the floor's area is zoomed in on. */
export const ZOOM_SHARE = 0.09;

/**
 * The piece the drawing zooms in on, as the index of its division step (the piece cut in that
 * round), or null when nothing is small enough to need it: the piece still to cut, or once it is all
 * squares, the last piece cut.
 */
export function zoomStep(s: SquareCutterState): number | null {
  if (s.cuts === 0) return null;
  const steps = stepsOf(s);
  const k = s.cuts >= steps.length ? steps.length - 1 : s.cuts;
  const step = steps[k];
  if (step === undefined) return null;
  return (step.a * step.b) / (s.sideA * s.sideB) < ZOOM_SHARE ? k : null;
}

/** The trial tile along one side, as a division: side = t × q + r. */
export function tileAlong(side: number, t: number): { q: number; r: number } {
  return { q: Math.floor(side / t), r: side % t };
}

/**
 * The lengths written on the drawing: the floor's sides, the trial tile's side and the gap it leaves
 * along the long side, and the piece still to cut. Letters in place of numbers when the page gives them.
 */
export function sidesText(s: SquareCutterState): string {
  const long = Math.max(s.sideA, s.sideB);
  const short = Math.min(s.sideA, s.sideB);
  const L = s.letters;
  const parts = [L === null ? `floor ${long} by ${short}` : `floor ${L.long} by ${L.short}`];
  if (s.tile > 0) {
    const { r } = tileAlong(long, s.tile);
    parts.push(L === null ? `tile ${s.tile}` : `tile ${L.tile}`);
    if (r > 0) parts.push(L === null ? `gap ${r}` : `gap ${L.gap}`);
  }
  const steps = euclidSteps(long, short);
  const next = steps[s.cuts];
  if (s.cuts > 0 && next !== undefined) {
    parts.push(
      L === null ? `piece left ${next.a} by ${next.b}` : `strip left ${L.gap} by ${L.short}`,
    );
  }
  return parts.join("; ");
}

/** What the trial tile shows, in words: "side 3: covers 15 × 6, a 1 × 6 strip uncovered". */
export function tileText(long: number, short: number, t: number): string {
  const { along, across, fits } = tileCover(long, short, t);
  if (fits) return `side ${t}: fits the ${long} × ${short} floor exactly`;
  const gaps: string[] = [];
  if (along < long) gaps.push(`a ${long - along} × ${short} strip`);
  if (across < short) gaps.push(`a ${along} × ${short - across} strip`);
  return `side ${t}: covers ${along} × ${across}, ${gaps.join(" and ")} uncovered`;
}

/** The rectangle still to cut after `cuts` rounds, as long side × short side; null once it's all squares. */
export function pieceAfter(s: SquareCutterState): { long: number; short: number } | null {
  const steps = stepsOf(s);
  const step = steps[s.cuts];
  return step === undefined ? null : { long: step.a, short: step.b };
}

/**
 * Euclid's algorithm as cutting a rectangle: cut the biggest squares that fit off the a × b
 * rectangle (a = b × q + r: q squares of side b, a strip r wide left), then do the same to the strip,
 * until the squares fit exactly. The side of those last squares is the HCF of a and b.
 */
export const squareCutter = defineProp({
  type: "squareCutter",
  describe:
    "A rectangle a × b cut into squares the way Euclid's algorithm divides: each round cuts as many b × b squares as fit (a = b × q + r) and leaves an r × b strip; the strip is cut the same way, until the squares fit exactly. The side of the last squares is HCF(a, b), and it measures every side before it.",
  state: squareCutterState,
  defaults: {
    sideA: 16,
    sideB: 6,
    cuts: 0,
    tile: 0,
    tileChoices: [],
    canCut: true,
    isEditable: false,
    cutLabel: { en: "Cut squares", hi: "वर्ग काटो" },
    letters: null,
    isZoomedOut: false,
    words: {
      showWhole: { en: "Show the whole floor", hi: "पूरा फ़र्श दिखाओ" },
      zoomIn: { en: "Zoom in", hi: "पास से दिखाओ" },
      along: { en: "Along {side}:", hi: "भुजा {side} पर:" },
      gap: { en: "gap of {r}", hi: "{r} ख़ाली" },
      fits: { en: "fits", hi: "ठीक बैठती है" },
    },
  },
  inputs: ["canCut"],
  derived: {
    [SquareCutterDerived.Steps]: {
      describe: "The divisions done so far, a = b × q + r, one per round of cutting",
      compute: (s) => stepsOf(s).slice(0, s.cuts),
    },
    [SquareCutterDerived.StepCount]: {
      describe: "How many rounds it takes to cut it all into squares",
      compute: (s) => stepsOf(s).length,
    },
    [SquareCutterDerived.Hcf]: {
      describe: "The side of the squares that fit exactly: HCF(a, b)",
      compute: (s) => stepsOf(s).at(-1)?.b ?? Math.max(s.sideA, s.sideB),
    },
    [SquareCutterDerived.IsDone]: {
      describe: "Every round is cut: it is all squares",
      compute: (s) => s.cuts >= stepsOf(s).length,
    },
    [SquareCutterDerived.Piece]: {
      describe: "The rectangle still to cut, { long, short }, or null when it's all squares",
      compute: pieceAfter,
    },
  },
  actions: {
    [SquareCutterAction.Cut]: act({
      describe: "Cut the next round of squares (the learner's Cut button)",
      byLearner: true,
      args: none,
      run: (s) => {
        const steps = stepsOf(s);
        const step = steps[s.cuts];
        if (step === undefined) return set({});
        const cuts = s.cuts + 1;
        const emits: Emit[] = [{ signal: SquareCutterSignal.Cut, payload: { ...step } }];
        if (cuts === steps.length) {
          emits.push({ signal: SquareCutterSignal.Finished, payload: { hcf: step.b } });
        }
        return set({ cuts, isZoomedOut: false }, ...emits);
      },
    }),
    [SquareCutterAction.CutAll]: act({
      describe: "Cut every round at once",
      reveals: true,
      args: none,
      run: (s) => {
        const steps = stepsOf(s);
        const last = steps.at(-1);
        if (s.cuts >= steps.length || last === undefined) return set({});
        return set(
          { cuts: steps.length },
          { signal: SquareCutterSignal.Finished, payload: { hcf: last.b } },
        );
      },
    }),
    [SquareCutterAction.SetSides]: act({
      describe: "A new rectangle, uncut",
      byLearner: true,
      args: z
        .object({
          sideA: z.number().int().min(1).max(MAX_SIDE),
          sideB: z.number().int().min(1).max(MAX_SIDE),
        })
        .strict(),
      run: (_s, a) => set({ sideA: a.sideA, sideB: a.sideB, cuts: 0, tile: 0 }),
    }),
    [SquareCutterAction.StartAgain]: act({
      describe: "Put the rectangle back together, uncut",
      byLearner: true,
      args: none,
      run: () => set({ cuts: 0, isZoomedOut: false }),
    }),
    [SquareCutterAction.ToggleZoom]: act({
      describe: "Zoom out to the whole floor, or back in on the tiny piece",
      byLearner: true,
      args: none,
      run: (s) => set({ isZoomedOut: !s.isZoomedOut }),
    }),
    [SquareCutterAction.TryTile]: act({
      describe:
        "Lay a grid of square tiles of this side over the whole floor, or 0 to take it away",
      byLearner: true,
      args: z.object({ side: z.number().int().min(0) }).strict(),
      run: (s, a) => {
        if (a.side === 0) return set({ tile: 0 });
        const long = Math.max(s.sideA, s.sideB);
        const short = Math.min(s.sideA, s.sideB);
        const { fits } = tileCover(long, short, a.side);
        return set(
          { tile: a.side },
          { signal: SquareCutterSignal.Tried, payload: { side: a.side, fits } },
        );
      },
    }),
  },
  signals: {
    [SquareCutterSignal.Cut]: { describe: "A round was cut: `a = b × q + r`" },
    [SquareCutterSignal.Finished]: { describe: "The squares fit exactly; `hcf` is their side" },
    [SquareCutterSignal.Tried]: {
      describe: "A trial tile was laid; `side`, and whether it `fits`",
    },
  },
  invariant: (s) =>
    s.cuts <= stepsOf(s).length
      ? undefined
      : `cuts ${s.cuts} is more than the ${stepsOf(s).length} rounds`,
  observe: (s) => {
    const steps = stepsOf(s);
    const done = steps.slice(0, s.cuts);
    const isDone = s.cuts >= steps.length;
    const long = Math.max(s.sideA, s.sideB);
    const short = Math.min(s.sideA, s.sideB);
    const piece = pieceAfter(s);
    const cut = done.map((st) => `${count(st.q, "square")} ${st.b} × ${st.b}`).join(", ");
    const rectangle =
      done.length === 0
        ? `${long} × ${short}, uncut`
        : `${long} × ${short}: ${cut} cut off; ${piece === null ? "nothing left over" : `a ${piece.long} × ${piece.short} piece left`}`;
    return {
      summary: `a ${long} × ${short} rectangle cut into the biggest squares that fit, ${count(s.cuts, "round")} cut${isDone ? ": it is all squares" : ""}`,
      elements: [
        { id: "rectangle", value: rectangle },
        { id: "sides", value: sidesText(s) },
        ...(done.length > 0 && s.letters === null
          ? [{ id: "working", value: done.map((st) => `${st.a} = ${st.b} × ${st.q} + ${st.r}`) }]
          : []),
        ...(s.isEditable
          ? [
              { id: "a", value: s.sideA },
              { id: "b", value: s.sideB },
            ]
          : []),
        ...(s.tileChoices.length > 0
          ? [
              {
                id: "tiles",
                value: `try a tile of side ${s.tileChoices.join(", ")}${s.tile > 0 ? `; ${s.tile} chosen` : ""}`,
              },
            ]
          : []),
        ...(s.tile > 0 ? [{ id: "tileGrid", value: tileText(long, short, s.tile) }] : []),
        ...(s.tile > 0 && s.letters === null
          ? [
              {
                id: "tileWorking",
                value: [long, short].map((side) => {
                  const { q, r } = tileAlong(side, s.tile);
                  return `along ${side}: ${side} = ${s.tile} × ${q} + ${r}, ${r === 0 ? "fits" : `gap of ${r}`}`;
                }),
              },
            ]
          : []),
        ...(zoomStep(s) !== null
          ? [
              {
                id: "zoom",
                value: s.isZoomedOut ? "showing the whole floor" : "zoomed in on the small piece",
              },
            ]
          : []),
        ...(s.canCut ? [button("cut", !isDone), button("startAgain", s.cuts > 0)] : []),
      ],
      // The side of the last squares, and how many rounds it takes, show only once it's cut.
      ...(isDone ? {} : { hidden: { hcf: steps.at(-1)?.b ?? long, rounds: steps.length } }),
    };
  },
});
