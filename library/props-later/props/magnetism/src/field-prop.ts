import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  MAGNET,
  SOLENOID,
  Source,
  X_MAX,
  Y_MAX,
  angleOf,
  fieldAt,
  headingOf,
  isInsideBody,
  referenceStrength,
  strengthOf,
  wiresOf,
} from "./field";

/**
 * The magnetic field of a bar magnet, or of a current: a straight wire seen from above (as the
 * wire passes through NCERT's cardboard), a circular loop seen edge-on, or a solenoid seen from
 * the side. Field lines, iron filings and a compass the learner places by tapping: its needle's
 * north end points along the field, and swings harder where the field is stronger.
 */

export const FieldAction = {
  PlaceCompass: "placeCompass",
  RemoveCompass: "removeCompass",
  SetCurrent: "setCurrent",
  Flip: "flip",
  SetTurns: "setTurns",
} as const;
export const FieldSignal = { Placed: "placed", Changed: "changed" } as const;
export const FieldDerived = {
  NeedleAngle: "needleAngle",
  NeedleHeading: "needleHeading",
  Strength: "strength",
  NorthEnd: "northEnd",
} as const;
export const FieldPart = {
  Source: "source",
  Lines: "lines",
  Compass: "compass",
  Controls: "controls",
} as const;

export const MAX_CURRENT = 3;
export const MAX_TURNS = 5;

const point = z
  .object({ x: z.number().min(-X_MAX).max(X_MAX), y: z.number().min(-Y_MAX).max(Y_MAX) })
  .strict();

const fieldState = z
  .object({
    source: z.nativeEnum(Source),
    /**
     * Current in units (−3 to 3). Straight wire: + comes out of the page (⊙), − goes in (⊗).
     * Loop and solenoid: + makes the field inside point right. Ignored for the bar magnet.
     */
    current: z.number().int().min(-MAX_CURRENT).max(MAX_CURRENT),
    /** The bar magnet turned round: its N pole on the left. */
    isFlipped: z.boolean(),
    /** Turns in the loop's coil (the field is n times one turn's). */
    turns: z.number().int().min(1).max(MAX_TURNS),
    /** Where the compass stands, or null for none. */
    compass: point.nullable(),
    showLines: z.boolean(),
    showFilings: z.boolean(),
    /** Arrows on the field lines (the way a north pole would move). */
    showArrows: z.boolean(),
    /** N and S marked: at a solenoid's ends, or on the bar magnet (false: a plain, unnamed magnet). */
    showPoles: z.boolean(),
    /** A strength meter beside the compass. */
    showStrength: z.boolean(),
    canPlace: z.boolean(),
    canSetCurrent: z.boolean(),
    canFlip: z.boolean(),
    canSetTurns: z.boolean(),
  })
  .strict();
export type FieldState = z.infer<typeof fieldState>;

export const wiresFor = (s: Pick<FieldState, "source" | "current" | "isFlipped" | "turns">) =>
  wiresOf(s.source, s.current, { isFlipped: s.isFlipped, turns: s.turns });

/** Whether any field exists (a magnet always; a current only when it flows). */
export const hasField = (s: Pick<FieldState, "source" | "current">): boolean =>
  s.source === Source.BarMagnet || s.current !== 0;

/** The field at the compass, or null with no compass or no field. */
export function compassField(s: FieldState): [number, number] | null {
  if (s.compass === null || !hasField(s)) return null;
  if (isInsideBody(s.source, s.compass.x, s.compass.y)) return null;
  return fieldAt(wiresFor(s), s.compass.x, s.compass.y);
}

/** The needle's north end, degrees counter-clockwise from right; null when it rests (no field). */
export const needleAngleOf = (s: FieldState): number | null => {
  const b = compassField(s);
  return b === null ? null : angleOf(b);
};

/** The field at the compass as a share of a strong field (one unit of current, close in), 0–1. */
export function strengthAt(s: FieldState): number {
  const b = compassField(s);
  if (b === null) return 0;
  const ref = referenceStrength(s.source) * (s.source === Source.BarMagnet ? 1 : MAX_CURRENT);
  return Math.min(1, strengthOf(b) / ref);
}

