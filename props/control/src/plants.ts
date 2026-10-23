import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./draw";

/**
 * How plants move (NCERT 7.2): the touch-me-not folds its leaves at once, with no growth (its cells
 * lose water and shrink); everything else is movement by growth, slow and directional. A tendril
 * coils round a support; shoots grow towards light and roots away (phototropism, Activity 7.2);
 * roots grow down and shoots up whichever way the pot is turned (geotropism); roots grow towards
 * water (hydrotropism); a pollen tube grows to the ovule (chemotropism). Growth is stepped a day at
 * a time; each day's new piece grows in the direction the stimulus sets *that* day, so old growth
 * keeps its direction when the light is moved or the pot turned, exactly as in Activity 7.2.
 * Angles are degrees clockwise from straight up.
 */

export const PlantKind = {
  TouchMeNot: "touchMeNot",
  Tendril: "tendril",
  Phototropism: "phototropism",
  Geotropism: "geotropism",
  Hydrotropism: "hydrotropism",
  PollenTube: "pollenTube",
} as const;
export type PlantKind = (typeof PlantKind)[keyof typeof PlantKind];

export const Side = { Left: "left", Right: "right" } as const;
export type Side = (typeof Side)[keyof typeof Side];

export const Direction = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

export const MAX_DAYS = 6;
/** Days for the pollen tube to reach the ovule, and for a tendril to finish coiling. */
export const TUBE_DAYS = 3;
export const COIL_DAYS = 4;

export const PlantAction = {
  Touch: "touch",
  Recover: "recover",
  Grow: "grow",
  SetSide: "setSide",
  Turn: "turn",
  Reset: "reset",
} as const;
export const PlantSignal = { Touched: "touched", Grew: "grew", Turned: "turned" } as const;
export const PlantDerived = {
  ShootGoes: "shootGoes",
  RootGoes: "rootGoes",
  IsFolded: "isFolded",
  Coils: "coils",
  HasReachedOvule: "hasReachedOvule",
  ShadySide: "shadySide",
} as const;
export const PlantPart = {
  Plant: "plant",
  Stimulus: "stimulus",
  Grow: "grow",
  Touch: "touch",
  Side: "side",
  Turn: "turn",
} as const;

const angle = z.number().min(-360).max(360);

const plantState = z
  .object({
    kind: z.nativeEnum(PlantKind),
    /** Phototropism: which side the light comes from. Hydrotropism: which side the water is. */
    side: z.nativeEnum(Side),
    days: z.number().int().min(0).max(MAX_DAYS),
    /** Each day's new piece of shoot and of root, as an angle (degrees clockwise from up). */
    shoot: z.array(angle).max(MAX_DAYS + 1),
    root: z.array(angle).max(MAX_DAYS + 1),
    /** Geotropism: the pot's turn, 0 (upright) or 90 (on its side). */
    potAngle: z.union([z.literal(0), z.literal(90)]),
    /** Touch-me-not: whether its leaflets are folded. */
    isFolded: z.boolean(),
    /** Phototropism: show where auxin collects (the shady side of the shoot tip). */
    showAuxin: z.boolean(),
    showNames: z.boolean(),
    canTouch: z.boolean(),
    canGrow: z.boolean(),
    canSetSide: z.boolean(),
    canTurn: z.boolean(),
  })
  .strict();
export type PlantState = z.infer<typeof plantState>;

/** A fresh seedling: one short piece of shoot straight up and of root straight down. */
export const SEEDLING = { shoot: [0], root: [180] } as const;

/** The direction a day's new shoot and root take, given the stimulus. */
export function growthOf(kind: PlantKind, side: Side): { shoot: number; root: number } {
  switch (kind) {
    case PlantKind.Phototropism:
      // Shoot towards the light, root away from it.
      return side === Side.Left ? { shoot: -40, root: 150 } : { shoot: 40, root: 210 };
    case PlantKind.Hydrotropism:
      // Shoot up (gravity), root towards the water.
      return side === Side.Left ? { shoot: 0, root: 220 } : { shoot: 0, root: 140 };
    default:
      // Gravity: shoot up, root down, whichever way the pot points.
      return { shoot: 0, root: 180 };
  }
}

