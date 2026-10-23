import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Pt, angleAt, clean, near, tangentLength, tangentPoints } from "./kit/geometry";

/**
 * Tangents from a point P to a circle with centre O (NCERT 10.3, Activity 3, Theorem 10.2): no
 * tangent from a point inside, exactly one from a point on the circle, exactly two from a point
 * outside, and the two have equal lengths (PQ = PR). OP bisects the angle between them, and the
 * angle between the tangents and the angle QOR at the centre add up to 180° (Exercise 10.2 Q10).
 * O is the origin, P sits d cm to its right; lengths in cm.
 */

export const PointPlace = { Inside: "inside", On: "on", Outside: "outside" } as const;
export type PointPlace = (typeof PointPlace)[keyof typeof PointPlace];

export const TangentsAction = {
  Move: "move",
  SetDistance: "setDistance",
  SetRadius: "setRadius",
} as const;
export const TangentsSignal = { Changed: "changed", Outside: "outside" } as const;
export const TangentsDerived = {
  Place: "place",
  TangentCount: "tangentCount",
  TangentLength: "tangentLength",
  AngleAtP: "angleAtP",
  AngleAtO: "angleAtO",
} as const;
export const TangentsPart = {
  Circle: "circle",
  Point: "point",
  Tangents: "tangents",
  Readout: "readout",
  Move: "move",
} as const;

const tangentsState = z
  .object({
    /** The radius, in cm. */
    r: z.number().min(0.5).max(30),
    /** OP, the distance of P from the centre, in cm. */
    d: z.number().min(0).max(60),
    /** How far one tap moves P, in cm. */
    step: z.number().gt(0).max(10),
    /** Names of O, P and the two points of contact: [O, P, Q, R]. */
    names: z.array(z.string().min(1).max(3)).length(4),
    canMove: z.boolean(),
    /** Draw the radii OQ, OR to the points of contact with their right-angle marks. */
    showRadii: z.boolean(),
    /** Write the tangents' lengths and mark them equal. */
    showLengths: z.boolean(),
    /** Draw OP, the bisector of the angle between the tangents. */
    showBisector: z.boolean(),
    /** Mark the angle QPR between the tangents and the angle QOR at the centre. */
    showAngles: z.boolean(),
    /** Say how many tangents there are from P. */
    showCount: z.boolean(),
  })
  .strict();
export type TangentsState = z.infer<typeof tangentsState>;

const O: Pt = [0, 0];

export const pointOf = (s: Pick<TangentsState, "d">): Pt => [s.d, 0];

export function placeOf(s: Pick<TangentsState, "d" | "r">): PointPlace {
  if (near(s.d, s.r, 1e-9)) return PointPlace.On;
  return s.d < s.r ? PointPlace.Inside : PointPlace.Outside;
}

/** The points of contact (none, one or two). */
export const contactsOf = (s: Pick<TangentsState, "d" | "r">): Pt[] =>
  placeOf(s) === PointPlace.On ? [pointOf(s)] : tangentPoints(pointOf(s), O, s.r);

export const tangentCountOf = (s: Pick<TangentsState, "d" | "r">): number =>
  placeOf(s) === PointPlace.Inside ? 0 : placeOf(s) === PointPlace.On ? 1 : 2;

/** PQ = PR, the length of each tangent from P, in cm (null inside, 0 on the circle). */
export const lengthOf = (s: Pick<TangentsState, "d" | "r">): number | null =>
  placeOf(s) === PointPlace.Inside ? null : tangentLength(s.d, s.r);

/** ∠QPR between the two tangents, in degrees (null unless P is outside). */
export function angleAtPOf(s: Pick<TangentsState, "d" | "r">): number | null {
  if (placeOf(s) !== PointPlace.Outside) return null;
  const [q, r] = contactsOf(s) as [Pt, Pt];
  return clean(Math.round(angleAt(pointOf(s), q, r) * 1e6) / 1e6);
}