/** Which end of a solenoid, loop or magnet is its north pole: where the field inside points. */
export function northEndOf(s: FieldState): "right" | "left" | null {
  if (s.source === Source.StraightWire) return null;
  if (s.source === Source.BarMagnet) return s.isFlipped ? "left" : "right";
  if (s.current === 0) return null;
  return s.current > 0 ? "right" : "left";
}

const SOURCE_WORDS: Readonly<Record<Source, string>> = {
  barMagnet: "a bar magnet",
  straightWire: "a straight wire passing through the page, seen from above",
  loop: "a circular loop of wire seen edge-on, crossing the page at the top and the bottom",
  solenoid: "a solenoid (a long coil) seen from the side",
};

function currentWords(s: FieldState): string {
  if (s.source === Source.BarMagnet)
    return `Its N pole is on the ${s.isFlipped ? "left" : "right"}.`;
  if (s.current === 0) return "No current flows, so there is no field.";
  const size = `${Math.abs(s.current)} unit${Math.abs(s.current) === 1 ? "" : "s"} of current`;
  if (s.source === Source.StraightWire)
    return `${size} flows ${s.current > 0 ? "up out of the page (⊙)" : "down into the page (⊗)"}; the field lines are circles round the wire, ${s.current > 0 ? "anticlockwise" : "clockwise"}.`;
  const turns = s.source === Source.Loop && s.turns > 1 ? ` in ${s.turns} turns` : "";
  return `${size}${turns}; the field inside points ${s.current > 0 ? "right" : "left"}, so the ${northEndOf(s)} end acts as a north pole.`;
}

export function describeField(s: FieldState): string {
  const compass =
    s.compass === null
      ? ""
      : (() => {
          const a = needleAngleOf(s);
          return a === null
            ? " A compass sits there with its needle at rest (no field to turn it)."
            : ` A compass at (${s.compass.x.toFixed(1)}, ${s.compass.y.toFixed(1)}) has its north end pointing ${headingOf(a)}; the field there is ${strengthWord(strengthAt(s))}.`;
        })();
  const shown = [s.showLines && "field lines", s.showFilings && "iron filings"].filter(Boolean);
  return `The magnetic field of ${SOURCE_WORDS[s.source]}. ${currentWords(s)}${shown.length > 0 && hasField(s) ? ` Shown with ${shown.join(" and ")}.` : ""}${compass}`;
}

export const strengthWord = (k: number): string =>
  k > 0.5 ? "strong" : k > 0.15 ? "medium" : k > 0.03 ? "weak" : "very weak";

const act = actionsFor<FieldState>();
const changed = (s: FieldState) => ({
  signal: FieldSignal.Changed,
  payload: {
    current: s.current,
    isFlipped: s.isFlipped,
    turns: s.turns,
    northEnd: northEndOf(s),
    needleAngle: needleAngleOf(s),
  },
});