const norm = (a: number): number => ((((a + 180) % 360) + 360) % 360) - 180;

/** Which way a piece at angle `a` points, roughly. */
export function directionOf(a: number): Direction {
  const n = norm(a);
  if (Math.abs(n) <= 30) return Direction.Up;
  if (Math.abs(n) >= 150) return Direction.Down;
  return n > 0 ? Direction.Right : Direction.Left;
}

/** The way the newest piece of shoot (or root) is heading. */
export function shootGoes(s: Pick<PlantState, "shoot">): Direction {
  return directionOf(s.shoot[s.shoot.length - 1] ?? 0);
}
export function rootGoes(s: Pick<PlantState, "root">): Direction {
  const a = s.root[s.root.length - 1] ?? 180;
  const n = norm(a);
  // A root heading down-left or down-right counts as bending that way.
  if (Math.abs(Math.abs(n) - 180) <= 15) return Direction.Down;
  if (Math.abs(n) <= 30) return Direction.Up;
  return n > 0 ? Direction.Right : Direction.Left;
}

export function shadySide(side: Side): Side {
  return side === Side.Left ? Side.Right : Side.Left;
}

export const KIND_WORDS: Readonly<Record<PlantKind, Words>> = {
  [PlantKind.TouchMeNot]: { en: "Touch-me-not (chhui-mui)", hi: "छुई-मुई" },
  [PlantKind.Tendril]: { en: "Pea tendril", hi: "मटर का प्रतान" },
  [PlantKind.Phototropism]: { en: "Phototropism: light", hi: "प्रकाशानुवर्तन: प्रकाश" },
  [PlantKind.Geotropism]: { en: "Geotropism: gravity", hi: "गुरुत्वानुवर्तन: गुरुत्व" },
  [PlantKind.Hydrotropism]: { en: "Hydrotropism: water", hi: "जलानुवर्तन: जल" },
  [PlantKind.PollenTube]: { en: "Chemotropism: pollen tube", hi: "रसायनानुवर्तन: पराग नलिका" },
};

export function plantCaption(s: PlantState): Words {
  switch (s.kind) {
    case PlantKind.TouchMeNot:
      return s.isFolded
        ? {
            en: "Touched! The message spread from cell to cell, and the leaflets folded at once. No growth: the cells at the leaf's base lost water and shrank.",
            hi: "छू लिया! संदेश कोशिका से कोशिका फैला, और पत्तियाँ तुरंत मुड़ गईं। कोई वृद्धि नहीं: पत्ती के आधार की कोशिकाओं ने पानी खोया और सिकुड़ गईं।",
          }
        : {
            en: "Tap a leaf. Watch where you touch, and where the plant moves.",
            hi: "किसी पत्ती पर टैप करो। देखो तुम कहाँ छूते हो, और पौधा कहाँ हिलता है।",
          };
    case PlantKind.Tendril:
      return s.days === 0
        ? {
            en: "A pea tendril has just touched a stick. Grow it a day at a time.",
            hi: "मटर के प्रतान ने अभी-अभी एक डंडी को छुआ है। इसे एक-एक दिन बढ़ाओ।",
          }
        : {
            en: "The side touching the stick grows more slowly than the side away from it, so the tendril curls round the stick and clings to it.",
            hi: "डंडी को छूने वाला भाग दूर वाले भाग से धीरे बढ़ता है, इसलिए प्रतान डंडी के चारों ओर लिपटकर उससे चिपक जाता है।",
          };
    case PlantKind.Phototropism:
      return s.days === 0
        ? {
            en: "Bean seedlings in a box that is open only on the window side. Grow them a day at a time.",
            hi: "डिब्बे में सेम के अंकुर, जो केवल खिड़की की ओर खुला है। इन्हें एक-एक दिन बढ़ाओ।",
          }
        : {
            en: "The shoot bends towards the light, and the root bends away from it. Move the light to the other side and grow again: only the new growth changes direction.",
            hi: "प्ररोह प्रकाश की ओर मुड़ता है, और जड़ उससे दूर। प्रकाश को दूसरी ओर करके फिर बढ़ाओ: केवल नई वृद्धि की दिशा बदलती है।",
          };
    case PlantKind.Geotropism:
      return s.potAngle === 90
        ? {
            en: "The pot is on its side, but the new root still grows down and the new shoot grows up: they respond to gravity.",
            hi: "गमला करवट लेटा है, पर नई जड़ फिर भी नीचे और नया प्ररोह ऊपर बढ़ता है: वे गुरुत्व के प्रति अनुक्रिया करते हैं।",
          }
        : {
            en: "Roots grow down and shoots grow up. Turn the pot on its side, then grow it again.",
            hi: "जड़ें नीचे और प्ररोह ऊपर बढ़ते हैं। गमले को करवट लिटाओ, फिर इसे बढ़ाओ।",
          };
    case PlantKind.Hydrotropism:
      return {
        en: "Water is on one side of the soil. The root grows towards it; the shoot still grows up.",
        hi: "मिट्टी में एक ओर पानी है। जड़ उसकी ओर बढ़ती है; प्ररोह फिर भी ऊपर बढ़ता है।",
      };
    case PlantKind.PollenTube:
      return s.days >= TUBE_DAYS
        ? {
            en: "The pollen tube has reached the ovule. It grew towards the chemicals the ovule gives off: chemotropism.",
            hi: "पराग नलिका बीजांड तक पहुँच गई। यह बीजांड से निकलने वाले रसायनों की ओर बढ़ी: रसायनानुवर्तन।",
          }
        : {
            en: "A pollen grain has landed on the stigma. Grow it a day at a time.",
            hi: "एक परागकण वर्तिकाग्र पर गिरा है। इसे एक-एक दिन बढ़ाओ।",
          };
  }
}

