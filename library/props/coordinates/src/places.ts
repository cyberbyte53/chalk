import { localizedSchema } from "@chalk/content";
import { PropRole, actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import { type Line, type PlaneCore, type Point, fromPlane, lineSchema, pointSchema } from "./plane";

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
  canChooseTarget: boolean;
  lit: Line | null;
  showAddress: boolean;
};

const MAX_PLACES = 120;

/** The places with one number: every house on a street (x), or along a row (y). */
export const placesOn = (
  s: Pick<PlacesState, "places">,
  line: { axis: "x" | "y"; value: number },
): Place[] => s.places.filter((p) => p[line.axis] === line.value);

/** Whether there is a place at p. */
export const isPlace = (s: Pick<PlacesState, "places">, p: Point) =>
  s.places.some((q) => q.x === p.x && q.y === p.y);
const act = actionsFor<PlacesState>();
const none = z.object({}).strict();

export const placesSignals = {
  targetChosen: signal(
    "A place was made the target (Aman's house): its address (`x`, `y`); `isAnother` when another was the target before",
    { ...pointSchema.shape, isAnother: z.boolean() },
  ),
  lineLit: signal("Every place with one number is lit: `axis` = `value`, `count` places", {
    ...lineSchema.shape,
    count: z.number().int().min(0),
  }),
};

/** Whether the places are drawn: there are some. */
export const arePlacesOn = (s: Pick<PlacesState, "places">) => s.places.length > 0;

export const places = defineProp({
  type: "planePlaces",
  role: PropRole.Explainer,
  drawsOn: "plane",
  describe:
    "Places at points, each drawn as a small picture: houses along streets, desks in rows, street crossings, stalls on a ground. Tapping a place makes it the target, whose address (its two numbers) is shown; showing one number alone lights every place that has it.",
  state: z
    .object({
      ...placesReads.fields,
      placeKind: z.nativeEnum(PlaceKind),
      /** The places, at whole-number points. */
      places: z.array(placeSchema).max(MAX_PLACES),
      /** The place someone is looking for (Aman's house), or null. */
      target: pointSchema.nullable(),
      /** What the target is called on screen ("Aman's house"). */
      targetName: localizedSchema,
      /** Whether a tap on a place makes it the target. */
      canChooseTarget: z.boolean(),
      /** One number alone, and every place that has it lit, or null. */
      lit: lineSchema.nullable(),
      /** Whether the student may turn the light off (always, here; the scene layer tells taps apart). */
      isLitByTap: z.boolean(),
      /** Whether the target's address is written above the plane (off when it is the answer). */
      showAddress: z.boolean(),
    })
    .strict(),
  defaults: {
    ...placesReads.defaults,
    placeKind: PlaceKind.House,
    places: [],
    target: null,
    targetName: { en: "Aman's house", hi: "अमन का घर" },
    canChooseTarget: true,
    lit: null,
    isLitByTap: true,
    showAddress: true,
  },
  actions: {
    chooseTarget: act({
      describe: "Make the place at (x, y) the target; its address is shown (the learner's tap)",
      byLearner: true,
      args: pointSchema,
      changes: ["target", "lit"],
      run: (s, p) => {
        if (!s.canChooseTarget || !isPlace(s, p)) return set({});
        const target = { x: p.x, y: p.y };
        const isAnother = s.target !== null;
        return set(
          { target, lit: null },
          raise(placesSignals.targetChosen, { ...target, isAnother }),
        );
      },
    }),
    lightLine: act({
      describe:
        "Light every place with this one number: all the houses on Street 4 (on the coordinate plane, the learner taps the number)",
      args: lineSchema,
      changes: ["lit"],
      run: (s, line) => {
        const count = placesOn(s, line).length;
        return set({ lit: line }, raise(placesSignals.lineLit, { ...line, count }));
      },
    }),
    clearLight: act({
      describe: "Turn the lit places off",
      byLearner: true,
      args: none,
      changes: ["lit"],
      run: () => set({ lit: null }),
    }),
  },
  signals: placesSignals,
  derived: {
    litCount: {
      describe: "How many places the lit number leaves",
      compute: (s) => (s.lit === null ? 0 : placesOn(s, s.lit).length),
    },
  },
  invariant: (s) =>
    s.target !== null && !s.places.some((p) => p.x === s.target?.x && p.y === s.target?.y)
      ? `the target (${s.target.x}, ${s.target.y}) is not one of the places`
      : undefined,
});
