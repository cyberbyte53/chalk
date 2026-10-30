import { localizedSchema } from "@chalk/content";
import { PropRole } from "@chalk/prop";
import { action, prop, signal } from "@chalk/prop/next";
import { z } from "zod";
import { PlaceKind, placeSchema, placesOn } from "../places";
import { lineSchema, pointSchema, windowSchema } from "../plane";

/**
 * The places, on the event model: houses along streets, desks in rows, crossings, stalls. Tapping
 * one makes it the target; showing one number alone lights every place that has it. It draws by the
 * plane's window, names and streets, which it needs.
 */

const MAX_PLACES = 120;

export const places = prop({
  type: "scenePlaces",
  role: PropRole.Explainer,
  describe:
    "Places at points, each drawn as a small picture: houses along streets, desks in rows, street crossings, stalls on a ground. Tapping a place makes it the target, whose address (its two numbers) is shown; showing one number alone lights every place that has it.",
  variables: z
    .object({
      placeKind: z.nativeEnum(PlaceKind),
      places: z.array(placeSchema).max(MAX_PLACES),
      /** The place someone is looking for (Aman's house), or null. */
      target: pointSchema.nullable(),
      /** What the target is called on screen ("Aman's house"). */
      targetName: localizedSchema,
      /** Whether a tap on a place makes it the target. */
      canChooseTarget: z.boolean(),
      /** One number alone, and every place that has it lit, or null. */
      lit: lineSchema.nullable(),
      /** Whether the target's address is written above the plane (off when it is the answer). */
      showAddress: z.boolean(),
    })
    .strict(),
  start: {
    placeKind: PlaceKind.House,
    places: [],
    target: null,
    targetName: { en: "Aman's house", hi: "अमन का घर" },
    canChooseTarget: true,
    lit: null,
    showAddress: true,
  },
  needs: z
    .object({
      window: windowSchema,
      axisNames: z.tuple([localizedSchema, localizedSchema]),
      rising: z.object({ at: z.number().int(), height: z.number() }).strict().nullable(),
      upLines: z.array(z.number().int()).nullable(),
    })
    .strict(),
  facts: { litCount: (me) => (me.lit === null ? 0 : placesOn(me, me.lit).length) },
  actions: {
    chooseTarget: action(pointSchema.shape, {
      from: "screen",
      describe: "Make the place at (x, y) the target",
    }),
    lightLine: action(lineSchema.shape, { describe: "Light every place with this one number" }),
    clearLight: action({}, { from: "screen", describe: "Turn the lit places off" }),
  },
  signals: {
    targetChosen: signal({ ...pointSchema.shape, isAnother: z.boolean() }),
    lineLit: signal({ ...lineSchema.shape, count: z.number().int().min(0) }),
  },
  on: {
    chooseTarget: (me, p, t) => {
      if (!me.canChooseTarget || !me.places.some((q) => q.x === p.x && q.y === p.y)) return;
      const target = { x: p.x, y: p.y };
      return [
        t.set({ target, lit: null }),
        t.tell.targetChosen({ ...target, isAnother: me.target !== null }),
      ];
    },
    lightLine: (me, line, t) => [
      t.set({ lit: line }),
      t.tell.lineLit({ ...line, count: placesOn(me, line).length }),
    ],
    clearLight: (_, __, t) => t.set({ lit: null }),
  },
  invariant: (s) =>
    s.target !== null && !s.places.some((p) => p.x === s.target?.x && p.y === s.target?.y)
      ? `the target (${s.target.x}, ${s.target.y}) is not one of the places`
      : undefined,
});