/** ∠QOR at the centre, in degrees: 180° − ∠QPR (null unless P is outside). */
export function angleAtOOf(s: Pick<TangentsState, "d" | "r">): number | null {
  const p = angleAtPOf(s);
  return p === null ? null : clean(180 - p);
}

function changed(before: TangentsState, after: TangentsState): Emit[] {
  const out: Emit[] = [
    {
      signal: TangentsSignal.Changed,
      payload: { place: placeOf(after), tangents: tangentCountOf(after), length: lengthOf(after) },
    },
  ];
  if (placeOf(after) === PointPlace.Outside && placeOf(before) !== PointPlace.Outside)
    out.push({ signal: TangentsSignal.Outside, payload: { d: after.d } });
  return out;
}

const act = actionsFor<TangentsState>();

export const tangentsFromPoint = defineProp({
  type: "tangentsFromPoint",
  describe:
    "A circle with centre O and a point P that the learner moves towards or away from the centre, for NCERT 10.3 (Activity 3 and Theorem 10.2). From a point inside there is no tangent, from a point on the circle exactly one, from a point outside exactly two, PQ and PR, touching at Q and R. The lengths of the two tangents are always equal (PQ = PR = √(OP² − r²)), each tangent is perpendicular to the radius at its point of contact, OP bisects the angle QPR between them, and ∠QPR + ∠QOR = 180°. Can draw the radii with right-angle marks, the lengths with equal-tick marks, the bisector OP and both angles.",
  state: tangentsState,
  defaults: {
    r: 3,
    d: 5,
    step: 1,
    names: ["O", "P", "Q", "R"],
    canMove: true,
    showRadii: true,
    showLengths: true,
    showBisector: false,
    showAngles: false,
    showCount: true,
  },
  inputs: ["canMove", "showRadii", "showLengths", "showBisector", "showAngles", "showCount"],
  derived: {
    [TangentsDerived.Place]: {
      describe: "Where P is: inside, on or outside the circle",
      compute: placeOf,
    },
    [TangentsDerived.TangentCount]: {
      describe: "How many tangents can be drawn from P (0, 1 or 2)",
      compute: tangentCountOf,
    },
    [TangentsDerived.TangentLength]: {
      describe: "The length of the tangent from P, PQ = PR, in cm (null when P is inside)",
      compute: lengthOf,
    },
    [TangentsDerived.AngleAtP]: {
      describe: "∠QPR, the angle between the two tangents, in degrees (null unless P is outside)",
      compute: angleAtPOf,
    },
    [TangentsDerived.AngleAtO]: {
      describe:
        "∠QOR, the angle at the centre between the radii to the points of contact (null unless P is outside)",
      compute: angleAtOOf,
    },
  },
  actions: {
    [TangentsAction.Move]: act({
      describe: "Move P away from the centre (by: 1) or towards it (by: −1), one step",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canMove) return set({});
        const d = clean(Math.min(4 * s.r, Math.max(0, s.d + a.by * s.step)));
        if (near(d, s.d, 1e-9)) return set({});
        return set({ d }, ...changed(s, { ...s, d }));
      },
    }),
    [TangentsAction.SetDistance]: act({
      describe:
        "Put P a given distance (cm) from the centre (snapped to the step when the learner drags P)",
      byLearner: true,
      args: z.object({ d: z.number().min(0).max(60), isSnapped: z.boolean().optional() }).strict(),
      run: (s, a) => {
        if (a.isSnapped === true && !s.canMove) return set({});
        const d =
          a.isSnapped === true
            ? clean(Math.min(4 * s.r, Math.max(0, Math.round(a.d / s.step) * s.step)))
            : a.d;
        if (near(d, s.d, 1e-9)) return set({});
        return set({ d }, ...changed(s, { ...s, d }));
      },
    }),
    [TangentsAction.SetRadius]: act({
      describe: "Change the circle's radius (cm)",
      args: z.object({ r: z.number().min(0.5).max(30) }).strict(),
      run: (s, a) => set({ r: a.r }, ...changed(s, { ...s, r: a.r })),
    }),
  },
});
