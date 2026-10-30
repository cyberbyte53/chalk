import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { check, isAt, walkTo } from "@chalk/patterns";
import {
  Axes,
  Marks,
  PlaceKind,
  Roads,
  WalkerKind,
  coordinatePlaneDef,
} from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** On a number line, one number fixes a place: take the bus to a stop, either side of the stand. */
export const busToStop = family({
  level: Level.Easy,
  tests: [Concept.TwoNumbersForAPlace],
  params: z
    .object({ stop: z.number().int().min(-6).max(6) })
    .strict()
    .refine((p) => p.stop !== 0, "a stop, not the stand"),
  build: ({ stop }, b) => {
    const road = b.prop(coordinatePlaneDef, "road", {
      plane: {
        window: { xMin: -6, xMax: 6, yMin: 0, yMax: 0.5 },
        axes: Axes.Horizontal,
        marks: Marks.Numbers,
        showAxisNames: false,
        showOrigin: false,
      },
      places: {
        places: [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 0 })),
        placeKind: PlaceKind.Crossing,
        canChooseTarget: false,
      },
      walker: {
        walkFrom: { x: 0, y: 0 },
        at: { x: 0, y: 0 },
        roads: Roads.Grid,
        walkerKind: WalkerKind.Bus,
        walkerName: t("The bus", "बस"),
        showWhere: false,
      },
    });
    const ask = check(b, {
      about: road,
      prompt: t(
        `The bus starts at the stand, 0. Take it to stop **${stop < 0 ? `−${-stop}` : stop}**, then press Check.`,
        `बस अड्डे, 0, से चलती है। इसे स्टॉप **${stop < 0 ? `−${-stop}` : stop}** पर ले जाओ, फिर जाँचो दबाओ।`,
      ),
      isRight: isAt(road, stop, 0),
      solve: walkTo(road, stop, 0),
      notes: [
        {
          when: isAt(road, -stop, 0),
          say: t(
            `That's stop ${-stop < 0 ? `−${stop}` : -stop}: the right distance, on the wrong side. The sign says which side of 0.`,
            `यह स्टॉप ${-stop < 0 ? `−${stop}` : -stop} है: दूरी ठीक, पर ओर गलत। चिह्न बताता है कि 0 के किस ओर।`,
          ),
          reach: walkTo(road, -stop, 0),
        },
      ],
    });
    return [road, ask];
  },
});
