import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  EXACT,
  RATIOS,
  type Ratio,
  SPECIAL_ANGLES,
  type SpecialAngle,
  clean,
  numText,
  ratioValue,
} from "./trig";

/**
 * The ratios of 0°, 30°, 45°, 60° and 90° (NCERT 8.3, Table 8.1), each found, not told.
 * - square: half a square is a right isosceles triangle, so ∠A = ∠C = 45° and BC = AB = a;
 *   Pythagoras gives AC = a√2, and the ratios follow. Fills the 45° column.
 * - equilateral: an equilateral triangle of side 2a cut by its altitude AD; ΔABD ≅ ΔACD, so
 *   BD = a and ∠BAD = 30°; AD = a√3. Fills the 30° and 60° columns.
 * - limits: angle A shrinks towards 0° (BC shrinks, AC → AB) or grows towards 90° (AB shrinks,
 *   AC → BC); the learner turns it and watches sin and cos. Reaching 0° or 90° fills that column.
 * The table can be shown under the picture; filled columns show Table 8.1's exact values.
 */

export const SpecialMode = {
  Square: "square",
  Equilateral: "equilateral",
  Limits: "limits",
} as const;
export type SpecialMode = (typeof SpecialMode)[keyof typeof SpecialMode];

export const SpecialAction = {
  Next: "next",
  Reset: "reset",
  Nudge: "nudge",
  Fill: "fill",
} as const;
export const SpecialSignal = { Stepped: "stepped", Filled: "filled", Changed: "changed" } as const;
export const SpecialDerived = {
  StepCount: "stepCount",
  Working: "working",
  Values: "values",
  IsDone: "isDone",
} as const;
export const SpecialPart = {
  Figure: "figure",
  Working: "working",
  Table: "table",
  Readout: "readout",
  Controls: "controls",
  Next: "next",
} as const;

/** Working lines per mode (TeX). */
export const SPECIAL_WORKING: Record<
  Exclude<SpecialMode, typeof SpecialMode.Limits>,
  readonly string[]
> = {
  [SpecialMode.Square]: [
    "\\angle A = \\angle C = 45^\\circ,\\ \\text{so}\\ BC = AB = a",
    "AC^2 = AB^2 + BC^2 = a^2 + a^2 = 2a^2,\\ \\text{so}\\ AC = a\\sqrt{2}",
    "\\sin 45^\\circ = \\dfrac{BC}{AC} = \\dfrac{a}{a\\sqrt{2}} = \\dfrac{1}{\\sqrt{2}},\\quad \\cos 45^\\circ = \\dfrac{AB}{AC} = \\dfrac{1}{\\sqrt{2}},\\quad \\tan 45^\\circ = \\dfrac{BC}{AB} = 1",
    "\\operatorname{cosec} 45^\\circ = \\sqrt{2},\\quad \\sec 45^\\circ = \\sqrt{2},\\quad \\cot 45^\\circ = 1",
  ],
  [SpecialMode.Equilateral]: [
    "\\triangle ABD \\cong \\triangle ACD\\ (\\text{RHS}),\\ \\text{so}\\ BD = DC = a,\\ \\angle BAD = 30^\\circ",
    "AD^2 = AB^2 - BD^2 = (2a)^2 - a^2 = 3a^2,\\ \\text{so}\\ AD = a\\sqrt{3}",
    "\\sin 30^\\circ = \\dfrac{BD}{AB} = \\dfrac{1}{2},\\quad \\cos 30^\\circ = \\dfrac{AD}{AB} = \\dfrac{\\sqrt{3}}{2},\\quad \\tan 30^\\circ = \\dfrac{BD}{AD} = \\dfrac{1}{\\sqrt{3}}",
    "\\sin 60^\\circ = \\dfrac{AD}{AB} = \\dfrac{\\sqrt{3}}{2},\\quad \\cos 60^\\circ = \\dfrac{BD}{AB} = \\dfrac{1}{2},\\quad \\tan 60^\\circ = \\sqrt{3}",
  ],
};

const specialState = z
  .object({
    mode: z.nativeEnum(SpecialMode),
    /** Lines of working shown (square, equilateral). */
    step: z.number().int().min(0).max(4),
    /** Limits mode: the angle at A (°). */
    angle: z.number().int().min(0).max(90),
    angleStep: z.number().int().min(1).max(15),
    /** Columns of Table 8.1 already filled in. */
    filled: z.array(
      z.union([z.literal(0), z.literal(30), z.literal(45), z.literal(60), z.literal(90)]),
    ),
    /** Which rows the table shows. */
    rows: z
      .array(z.enum(["sin", "cos", "tan", "cosec", "sec", "cot"]))
      .min(1)
      .max(6),
    showTable: z.boolean(),
    canStep: z.boolean(),
    canTurn: z.boolean(),
  })
  .strict();
