import { localizedSchema } from "@chalk/content";
import { z } from "zod";
import { type Line, type PlaneCore, type Point, fromPlane } from "./plane";

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

/** The places with one number: every house on a street (x), or along a row (y). */
export const placesOn = (
  s: Pick<PlacesState, "places">,
  line: { axis: "x" | "y"; value: number },
): Place[] => s.places.filter((p) => p[line.axis] === line.value);

/** Whether the places are drawn: there are some. */
export const arePlacesOn = (s: Pick<PlacesState, "places">) => s.places.length > 0;
