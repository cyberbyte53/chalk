import { type Box, type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * A plane mirror along the floor of a room, a torch held at a fixed height, and the one ray from
 * the torch that strikes the mirror. The prop knows the laws of reflection and nothing else.
 *
 * Only where the torch is held and where its beam meets the mirror are stored. The angles, where
 * the reflected ray goes and whether it lights a target all follow by the law of reflection.
 */

export const PlaneMirrorAction = {
  Aim: "aim",
  PlaceTorch: "placeTorch",
  PlaceTarget: "placeTarget",
  ClearTarget: "clearTarget",
  AimAtTarget: "aimAtTarget",
  NextLabel: "nextLabel",
} as const;

export const PlaneMirrorSignal = { Aimed: "aimed", LabelShown: "labelShown" } as const;

export const PlaneMirrorDerived = {
  Incidence: "incidence",
  Reflection: "reflection",
  HitX: "hitX",
  IsLit: "isLit",
  LabelStep: "labelStep",
} as const;

/** The labelled diagram's names, in the order the learner steps through them. */
export const PlaneMirrorLabel = {
  IncidentRay: "incidentRay",
  PointOfIncidence: "pointOfIncidence",
  Normal: "normal",
  ReflectedRay: "reflectedRay",
  AngleOfIncidence: "angleOfIncidence",
  AngleOfReflection: "angleOfReflection",
} as const;
export type PlaneMirrorLabel = (typeof PlaneMirrorLabel)[keyof typeof PlaneMirrorLabel];
export const LABEL_ORDER: readonly PlaneMirrorLabel[] = [
  PlaneMirrorLabel.IncidentRay,
  PlaneMirrorLabel.PointOfIncidence,
  PlaneMirrorLabel.Normal,
  PlaneMirrorLabel.ReflectedRay,
  PlaneMirrorLabel.AngleOfIncidence,
  PlaneMirrorLabel.AngleOfReflection,
];
/** The labels' words, in English and Hindi. */
export const LABEL_WORDS: Record<PlaneMirrorLabel, { en: string; hi: string }> = {
  incidentRay: { en: "incident ray", hi: "आपतित किरण" },
  pointOfIncidence: { en: "point of incidence", hi: "आपतन बिंदु" },
  normal: { en: "normal", hi: "अभिलंब" },
  reflectedRay: { en: "reflected ray", hi: "परावर्तित किरण" },
  angleOfIncidence: { en: "angle of incidence, i", hi: "आपतन कोण i" },
  angleOfReflection: { en: "angle of reflection, r", hi: "परावर्तन कोण r" },
};

export const PlaneMirrorPart = {
  Torch: "torch",
  Strike: "strike",
  Normal: "normal",
  AngleIn: "angleIn",
  AngleOut: "angleOut",
  Target: "target",
  Labels: "labels",
} as const;

/** The room, in cm: the mirror runs along its whole floor. */
export const ROOM = { width: 100, height: 60 } as const;
/** How high the torch is held, in cm. */
export const TORCH_HEIGHT = 50;
/** The reflected ray lights a target it passes within this many cm of. */
export const LIT_WITHIN = 1.5;

const cmAcross = z.number().min(0).max(ROOM.width);
const targetSchema = z.object({ x: cmAcross, y: z.number().min(2).max(ROOM.height) }).strict();

const planeMirrorState = z
  .object({
    /** Where the torch is held, in cm from the left wall (its height is `TORCH_HEIGHT`). */
    torchX: cmAcross,
    /** Where the beam meets the mirror, in cm from the left wall. */
    strike: cmAcross,
    /** A spot the reflected ray may light, or null. */
    target: targetSchema.nullable(),
    showNormal: z.boolean(),
    showAngles: z.boolean(),
    /** Ticks along the mirror every 5 cm, numbered every 10 cm. */
    showRuler: z.boolean(),
    /** A readout of where the beam lands on the mirror. */
    showStrikeAt: z.boolean(),
    /** The labelled diagram: how many of the six labels are shown (null: no labels, no button). */
    labelStep: z.number().int().min(0).max(LABEL_ORDER.length).nullable(),
  })
  .strict();
export type PlaneMirrorState = z.infer<typeof planeMirrorState>;

const DEG = 180 / Math.PI;

/** The angle of incidence (= of reflection), in degrees from the normal. */
export function incidenceOf(s: Pick<PlaneMirrorState, "torchX" | "strike">): number {
  return Math.atan(Math.abs(s.strike - s.torchX) / TORCH_HEIGHT) * DEG;
}

/** Where the reflected ray is, in cm across, when it has climbed to `y` cm. */
export function reflectedX(s: Pick<PlaneMirrorState, "torchX" | "strike">, y: number): number {
  return s.strike + ((s.strike - s.torchX) * y) / TORCH_HEIGHT;
}

/** The one strike point whose reflected ray passes through the target; null without a target. */
export function strikeToLight(s: PlaneMirrorState): number | null {
  if (s.target === null) return null;
  // reflectedX(strike, y) = x  ⇒  strike (1 + y/h) = x + torchX · y/h.
  const { x, y } = s.target;
  return (x * TORCH_HEIGHT + s.torchX * y) / (TORCH_HEIGHT + y);
}

function isLit(s: PlaneMirrorState): boolean {
  return s.target !== null && Math.abs(reflectedX(s, s.target.y) - s.target.x) <= LIT_WITHIN;
}

const round = (v: number): number => Math.round(v);

/** The stage's pixels at a width: the view and `locate` share it. */
export const INSET = { left: 10, right: 10, top: 10, bottom: 36 } as const;
export function pixelsOf(width: number): {
  height: number;
  x: (cm: number) => number;
  y: (cm: number) => number;
} {
  const height = Math.round(width * 0.62);
  const across = (width - INSET.left - INSET.right) / ROOM.width;
  const up = (height - INSET.top - INSET.bottom) / ROOM.height;
  return {
    height,
    x: (cm) => INSET.left + cm * across,
    y: (cm) => height - INSET.bottom - cm * up,
  };
}

const act = actionsFor<PlaneMirrorState>();

export const planeMirror = defineProp({
  type: "planeMirror",
  describe:
    "A plane mirror along the floor of a room, a torch held at a fixed height, and the ray from the torch that strikes the mirror: the normal, the angles of incidence and reflection, where the reflected ray goes, and a target it may light.",
  state: planeMirrorState,
  defaults: {
    torchX: 20,
    strike: 40,
    target: null,
    showNormal: true,
    showAngles: true,
    showRuler: true,
    showStrikeAt: true,
    labelStep: null,
  },
  inputs: ["showNormal", "showAngles", "showRuler", "showStrikeAt"],
  derived: {
    [PlaneMirrorDerived.Incidence]: {
      describe: "Angle of incidence, degrees from the normal",
      compute: (s) => incidenceOf(s),
    },
    [PlaneMirrorDerived.Reflection]: {
      describe: "Angle of reflection, degrees from the normal (equal to the angle of incidence)",
      compute: (s) => incidenceOf(s),
    },
    [PlaneMirrorDerived.HitX]: {
      describe: "Where the reflected ray is, in cm across, when it is back at the torch's height",
      compute: (s) => reflectedX(s, TORCH_HEIGHT),
    },
    [PlaneMirrorDerived.LabelStep]: {
      describe: "How many labels of the step-through diagram are showing (null when it is off)",
      compute: (s) => s.labelStep,
    },
    [PlaneMirrorDerived.IsLit]: {
      describe: "The reflected ray passes through the target",
      compute: (s) => isLit(s),
    },
  },
  actions: {
    [PlaneMirrorAction.Aim]: act({
      describe: "Move where the beam meets the mirror (cm from the left); the torch stays put",
      byLearner: true,
      args: z.object({ strike: cmAcross }).strict(),
      run: (_s, a) => set({ strike: a.strike }),
    }),
    [PlaneMirrorAction.PlaceTorch]: act({
      describe: "Hold the torch at `x` cm from the left; the strike point stays",
      args: z.object({ x: cmAcross }).strict(),
      run: (_s, a) => set({ torchX: a.x }),
    }),
    [PlaneMirrorAction.PlaceTarget]: act({
      describe: "Put the target at (`x`, `y`) cm; the strike point stays",
      args: targetSchema,
      run: (_s, a) => set({ target: { x: a.x, y: a.y } }),
    }),
    [PlaneMirrorAction.ClearTarget]: act({
      describe: "Take the target away",
      args: z.object({}).strict(),
      run: () => set({ target: null }),
    }),
    [PlaneMirrorAction.NextLabel]: act({
      describe:
        "Show the next label of the diagram (incident ray, point of incidence, normal, reflected ray, angle of incidence, angle of reflection); stops after the sixth",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.labelStep === null || s.labelStep >= LABEL_ORDER.length) return set({});
        const step = s.labelStep + 1;
        const shown: Emit = { signal: PlaneMirrorSignal.LabelShown, payload: { step } };
        return set({ labelStep: step }, shown);
      },
    }),
    [PlaneMirrorAction.AimAtTarget]: act({
      describe: "Move the strike point to the one place that lights the target (gives it away)",
      reveals: true,
      args: z.object({}).strict(),
      run: (s) => {
        const strike = strikeToLight(s);
        return set(strike === null ? {} : { strike: Math.min(ROOM.width, Math.max(0, strike)) });
      },
    }),
  },
  signals: {
    [PlaneMirrorSignal.Aimed]: {
      describe: "The learner let go of the beam; `strike` is where it meets the mirror",
    },
    [PlaneMirrorSignal.LabelShown]: {
      describe: "A label of the diagram appeared; `step` is how many are showing now (6: all)",
    },
  },
  observe: (s) => {
    const i = round(incidenceOf(s));
    const elements: Element[] = [
      {
        id: PlaneMirrorPart.Torch,
        value: `${round(s.torchX)} cm from the left, ${TORCH_HEIGHT} cm up`,
      },
      {
        id: PlaneMirrorPart.Strike,
        value: s.showAngles
          ? `beam meets the mirror ${round(s.strike)} cm from the left, ${i}° from the normal`
          : `beam meets the mirror ${round(s.strike)} cm from the left`,
      },
    ];
    if (s.showNormal)
      elements.push({ id: PlaneMirrorPart.Normal, value: "dashed, at right angles to the mirror" });
    if (s.showAngles) {
      elements.push(
        { id: PlaneMirrorPart.AngleIn, value: `${i}°` },
        { id: PlaneMirrorPart.AngleOut, value: `${i}°` },
      );
    }
    if (s.labelStep !== null && s.labelStep > 0) {
      const names = LABEL_ORDER.slice(0, s.labelStep).map((l) => LABEL_WORDS[l].en);
      elements.push({
        id: PlaneMirrorPart.Labels,
        value: `labelled: ${names.join(", ")}; newest: ${names[names.length - 1]}`,
      });
    }
    const lit = isLit(s);
    if (s.target !== null)
      elements.push({ id: PlaneMirrorPart.Target, value: lit ? "lit" : "dark" });
    const where = `${round(reflectedX(s, TORCH_HEIGHT))} cm from the left at the torch's height`;
    const summary = `a plane mirror along the floor; a torch ${round(s.torchX)} cm from the left shines down, the beam meets the mirror at ${round(s.strike)} cm and bounces up to ${where}${s.target === null ? "" : lit ? "; the target is lit" : "; the target is dark"}${s.labelStep === null ? "" : `; ${s.labelStep} of ${LABEL_ORDER.length} parts labelled`}`;
    return s.showAngles
      ? { summary, elements }
      : { summary, elements, hidden: { incidence: i, reflection: i } };
  },
  parts: (s) => {
    const out: string[] = [PlaneMirrorPart.Torch, PlaneMirrorPart.Strike];
    if (s.showNormal) out.push(PlaneMirrorPart.Normal);
    if (s.showAngles) out.push(PlaneMirrorPart.AngleIn, PlaneMirrorPart.AngleOut);
    if (s.target !== null) out.push(PlaneMirrorPart.Target);
    if (s.labelStep !== null && s.labelStep > 0) out.push(PlaneMirrorPart.Labels);
    return out;
  },
  locate: (s, part, width): Box | undefined => {
    const px = pixelsOf(width);
    const around = (cx: number, cy: number): Box => ({
      x: px.x(cx) - 24,
      y: px.y(cy) - 24,
      width: 48,
      height: 48,
    });
    if (part === PlaneMirrorPart.Torch) return around(s.torchX, TORCH_HEIGHT);
    if (part === PlaneMirrorPart.Labels)
      return s.labelStep === null || s.labelStep === 0
        ? undefined
        : {
            x: INSET.left,
            y: INSET.top,
            width: width - INSET.left - INSET.right,
            height: px.y(0) - INSET.top,
          };
    if (part === PlaneMirrorPart.Strike) return around(s.strike, 0);
    if (part === PlaneMirrorPart.Target)
      return s.target === null ? undefined : around(s.target.x, s.target.y);
    if (part === PlaneMirrorPart.Normal && s.showNormal)
      return {
        x: px.x(s.strike) - 6,
        y: px.y(ROOM.height),
        width: 12,
        height: px.y(0) - px.y(ROOM.height),
      };
    if ((part === PlaneMirrorPart.AngleIn || part === PlaneMirrorPart.AngleOut) && s.showAngles) {
      const side =
        part === PlaneMirrorPart.AngleIn
          ? Math.sign(s.torchX - s.strike) || -1
          : Math.sign(s.strike - s.torchX) || 1;
      return { x: px.x(s.strike) + (side < 0 ? -48 : 0), y: px.y(0) - 48, width: 48, height: 48 };
    }
    return undefined;
  },
});