export const magneticField = defineProp({
  type: "magneticField",
  describe:
    "The magnetic field of a bar magnet or of a current (NCERT 13.1–13.2): a straight wire seen from above (concentric circles), a circular loop seen edge-on, or a solenoid seen from the side (a field like a bar magnet's, uniform inside). Field lines are traced from the real field, with iron-filing dashes and arrows that run N → S outside. The learner taps to place a compass whose needle follows the field, and can change or reverse the current, flip the magnet, or add turns to the loop.",
  state: fieldState,
  defaults: {
    source: Source.BarMagnet,
    current: 2,
    isFlipped: false,
    turns: 1,
    compass: null,
    showLines: true,
    showFilings: false,
    showArrows: true,
    showPoles: true,
    showStrength: false,
    canPlace: true,
    canSetCurrent: false,
    canFlip: false,
    canSetTurns: false,
  },
  inputs: [
    "showLines",
    "showFilings",
    "showArrows",
    "showPoles",
    "showStrength",
    "canPlace",
    "canSetCurrent",
    "canFlip",
    "canSetTurns",
  ],
  derived: {
    [FieldDerived.NeedleAngle]: {
      describe:
        "Where the compass needle's north end points, in degrees anticlockwise from right (null with no compass or no field)",
      compute: (s) => needleAngleOf(s),
    },
    [FieldDerived.NeedleHeading]: {
      describe: "The needle's north end in words (right, up, up and left, …), or null",
      compute: (s) => {
        const a = needleAngleOf(s);
        return a === null ? null : headingOf(a);
      },
    },
    [FieldDerived.Strength]: {
      describe: "How strong the field is at the compass, 0 (none) to 1 (strong)",
      compute: (s) => Math.round(strengthAt(s) * 100) / 100,
    },
    [FieldDerived.NorthEnd]: {
      describe:
        "Which end of the magnet, loop or solenoid is its north pole (right / left), or null for a straight wire or no current",
      compute: (s) => northEndOf(s),
    },
  },
  actions: {
    [FieldAction.PlaceCompass]: act({
      describe: "Put the compass at a point in the picture (x −10…10, y −6.25…6.25)",
      byLearner: true,
      args: point,
      run: (s, a) => {
        const next = { ...s, compass: { x: a.x, y: a.y } };
        return set(
          { compass: { x: a.x, y: a.y } },
          {
            signal: FieldSignal.Placed,
            payload: { x: a.x, y: a.y, needleAngle: needleAngleOf(next) },
          },
        );
      },
    }),
    [FieldAction.RemoveCompass]: act({
      describe: "Take the compass away",
      args: z.object({}).strict(),
      run: () => set({ compass: null }),
    }),
    [FieldAction.SetCurrent]: act({
      describe: "Set the current (−3 to 3); a minus sign reverses its direction",
      byLearner: true,
      args: z.object({ current: z.number().int().min(-MAX_CURRENT).max(MAX_CURRENT) }).strict(),
      run: (s, a) => set({ current: a.current }, changed({ ...s, current: a.current })),
    }),
    [FieldAction.Flip]: act({
      describe: "Turn the bar magnet round (swap its N and S ends)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ isFlipped: !s.isFlipped }, changed({ ...s, isFlipped: !s.isFlipped })),
    }),
    [FieldAction.SetTurns]: act({
      describe: "Wind the loop with 1 to 5 turns",
      byLearner: true,
      args: z.object({ turns: z.number().int().min(1).max(MAX_TURNS) }).strict(),
      run: (s, a) => set({ turns: a.turns }, changed({ ...s, turns: a.turns })),
    }),
  },
  signals: {
    [FieldSignal.Placed]: {
      describe: "The compass was placed; the payload has where and the needle's angle",
    },
    [FieldSignal.Changed]: {
      describe: "The current, the magnet's way round or the turns changed",
    },
  },
  observe: (s) => {
    const elements: Element[] = [
      {
        id: FieldPart.Source,
        value:
          s.source === Source.BarMagnet
            ? `bar magnet, N on the ${s.isFlipped ? "left" : "right"}`
            : `${s.source}, current ${s.current}${s.source === Source.Loop ? `, ${s.turns} turns` : ""}`,
      },
    ];
    if (s.showLines && hasField(s)) elements.push({ id: FieldPart.Lines, value: "field lines" });
    if (s.compass !== null) {
      const a = needleAngleOf(s);
      elements.push({
        id: FieldPart.Compass,
        value: a === null ? "needle at rest" : `north end points ${headingOf(a)}`,
      });
    }
    return { summary: describeField(s), elements };
  },
  parts: (s) => [
    FieldPart.Source,
    ...(s.showLines ? [FieldPart.Lines] : []),
    ...(s.compass !== null ? [FieldPart.Compass] : []),
    ...(s.canSetCurrent || s.canFlip || s.canSetTurns ? [FieldPart.Controls] : []),
  ],
});

export { MAGNET, SOLENOID };
