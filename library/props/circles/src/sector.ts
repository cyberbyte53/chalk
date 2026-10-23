import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean } from "./kit/geometry";
import { type PiValue, piOf, piValue } from "./pi";

/**
 * Sector and segment of a circle (NCERT 12.3, Figs 12.4–12.10). The learner turns the radius OB
 * to change θ = ∠AOB and sees, by the unitary method, sector = θ/360 × πr², arc = θ/360 × 2πr,
 * and segment = sector − ∆OAB (minor), with the major sector and major segment as what is left
 * of πr². OA lies along the positive x-axis; lengths in cm, angles in degrees.
 */

export const SectorShow = { Sector: "sector", Segment: "segment" } as const;
export type SectorShow = (typeof SectorShow)[keyof typeof SectorShow];

export const SectorAction = { Turn: "turn", SetAngle: "setAngle", SetShow: "setShow" } as const;
export const SectorSignal = { Changed: "changed" } as const;
export const SectorDerived = {
  SectorArea: "sectorArea",
  ArcLength: "arcLength",
  TriangleArea: "triangleArea",
  SegmentArea: "segmentArea",
  MajorSectorArea: "majorSectorArea",
  MajorSegmentArea: "majorSegmentArea",
} as const;
export const SectorPart = {
  Figure: "figure",
  Handle: "handle",
  Working: "working",
  Turn: "turn",
} as const;

const sectorState = z
  .object({
    r: z.number().min(0.5).max(100),
    /** θ = ∠AOB, in degrees. */
    theta: z.number().min(0).max(360),
    /** How far one tap turns OB, in degrees. */
    step: z.number().gt(0).max(90),
    show: z.nativeEnum(SectorShow),
    /** Also shade and work out the major sector or segment. */
    showMajor: z.boolean(),
    /** Write the arc length. */
    showArc: z.boolean(),
    pi: piValue,
    canTurn: z.boolean(),
    showWorking: z.boolean(),
  })
  .strict();
export type SectorState = z.infer<typeof sectorState>;

type Sizes = Pick<SectorState, "r" | "theta" | "pi">;
export const sectorAreaOf = (s: Sizes): number => clean((s.theta / 360) * piOf(s.pi) * s.r * s.r);
export const arcLengthOf = (s: Sizes): number => clean((s.theta / 360) * 2 * piOf(s.pi) * s.r);
/** Area of ∆OAB = ½ r² sin θ (negative past 180°, where the triangle is added, not taken away). */
export const triangleAreaOf = (s: Pick<SectorState, "r" | "theta">): number =>
  clean(0.5 * s.r * s.r * Math.sin((s.theta * Math.PI) / 180));
export const segmentAreaOf = (s: Sizes): number => clean(sectorAreaOf(s) - triangleAreaOf(s));
export const majorSectorAreaOf = (s: Sizes): number =>
  clean(piOf(s.pi) * s.r * s.r - sectorAreaOf(s));
export const majorSegmentAreaOf = (s: Sizes): number =>
  clean(piOf(s.pi) * s.r * s.r - segmentAreaOf(s));

const changed = (s: SectorState, theta: number) => ({
  signal: SectorSignal.Changed,
  payload: {
    theta,
    sector: sectorAreaOf({ ...s, theta }),
    segment: segmentAreaOf({ ...s, theta }),
  },
});

const act = actionsFor<SectorState>();

export const sectorSegment = defineProp({
  type: "sectorSegment",
  describe:
    "A circle with centre O and two radii OA and OB; the learner turns OB (drag it or tap) to change θ = ∠AOB, for NCERT 12.3. Shows the sector OAB (two radii and the arc) or the segment (the chord AB and the arc), with the working: area of the sector = θ/360 × πr² (by the unitary method from 360° ↔ πr²), length of the arc = θ/360 × 2πr, area of the segment = area of the sector − area of ∆OAB, where ∆OAB = ½ r² sin θ. Can also shade the major sector (πr² − minor sector) and the major segment (πr² − minor segment). π is 22/7, 3.14 or exact.",
  state: sectorState,
  defaults: {
    r: 21,
    theta: 120,
    step: 15,
    show: SectorShow.Sector,
    showMajor: false,
    showArc: false,
    pi: "22/7" as PiValue,
    canTurn: true,
    showWorking: true,
  },
  inputs: ["canTurn", "showWorking", "showMajor", "showArc"],
  derived: {
    [SectorDerived.SectorArea]: { describe: "θ/360 × πr², in cm²", compute: sectorAreaOf },
    [SectorDerived.ArcLength]: { describe: "θ/360 × 2πr, in cm", compute: arcLengthOf },
    [SectorDerived.TriangleArea]: {
      describe: "Area of ∆OAB, ½ r² sin θ, in cm²",
      compute: triangleAreaOf,
    },
    [SectorDerived.SegmentArea]: { describe: "Sector − ∆OAB, in cm²", compute: segmentAreaOf },
    [SectorDerived.MajorSectorArea]: {
      describe: "πr² − the minor sector, in cm²",
      compute: majorSectorAreaOf,
    },
    [SectorDerived.MajorSegmentArea]: {
      describe: "πr² − the minor segment, in cm²",
      compute: majorSegmentAreaOf,
    },
  },
  actions: {
    [SectorAction.Turn]: act({
      describe: "Open the angle θ one step (by: 1) or close it (by: −1)",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canTurn) return set({});
        const theta = clean(Math.min(360, Math.max(0, s.theta + a.by * s.step)));
        if (theta === s.theta) return set({});
        return set({ theta }, changed(s, theta));
      },
    }),
    [SectorAction.SetAngle]: act({
      describe: "Set θ in degrees (rounded to the step when the learner drags OB)",
      byLearner: true,
      args: z
        .object({ theta: z.number().min(0).max(360), isSnapped: z.boolean().optional() })
        .strict(),
      run: (s, a) => {
        if (a.isSnapped === true && !s.canTurn) return set({});
        const theta = clean(a.isSnapped === true ? Math.round(a.theta / s.step) * s.step : a.theta);
        if (theta === s.theta) return set({});
        return set({ theta }, changed(s, theta));
      },
    }),
    [SectorAction.SetShow]: act({
      describe: "Show the sector or the segment",
      args: z.object({ show: z.nativeEnum(SectorShow) }).strict(),
      run: (_s, a) => set({ show: a.show }),
    }),
  },
});
