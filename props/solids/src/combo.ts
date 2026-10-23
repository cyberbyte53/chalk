import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { ComboKind, type Group, comboOf, totalOf } from "./combos";
import { clean, withUnit } from "./solids";

/**
 * A combination of solids from the chapter (a lattu, a capsule, a tent, a juice glass, …). The
 * parts can be pulled apart to see what each one is, then joined, which hides the faces that
 * touch. Under the picture, the surface area (or volume) is built up as a sum of the parts' own
 * formulas, one term at a time, with the faces that are hidden or the hollows cut out taken away.
 */

export const ComboAction = {
  Split: "split",
  Reveal: "reveal",
  Show: "show",
  SetKind: "setKind",
} as const;
export const ComboSignal = {
  Split: "split",
  Revealed: "revealed",
  Done: "done",
  Shown: "shown",
} as const;
export const ComboDerived = {
  Totals: "totals",
  TermCount: "termCount",
} as const;
export const ComboPart = {
  Picture: "picture",
  Terms: "terms",
  Split: "split",
  Reveal: "reveal",
  Measures: "measures",
} as const;

/** Which sums are shown: the surface areas or the volumes. */
export const Sum = { Surface: "surface", Volume: "volume" } as const;
export type Sum = (typeof Sum)[keyof typeof Sum];

const comboState = z
  .object({
    kind: z.nativeEnum(ComboKind),
    /** The parts drawn pulled apart along the axis. */
    isApart: z.boolean(),
    /** The sums shown under the picture. */
    sum: z.nativeEnum(Sum),
    /** How many terms of the sums are shown, counting across the groups in order. */
    revealed: z.number().int().min(0).max(40),
    showMarks: z.boolean(),
    canSplit: z.boolean(),
    canReveal: z.boolean(),
    /** Let the learner switch between surface and volume (when the combination has both). */
    canSwitch: z.boolean(),
  })
  .strict();
export type ComboState = z.infer<typeof comboState>;

/** The groups for the sum shown, or [] when the combination has none of that kind. */
export function groupsOf(s: Pick<ComboState, "kind" | "sum">): Group[] {
  const c = comboOf(s.kind);
  return (s.sum === Sum.Surface ? c.surface : c.volume) ?? [];
}

export function termCount(s: Pick<ComboState, "kind" | "sum">): number {
  return groupsOf(s).reduce((n, g) => n + g.terms.length, 0);
}

/** The sums the combination has. */
export function sumsOf(kind: ComboKind): Sum[] {
  const c = comboOf(kind);
  return [...(c.surface ? [Sum.Surface] : []), ...(c.volume ? [Sum.Volume] : [])];
}

function groupText(g: Group): string {
  const terms = g.terms
    .map(
      (t, i) => `${i === 0 ? (t.sign < 0 ? "− " : "") : t.sign < 0 ? " − " : " + "}${t.label.en}`,
    )
    .join("");
  return `${g.label.en} = ${terms} = ${withUnit(totalOf(g), g.unit, g.power)}`;
}

const act = actionsFor<ComboState>();

