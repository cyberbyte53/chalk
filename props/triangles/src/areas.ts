import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, numText } from "./geometry";

/**
 * Areas of similar triangles (NCERT 6.5): the ratio of the areas is the square of the ratio of the
 * sides (Theorem 6.6).
 * - tiles: two similar triangles drawn on a grid of small equal triangles. Sides n and m units hold
 *   n² and m² small triangles, so sides n : m give areas n² : m².
 * - half: a line XY parallel to AC cuts triangle ABC (Example 9). ∆XBY ~ ∆ABC with ratio
 *   t = XB/AB, so ar(XBY) = t² × ar(ABC); the learner moves XY to find where it halves the area
 *   (t = 1/√2).
 * - midpoints: the triangle joining the midpoints of the sides is a quarter of the whole
 *   (Exercise 6.4 Q5, sides in ratio 1 : 2).
 */

export const AreaMode = { Tiles: "tiles", Half: "half", Midpoints: "midpoints" } as const;
export type AreaMode = (typeof AreaMode)[keyof typeof AreaMode];

export const AreaAction = {
  NudgeSmall: "nudgeSmall",
  NudgeBig: "nudgeBig",
  MoveLine: "moveLine",
  SetLine: "setLine",
  SetMode: "setMode",
} as const;
export const AreaSignal = { Changed: "changed", Halved: "halved" } as const;
export const AreaDerived = {
  SideRatio: "sideRatio",
  AreaRatio: "areaRatio",
  SmallTiles: "smallTiles",
  BigTiles: "bigTiles",
  Fraction: "fraction",
  IsHalf: "isHalf",
} as const;
export const AreaPart = {
  Small: "small",
  Big: "big",
  Line: "line",
  Readout: "readout",
  Controls: "controls",
} as const;

export const T_STEP = 0.01;

const areaState = z
  .object({
    mode: z.nativeEnum(AreaMode),
    /** Sides of the two triangles, in grid units (tiles mode). */
    small: z.number().int().min(1).max(8),
    big: z.number().int().min(1).max(8),
    /** XB ÷ AB (half mode). */
    t: z.number().min(0.2).max(0.99),
    /** Names A, B, C, X, Y (half mode) or A, B, C, D, E, F (midpoints: D, E, F the midpoints of AB, BC, CA). */
    names: z.array(z.string().min(1).max(3)).min(5).max(6),
    canSetSmall: z.boolean(),
    canSetBig: z.boolean(),
    canMoveLine: z.boolean(),
    /** Count the small triangles inside each (tiles mode). */
    showCounts: z.boolean(),
  })
  .strict();
export type AreaState = z.infer<typeof areaState>;

/** The ratio of the sides, small : big (tiles), XB : AB (half) or 1 : 2 (midpoints), as a number. */
export function sideRatioOf(s: Pick<AreaState, "mode" | "small" | "big" | "t">): number {
  if (s.mode === AreaMode.Tiles) return clean(s.small / s.big);
  if (s.mode === AreaMode.Half) return s.t;
  return 0.5;
}

/** The ratio of the areas: the square of the ratio of the sides. */
export const areaRatioOf = (s: Pick<AreaState, "mode" | "small" | "big" | "t">): number =>
  clean(sideRatioOf(s) ** 2);

/** Whether XY halves the area (to within a tap of 0.01 in t). */
export const isHalfOf = (s: Pick<AreaState, "mode" | "t">): boolean =>
  s.mode === AreaMode.Half && Math.abs(s.t * s.t - 0.5) < 0.008;

function changed(before: AreaState, after: AreaState): Emit[] {
  const out: Emit[] = [
    {
      signal: AreaSignal.Changed,
      payload: { sideRatio: sideRatioOf(after), areaRatio: areaRatioOf(after) },
    },
  ];
  if (isHalfOf(after) && !isHalfOf(before))
    out.push({ signal: AreaSignal.Halved, payload: { t: after.t } });
  return out;
}

const act = actionsFor<AreaState>();
const by = z.union([z.literal(1), z.literal(-1)]);