export type SpecialState = z.infer<typeof specialState>;

export const stepCountOf = (s: SpecialState): number =>
  s.mode === SpecialMode.Limits ? 0 : SPECIAL_WORKING[s.mode].length;

/** The columns a finished derivation fills. */
export const COLUMNS_OF: Record<Exclude<SpecialMode, typeof SpecialMode.Limits>, SpecialAngle[]> = {
  [SpecialMode.Square]: [45],
  [SpecialMode.Equilateral]: [30, 60],
};

const withFilled = (
  filled: readonly SpecialAngle[],
  add: readonly SpecialAngle[],
): SpecialAngle[] => SPECIAL_ANGLES.filter((a) => filled.includes(a) || add.includes(a));

const act = actionsFor<SpecialState>();
const by = z.union([z.literal(1), z.literal(-1)]);

export const specialAngles = defineProp({
  type: "specialAngles",
  describe:
    "Finding the trigonometric ratios of 0°, 30°, 45°, 60° and 90° (NCERT 8.3) and filling Table 8.1. Square mode: half a square (a right isosceles triangle with BC = AB = a) gives AC = a√2 and sin 45° = cos 45° = 1/√2, tan 45° = 1. Equilateral mode: an equilateral triangle of side 2a cut by its altitude AD (ΔABD ≅ ΔACD, so BD = a, ∠BAD = 30°) gives AD = a√3 and the 30° and 60° ratios. Both are revealed one line at a time. Limits mode: the learner shrinks angle A towards 0° or grows it towards 90° and watches sin A and cos A (sin 0° = 0, cos 0° = 1, sin 90° = 1, cos 90° = 0; tan 90°, cot 0°, cosec 0°, sec 90° not defined). Each finished case fills its column of the table.",
  state: specialState,
  defaults: {
    mode: SpecialMode.Square,
    step: 0,
    angle: 30,
    angleStep: 5,
    filled: [],
    rows: ["sin", "cos", "tan", "cosec", "sec", "cot"],
    showTable: true,
    canStep: true,
    canTurn: true,
  },
  inputs: ["showTable", "canStep", "canTurn"],
  invariant: (s) => (s.step > stepCountOf(s) ? "more steps than this mode has" : undefined),
  derived: {
    [SpecialDerived.StepCount]: { describe: "Lines of working in this mode", compute: stepCountOf },
    [SpecialDerived.Working]: {
      describe: "The working shown so far, as TeX lines",
      compute: (s) =>
        s.mode === SpecialMode.Limits ? [] : SPECIAL_WORKING[s.mode].slice(0, s.step),
    },
    [SpecialDerived.Values]: {
      describe: "Limits mode: sin, cos and tan of the current angle (null = not defined)",
      compute: (s) => ({
        sin: clean(ratioValue("sin", s.angle) ?? 0),
        cos: clean(ratioValue("cos", s.angle) ?? 0),
        tan: ratioValue("tan", s.angle),
      }),
    },
    [SpecialDerived.IsDone]: {
      describe: "Whether this mode's columns are filled",
      compute: (s) =>
        s.mode === SpecialMode.Limits
          ? s.filled.includes(0) && s.filled.includes(90)
          : COLUMNS_OF[s.mode].every((a) => s.filled.includes(a)),
    },
  },
  actions: {
    [SpecialAction.Next]: act({
      describe: "Show the next line of working (square, equilateral); the last fills the table",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.mode === SpecialMode.Limits || s.step >= stepCountOf(s)) return set({});
        const step = s.step + 1;
        const out: Emit[] = [{ signal: SpecialSignal.Stepped, payload: { step } }];
        if (step === stepCountOf(s)) {
          const cols = COLUMNS_OF[s.mode];
          out.push({ signal: SpecialSignal.Filled, payload: { angles: cols } });
          return set({ step, filled: withFilled(s.filled, cols) }, ...out);
        }
        return set({ step }, ...out);
      },
    }),
    [SpecialAction.Reset]: act({
      describe: "Hide the working again (the table keeps what was filled)",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [SpecialAction.Nudge]: act({
      describe:
        "Limits mode: grow angle A (by: 1) or shrink it (by: −1) by one step; at 0° or 90° that column fills",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canTurn || s.mode !== SpecialMode.Limits) return set({});
        const angle = Math.min(90, Math.max(0, s.angle + a.by * s.angleStep));
        if (angle === s.angle) return set({});
        const out: Emit[] = [
          {
            signal: SpecialSignal.Changed,
            payload: {
              angle,
              sin: clean(ratioValue("sin", angle) ?? 0),
              cos: clean(ratioValue("cos", angle) ?? 0),
            },
          },
        ];
        if ((angle === 0 || angle === 90) && !s.filled.includes(angle)) {
          out.push({ signal: SpecialSignal.Filled, payload: { angles: [angle] } });
          return set({ angle, filled: withFilled(s.filled, [angle]) }, ...out);
        }
        return set({ angle }, ...out);
      },
    }),
    [SpecialAction.Fill]: act({
      describe: "Fill a column of the table (the lesson, not the learner)",
      byLearner: false,
      args: z
        .object({
          angle: z.union([
            z.literal(0),
            z.literal(30),
            z.literal(45),
            z.literal(60),
            z.literal(90),
          ]),
        })
        .strict(),
      run: (s, a) => set({ filled: withFilled(s.filled, [a.angle]) }),
    }),
  },
  signals: {
    [SpecialSignal.Stepped]: { describe: "A line of working was shown" },
    [SpecialSignal.Filled]: {
      describe: "Columns of the table were filled; the payload has the angles",
    },
    [SpecialSignal.Changed]: {
      describe: "Limits mode: the angle changed; the payload has sin and cos",
    },
  },
  observe: (s) => {
    const elements: Element[] = [];
    let summary: string;
    if (s.mode === SpecialMode.Square) {
      summary =
        "Half a square: a right triangle ABC, right-angled at B, with AB = BC = a and ∠A = ∠C = 45°.";
      elements.push({
        id: SpecialPart.Figure,
        value: "square cut along its diagonal AC; triangle ABC right-angled at B",
      });
    } else if (s.mode === SpecialMode.Equilateral) {
      summary = "An equilateral triangle ABC of side 2a, with the altitude AD from A to BC.";
      elements.push({
        id: SpecialPart.Figure,
        value:
          "equilateral ABC, AB = BC = CA = 2a; AD ⊥ BC; right triangle ABD with ∠BAD = 30°, ∠ABD = 60°",
      });
    } else {
      summary = `Right triangle ABC (right angle at B) with ∠A = ${s.angle}°: sin A = ${numText(ratioValue("sin", s.angle) ?? 0)}, cos A = ${numText(ratioValue("cos", s.angle) ?? 0)}.`;
      elements.push({
        id: SpecialPart.Figure,
        value:
          s.angle === 0
            ? "the triangle has flattened: C is on B, AC lies along AB"
            : s.angle === 90
              ? "the triangle has flattened: A is on B, AC lies along BC"
              : `∠A = ${s.angle}°, BC/AC = ${numText(ratioValue("sin", s.angle) ?? 0)}, AB/AC = ${numText(ratioValue("cos", s.angle) ?? 0)}`,
      });
      elements.push({
        id: SpecialPart.Readout,
        value: `sin ${s.angle}° = ${numText(ratioValue("sin", s.angle) ?? 0)}, cos ${s.angle}° = ${numText(ratioValue("cos", s.angle) ?? 0)}`,
      });
    }
    if (s.mode !== SpecialMode.Limits && s.step > 0)
      elements.push({
        id: SpecialPart.Working,
        value: SPECIAL_WORKING[s.mode].slice(0, s.step).join("; "),
      });
    if (s.showTable)
      elements.push({
        id: SpecialPart.Table,
        value:
          s.filled.length === 0
            ? "Table 8.1, all empty"
            : s.filled
                .map(
                  (a) =>
                    `${a}°: ${s.rows.map((r) => `${r} ${EXACT[a][r as Ratio] ?? "not defined"}`).join(", ")}`,
                )
                .join("; "),
      });
    const hidden =
      s.mode === SpecialMode.Limits
        ? undefined
        : {
            table: COLUMNS_OF[s.mode]
              .filter((a) => !s.filled.includes(a))
              .map(
                (a) =>
                  `${a}°: ${RATIOS.map((r) => `${r} ${EXACT[a][r] ?? "not defined"}`).join(", ")}`,
              )
              .join("; "),
          };
    return { summary, elements, hidden: hidden?.table === "" ? undefined : hidden };
  },
  parts: (s) => [
    SpecialPart.Figure,
    ...(s.mode !== SpecialMode.Limits && s.step > 0 ? [SpecialPart.Working] : []),
    ...(s.mode === SpecialMode.Limits ? [SpecialPart.Readout] : []),
    ...(s.showTable ? [SpecialPart.Table] : []),
    ...(s.mode === SpecialMode.Limits && s.canTurn ? [SpecialPart.Controls] : []),
    ...(s.mode !== SpecialMode.Limits && s.canStep ? [SpecialPart.Next] : []),
  ],
});
