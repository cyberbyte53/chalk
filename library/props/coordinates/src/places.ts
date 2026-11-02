import { localizedSchema } from "@chalk/content";
import { PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import {
  type Line,
  type PlaneCore,
  type Point,
  fromPlane,
  lineSchema,
  pointSchema,
  windowSchema,
} from "./plane";

/** When a tap on a place makes it the target. */
export const Choosing = {
  /** Never: the target is the lesson's (a question's answer, a picture). */
  Never: "never",
  /** Always: choosing is what the board asks for (tap a desk). */
  Always: "always",
  /** Once the board is open, its point made: free play after the story (any house is Aman's). */
  OnceOpen: "onceOpen",
} as const;
export type Choosing = (typeof Choosing)[keyof typeof Choosing];

/** What a place is drawn as. */
export const PlaceKind = {
  House: "house",
  Desk: "desk",
  Crossing: "crossing",
  Stall: "stall",
} as const;
export type PlaceKind = (typeof PlaceKind)[keyof typeof PlaceKind];

export const placeSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    /** Written on or beside it: a student's name on a desk, a stall's goods. */
    label: localizedSchema.optional(),
  })
  .strict();
export type Place = z.infer<typeof placeSchema>;

/** The plane's fields the places are drawn by. */
export const placesReads = fromPlane("window", "axisNames", "rising", "upLines");

export type PlacesState = Pick<PlaneCore, (typeof placesReads.keys)[number]> & {
  placeKind: PlaceKind;
  places: Place[];
  target: Point | null;
  targetName: z.infer<typeof localizedSchema>;
  choosing: Choosing;
  isOpen: boolean;
  lit: Line | null;
  showAddress: boolean;
};

/** The places with one number: every house on a street (x), or along a row (y). */
export const placesOn = (
  s: Pick<PlacesState, "places">,
  line: { axis: "x" | "y"; value: number },
): Place[] => s.places.filter((p) => p[line.axis] === line.value);

/** Whether the places are drawn: there are some. */
export const arePlacesOn = (s: Pick<PlacesState, "places">) => s.places.length > 0;

const MAX_PLACES = 120;

/**
 * The places: houses along streets, desks in rows, crossings, stalls. Tapping
 * one makes it the target; showing one number alone lights every place that has it. It draws by the
 * plane's window, names and streets, which it needs.
 */
export const places = prop({
  type: "places",
  role: PropRole.Explainer,
  describe:
    "Places at points, each drawn as a small picture: houses along streets, desks in rows, street crossings, stalls on a ground. Tapping a place makes it the target (where the board lets it: always, never, or once the board is open), whose address (its two numbers) is shown; showing one number alone lights every place that has it.",
  variables: z
    .object({
      placeKind: z.nativeEnum(PlaceKind),
      places: z.array(placeSchema).max(MAX_PLACES),
      /** The place someone is looking for (Aman's house), or null. */
      target: pointSchema.nullable(),
      /** What the target is called on screen ("Aman's house"). */
      targetName: localizedSchema,
      /** When a tap on a place makes it the target. */
      choosing: z.nativeEnum(Choosing),
      /** One number alone, and every place that has it lit, or null. */
      lit: lineSchema.nullable(),
      /** Whether the student lit it (tapping a number), so may turn it off; a lesson's light stays. */
      isLitByTap: z.boolean(),
      /** Whether the target's address is written above the plane (off when it is the answer). */
      showAddress: z.boolean(),
    })
    .strict(),
  start: {
    placeKind: PlaceKind.House,
    places: [],
    target: null,
    targetName: { en: "Aman's house", hi: "अमन का घर" },
    choosing: Choosing.Always,
    lit: null,
    isLitByTap: false,
    showAddress: true,
  },
  needs: z
    .object({
      window: windowSchema,
      axisNames: z.tuple([localizedSchema, localizedSchema]),
      rising: z.object({ at: z.number().int(), height: z.number() }).strict().nullable(),
      upLines: z.array(z.number().int()).nullable(),
      /** Whether the board is open for play (its point made). */
      isOpen: z.boolean(),
      /** How strongly the places show: behind a plane's lines, a lesson may fade them in (0 to 1). */
      backdrop: z.number().min(0).max(1),
    })
    .strict(),
  facts: {
    litCount: (me) => (me.lit === null ? 0 : placesOn(me, me.lit).length),
    canChoose: (me) =>
      me.choosing === Choosing.Always || (me.choosing === Choosing.OnceOpen && me.isOpen),
  },
  actions: {
    chooseTarget: action(pointSchema.shape, {
      from: "screen",
      describe: "Make the place at (x, y) the target (the student's tap)",
    }),
    markTarget: action(pointSchema.shape, {
      describe: "Mark the place at (x, y) as the target (the lesson: Aman says which house)",
    }),
    nameTarget: action(
      { name: localizedSchema },
      { describe: "Call the target something else (the lesson: once any house may be tapped)" },
    ),
    lightLine: action(
      { ...lineSchema.shape, isTap: z.boolean().optional() },
      { describe: "Light every place with this one number (isTap: the student tapped the number)" },
    ),
    clearLight: action({}, { from: "screen", describe: "Turn the lit places off" }),
  },
  signals: {
    targetChosen: signal({ ...pointSchema.shape, isAnother: z.boolean() }),
    lineLit: signal({ ...lineSchema.shape, count: z.number().int().min(0) }),
  },
  on: {
    chooseTarget: (me, p, t) => me.canChoose && t.self.markTarget(p),
    markTarget: (me, p, t) => {
      if (!me.places.some((q) => q.x === p.x && q.y === p.y)) return;
      const target = { x: p.x, y: p.y };
      return [
        t.set({ target, lit: null, isLitByTap: false }),
        t.tell.targetChosen({ ...target, isAnother: me.target !== null }),
      ];
    },
    lightLine: (me, { isTap, ...line }, t) => [
      t.set({ lit: line, isLitByTap: isTap === true }),
      t.tell.lineLit({ ...line, count: placesOn(me, line).length }),
    ],
    clearLight: (_, __, t) => t.set({ lit: null, isLitByTap: false }),
    nameTarget: (_, { name }, t) => t.set({ targetName: name }),
  },
  invariant: (s) =>
    s.target !== null && !s.places.some((p) => p.x === s.target?.x && p.y === s.target?.y)
      ? `the target (${s.target.x}, ${s.target.y}) is not one of the places`
      : undefined,
});