export const comboBuilder = defineProp({
  type: "comboBuilder",
  describe:
    "A solid made of basic solids joined along one axis (a cone on a hemisphere, a cylinder with hemispherical ends, a cone on a cylinder, a cube with a hemisphere on top, a cylinder with a cone or hemispheres hollowed out, …), from the chapter's examples and exercises. The parts can be pulled apart and joined again; joined faces disappear from the surface. Under the picture, the surface area or volume asked for is built up term by term as a sum of the parts' own formulas, with faces that touch or hollows cut out taken away, and the total.",
  state: comboState,
  defaults: {
    kind: ComboKind.Lattu,
    isApart: false,
    sum: Sum.Surface,
    revealed: 0,
    showMarks: true,
    canSplit: true,
    canReveal: true,
    canSwitch: false,
  },
  inputs: ["showMarks", "canSplit", "canReveal", "canSwitch"],
  invariant: (s) => {
    if (groupsOf(s).length === 0) return `this combination has no ${s.sum} sums`;
    if (s.revealed > termCount(s)) return "more terms revealed than there are";
    return undefined;
  },
  derived: {
    [ComboDerived.Totals]: {
      describe: "The total of each sum shown (surface areas or volumes), in order",
      compute: (s) => groupsOf(s).map((g) => clean(totalOf(g))),
    },
    [ComboDerived.TermCount]: {
      describe: "How many terms the sums have altogether",
      compute: (s) => termCount(s),
    },
  },
  actions: {
    [ComboAction.Split]: act({
      describe: "Pull the parts apart (apart: true) or join them (apart: false)",
      byLearner: true,
      args: z.object({ apart: z.boolean() }).strict(),
      run: (s, a) =>
        !s.canSplit || a.apart === s.isApart
          ? set({})
          : set({ isApart: a.apart }, { signal: ComboSignal.Split, payload: { isApart: a.apart } }),
    }),
    [ComboAction.Reveal]: act({
      describe: "Show the next term of the sum (and the total once all are shown)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const n = termCount(s);
        if (!s.canReveal || s.revealed >= n) return set({});
        const revealed = s.revealed + 1;
        const emits: Emit[] = [{ signal: ComboSignal.Revealed, payload: { revealed, of: n } }];
        if (revealed === n)
          emits.push({
            signal: ComboSignal.Done,
            payload: { revealed, of: n },
          });
        return set({ revealed }, ...emits);
      },
    }),
    [ComboAction.Show]: act({
      describe: "Show the surface-area sums or the volume sums (starting from no terms)",
      byLearner: true,
      args: z.object({ sum: z.nativeEnum(Sum) }).strict(),
      run: (s, a) =>
        !s.canSwitch || a.sum === s.sum || !sumsOf(s.kind).includes(a.sum)
          ? set({})
          : set(
              { sum: a.sum, revealed: 0 },
              { signal: ComboSignal.Shown, payload: { sum: a.sum } },
            ),
    }),
    [ComboAction.SetKind]: act({
      describe: "Show a different combination (its first sum, no terms shown, joined)",
      args: z.object({ kind: z.nativeEnum(ComboKind) }).strict(),
      run: (_s, a) =>
        set({ kind: a.kind, sum: sumsOf(a.kind)[0] ?? Sum.Surface, revealed: 0, isApart: false }),
    }),
  },
  signals: {
    [ComboSignal.Split]: {
      describe: "The parts were pulled apart or joined; the payload says which",
    },
    [ComboSignal.Revealed]: { describe: "One more term was shown" },
    [ComboSignal.Done]: { describe: "Every term and the totals are shown" },
    [ComboSignal.Shown]: { describe: "The learner switched between surface area and volume" },
  },
  observe: (s) => {
    const c = comboOf(s.kind);
    const groups = groupsOf(s);
    const n = termCount(s);
    const parts = c.parts
      .map((p) => {
        const what =
          p.shape === "dome"
            ? `hemisphere (r = ${p.r})`
            : p.shape === "box"
              ? `cube (side ${p.side})`
              : `${p.shape} (r = ${p.r})`;
        return p.look === "cut"
          ? `${what} hollowed out`
          : p.look === "ghost"
            ? `${what}, see-through`
            : what;
      })
      .join(", ");
    const elements: Element[] = [
      {
        id: ComboPart.Picture,
        value: `${c.name.en}: ${parts}${s.isApart ? ", pulled apart" : ", joined"}`,
      },
    ];
    if (s.revealed > 0) {
      let left = s.revealed;
      const shown: string[] = [];
      for (const g of groups) {
        if (left <= 0) break;
        if (left >= g.terms.length) shown.push(groupText(g));
        else
          shown.push(
            `${g.label.en} = ${g.terms
              .slice(0, left)
              .map((t) => `${t.sign < 0 ? "−" : "+"} ${t.label.en}`)
              .join(" ")} …`,
          );
        left -= g.terms.length;
      }
      elements.push({ id: ComboPart.Terms, value: shown.join("; ") });
    }
    return {
      summary: `${c.name.en}, a combination of solids; ${s.sum === Sum.Surface ? "surface area" : "volume"}: ${s.revealed} of ${n} terms shown.`,
      elements,
      hidden: { totals: groups.map((g) => groupText(g)) },
    };
  },
  parts: (s) => [
    ComboPart.Picture,
    ...(s.revealed > 0 ? [ComboPart.Terms] : []),
    ...(s.canSplit ? [ComboPart.Split] : []),
    ...(s.canReveal ? [ComboPart.Reveal] : []),
    ...(s.canSwitch && sumsOf(s.kind).length > 1 ? [ComboPart.Measures] : []),
  ],
});