export const areaTiles = defineProp({
  type: "areaTiles",
  describe:
    "Areas of similar triangles (NCERT Theorem 6.6): the ratio of the areas of two similar triangles is the square of the ratio of their sides. Tiles mode draws two similar triangles on a grid of equal small triangles: sides of n and m units hold n² and m² small triangles. Half mode is Example 9: a line XY parallel to AC cuts ∆ABC, ∆XBY ~ ∆ABC with ratio XB/AB = t, so it has t² of the area; the learner moves the line to halve the area (t = 1/√2 ≈ 0.71). Midpoints mode shows the triangle joining the midpoints of the sides: a quarter of the whole.",
  state: areaState,
  defaults: {
    mode: AreaMode.Tiles,
    small: 2,
    big: 3,
    t: 0.5,
    names: ["A", "B", "C", "X", "Y"],
    canSetSmall: true,
    canSetBig: true,
    canMoveLine: true,
    showCounts: true,
  },
  inputs: ["canSetSmall", "canSetBig", "canMoveLine", "showCounts"],
  derived: {
    [AreaDerived.SideRatio]: {
      describe: "The ratio of corresponding sides, as a number",
      compute: sideRatioOf,
    },
    [AreaDerived.AreaRatio]: {
      describe: "The ratio of the areas (the square of the side ratio)",
      compute: areaRatioOf,
    },
    [AreaDerived.SmallTiles]: {
      describe: "Small triangles in the smaller triangle (tiles mode)",
      compute: (s) => s.small * s.small,
    },
    [AreaDerived.BigTiles]: {
      describe: "Small triangles in the bigger triangle (tiles mode)",
      compute: (s) => s.big * s.big,
    },
    [AreaDerived.Fraction]: {
      describe: "The part's area as a fraction of the whole (half mode: t²; midpoints: 1/4)",
      compute: (s) => (s.mode === AreaMode.Tiles ? null : areaRatioOf(s)),
    },
    [AreaDerived.IsHalf]: { describe: "Whether XY halves the area (half mode)", compute: isHalfOf },
  },
  actions: {
    [AreaAction.NudgeSmall]: act({
      describe: "Make the first triangle's side one unit longer (by: 1) or shorter (by: −1)",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canSetSmall || s.mode !== AreaMode.Tiles) return set({});
        const small = Math.min(8, Math.max(1, s.small + a.by));
        return small === s.small ? set({}) : set({ small }, ...changed(s, { ...s, small }));
      },
    }),
    [AreaAction.NudgeBig]: act({
      describe: "Make the second triangle's side one unit longer (by: 1) or shorter (by: −1)",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canSetBig || s.mode !== AreaMode.Tiles) return set({});
        const big = Math.min(8, Math.max(1, s.big + a.by));
        return big === s.big ? set({}) : set({ big }, ...changed(s, { ...s, big }));
      },
    }),
    [AreaAction.MoveLine]: act({
      describe: "Move XY away from B (by: 1) or towards B (by: −1) by 0.01 of AB (half mode)",
      byLearner: true,
      args: z.object({ by, size: z.union([z.literal(1), z.literal(5)]).optional() }).strict(),
      run: (s, a) => {
        if (!s.canMoveLine || s.mode !== AreaMode.Half) return set({});
        const t = clean(Math.min(0.99, Math.max(0.2, s.t + a.by * (a.size ?? 1) * T_STEP)));
        return t === s.t ? set({}) : set({ t }, ...changed(s, { ...s, t }));
      },
    }),
    [AreaAction.SetLine]: act({
      describe: "Put XY so that XB/AB = t (half mode)",
      args: z.object({ t: z.number().min(0.2).max(0.99) }).strict(),
      run: (s, a) => set({ t: a.t }, ...changed(s, { ...s, t: a.t })),
    }),
    [AreaAction.SetMode]: act({
      describe: "Show tiles, the halving line, or the midpoint triangle",
      args: z.object({ mode: z.nativeEnum(AreaMode) }).strict(),
      run: (_s, a) => set({ mode: a.mode }),
    }),
  },
  signals: {
    [AreaSignal.Changed]: {
      describe: "A side or the line moved; the payload has the side and area ratios",
    },
    [AreaSignal.Halved]: { describe: "XY has just come to halve the area" },
  },
  observe: (s) => {
    const n = s.names;
    const elements: Element[] = [];
    let summary: string;
    if (s.mode === AreaMode.Tiles) {
      elements.push(
        {
          id: AreaPart.Small,
          value: `side ${s.small}${s.showCounts ? `, ${s.small * s.small} small triangles` : ""}`,
        },
        {
          id: AreaPart.Big,
          value: `side ${s.big}${s.showCounts ? `, ${s.big * s.big} small triangles` : ""}`,
        },
        {
          id: AreaPart.Readout,
          value: `sides ${s.small} : ${s.big}, areas ${s.small * s.small} : ${s.big * s.big}`,
        },
      );
      summary = `Two similar triangles with sides ${s.small} and ${s.big} units on a grid of small triangles.`;
    } else if (s.mode === AreaMode.Half) {
      elements.push(
        {
          id: AreaPart.Line,
          value: `${n[3]}${n[4]} ∥ ${n[0]}${n[2]}, ${n[3]}${n[1]}/${n[0]}${n[1]} = ${numText(s.t)}`,
        },
        {
          id: AreaPart.Readout,
          value: `ar(${n[3]}${n[1]}${n[4]}) = ${numText(s.t * s.t, 3)} of ar(${n[0]}${n[1]}${n[2]})`,
        },
      );
      summary = `Triangle ${n[0]}${n[1]}${n[2]} cut by ${n[3]}${n[4]} parallel to ${n[0]}${n[2]}, with ${n[3]}${n[1]}/${n[0]}${n[1]} = ${numText(s.t)}.`;
    } else {
      elements.push(
        {
          id: AreaPart.Small,
          value: `triangle ${n[3]}${n[4]}${n[5] ?? "F"} joining the midpoints`,
        },
        {
          id: AreaPart.Readout,
          value: `ar(${n[3]}${n[4]}${n[5] ?? "F"}) : ar(${n[0]}${n[1]}${n[2]}) = 1 : 4`,
        },
      );
      summary = `Triangle ${n[0]}${n[1]}${n[2]} with the midpoints of its sides joined: four equal triangles.`;
    }
    if (
      (s.mode === AreaMode.Tiles && (s.canSetSmall || s.canSetBig)) ||
      (s.mode === AreaMode.Half && s.canMoveLine)
    )
      elements.push({ id: AreaPart.Controls, value: "controls" });
    return { summary, elements };
  },
  parts: (s) => {
    const out: string[] = s.mode === AreaMode.Half ? [AreaPart.Line] : [AreaPart.Small];
    if (s.mode === AreaMode.Tiles) out.push(AreaPart.Big);
    out.push(AreaPart.Readout);
    if (
      (s.mode === AreaMode.Tiles && (s.canSetSmall || s.canSetBig)) ||
      (s.mode === AreaMode.Half && s.canMoveLine)
    )
      out.push(AreaPart.Controls);
    return out;
  },
});