export function describePlant(s: PlantState): string {
  const base = `${KIND_WORDS[s.kind].en}. ${plantCaption(s).en}`;
  if (
    s.kind === PlantKind.Phototropism ||
    s.kind === PlantKind.Hydrotropism ||
    s.kind === PlantKind.Geotropism
  )
    return `${base} After ${s.days} day(s) the newest shoot is heading ${shootGoes(s)} and the newest root ${rootGoes(s)}${s.kind === PlantKind.Geotropism ? "" : `; the ${s.kind === PlantKind.Phototropism ? "light" : "water"} is on the ${s.side}`}.`;
  if (s.kind === PlantKind.Tendril) return `${base} Coils so far: ${Math.min(s.days, COIL_DAYS)}.`;
  if (s.kind === PlantKind.PollenTube)
    return `${base} The tube is ${Math.min(s.days, TUBE_DAYS)} of ${TUBE_DAYS} days long.`;
  return base;
}

const act = actionsFor<PlantState>();

export const plantMovement = defineProp({
  type: "plantMovement",
  describe:
    "How plants move. Touch-me-not: tap a leaf and the leaflets fold at once (no growth; cells lose water). The rest move by growing, a day per step: a pea tendril coils round a stick; bean seedlings in a box with a window (phototropism: shoot towards the light, root away; the light can be moved, and an overlay shows auxin on the shady side of the shoot tip); a pot that can be turned on its side (geotropism: new root down, new shoot up); soil with water on one side (hydrotropism: root towards the water); a pollen tube growing down to the ovule (chemotropism). Old growth keeps its direction; only new growth follows the stimulus.",
  state: plantState,
  defaults: {
    kind: PlantKind.Phototropism,
    side: Side.Right,
    days: 0,
    shoot: [...SEEDLING.shoot],
    root: [...SEEDLING.root],
    potAngle: 0,
    isFolded: false,
    showAuxin: false,
    showNames: true,
    canTouch: true,
    canGrow: true,
    canSetSide: true,
    canTurn: true,
  },
  inputs: ["kind", "showAuxin", "showNames", "canTouch", "canGrow", "canSetSide", "canTurn"],
  derived: {
    [PlantDerived.ShootGoes]: {
      describe: "Which way the newest shoot growth is heading: up, left or right",
      compute: (s) => shootGoes(s),
    },
    [PlantDerived.RootGoes]: {
      describe: "Which way the newest root growth is heading: down, left or right",
      compute: (s) => rootGoes(s),
    },
    [PlantDerived.IsFolded]: {
      describe: "Touch-me-not: whether the leaflets are folded",
      compute: (s) => s.isFolded,
    },
    [PlantDerived.Coils]: {
      describe: "Tendril: how many times it has coiled round the stick",
      compute: (s) => Math.min(s.days, COIL_DAYS),
    },
    [PlantDerived.HasReachedOvule]: {
      describe: "Pollen tube: whether it has reached the ovule",
      compute: (s) => s.days >= TUBE_DAYS,
    },
    [PlantDerived.ShadySide]: {
      describe: "Phototropism: the side of the shoot away from the light, where auxin collects",
      compute: (s) => shadySide(s.side),
    },
  },
  actions: {
    [PlantAction.Touch]: act({
      describe: "Touch-me-not: touch a leaf, and the leaflets fold",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.isFolded) return set({});
        return set({ isFolded: true }, { signal: PlantSignal.Touched, payload: {} });
      },
    }),
    [PlantAction.Recover]: act({
      describe: "Touch-me-not: some time later, the leaflets open again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isFolded: false }),
    }),
    [PlantAction.Grow]: act({
      describe: "Let one day pass: a new piece of shoot and root grows in the direction set today",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.days >= MAX_DAYS) return set({});
        const days = s.days + 1;
        const g = growthOf(s.kind, s.side);
        return set(
          { days, shoot: [...s.shoot, g.shoot], root: [...s.root, g.root] },
          {
            signal: PlantSignal.Grew,
            payload: {
              days,
              shootGoes: directionOf(g.shoot),
              rootGoes: rootGoes({ root: [g.root] }),
            },
          },
        );
      },
    }),
    [PlantAction.SetSide]: act({
      describe:
        "Phototropism: move the light (or turn the box) to this side; hydrotropism: put the water on this side. Growth so far stays as it is",
      byLearner: true,
      args: z.object({ side: z.nativeEnum(Side) }).strict(),
      run: (_s, a) => set({ side: a.side }),
    }),
    [PlantAction.Turn]: act({
      describe: "Geotropism: lay the pot on its side; everything grown so far turns with it",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.potAngle === 90) return set({});
        return set(
          {
            potAngle: 90,
            shoot: s.shoot.map((a) => a + 90),
            root: s.root.map((a) => a + 90),
          },
          { signal: PlantSignal.Turned, payload: {} },
        );
      },
    }),
    [PlantAction.Reset]: act({
      describe: "Start again with a fresh seedling",
      byLearner: true,
      args: z.object({}).strict(),
      run: () =>
        set({
          days: 0,
          shoot: [...SEEDLING.shoot],
          root: [...SEEDLING.root],
          potAngle: 0,
          isFolded: false,
        }),
    }),
  },
  signals: {
    [PlantSignal.Touched]: { describe: "Touch-me-not: a leaf was touched and the leaflets folded" },
    [PlantSignal.Grew]: {
      describe: "A day passed; `shootGoes` and `rootGoes` say which way the new growth went",
    },
    [PlantSignal.Turned]: { describe: "Geotropism: the pot was laid on its side" },
  },
  observe: (s) => ({
    summary: describePlant(s),
    elements: [{ id: PlantPart.Plant, value: describePlant(s) }],
  }),
  parts: (s) => {
    const parts: string[] = [PlantPart.Plant];
    if (s.kind === PlantKind.TouchMeNot) parts.push(PlantPart.Touch);
    else parts.push(PlantPart.Grow);
    if (s.kind === PlantKind.Phototropism || s.kind === PlantKind.Hydrotropism)
      parts.push(PlantPart.Stimulus, PlantPart.Side);
    if (s.kind === PlantKind.Geotropism) parts.push(PlantPart.Turn);
    return parts;
  },
});
