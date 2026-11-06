import { family, place, scene, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { check, plane } from "@chalk/patterns";
import {
  Axes,
  Choosing,
  Marks,
  PlaceKind,
  Roads,
  WalkerKind,
  coordinatePlane,
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
  build: ({ stop }) => {
    const { isAt, walkTo, walkerAt } = plane;
    const shown = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
    const road = place(coordinatePlane, {
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
        choosing: Choosing.Never,
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
    const ask = check({
      about: "road",
      prompt: t(
        `The bus starts at the stand, 0. Take it to stop **${stop < 0 ? `−${-stop}` : stop}**, then press Check.`,
        `बस अड्डे, 0, से चलती है। इसे स्टॉप **${stop < 0 ? `−${-stop}` : stop}** पर ले जाओ, फिर जाँचो दबाओ।`,
      ),
      says: t(
        `The bus starts at the stand, 0. Take it to stop ${stop < 0 ? `minus ${-stop}` : stop}, then press Check.`,
        `बस अड्डे, 0, से चलती है। इसे स्टॉप ${stop < 0 ? `माइनस ${-stop}` : stop} पर ले जाओ, फिर जाँचो दबाओ।`,
      ),
      isRight: isAt("road", stop, 0),
      answer: (read) => {
        const { x } = walkerAt("road")(read);
        return x === 0 ? t("the stand, 0", "अड्डा, 0") : t(`stop ${shown(x)}`, `स्टॉप ${shown(x)}`);
      },
      solve: walkTo("road", stop, 0),
      notes: [
        {
          when: isAt("road", -stop, 0),
          say: t(
            `That's stop ${-stop < 0 ? `−${stop}` : -stop}: the right distance, on the wrong side. The sign says which side of 0.`,
            `यह स्टॉप ${-stop < 0 ? `−${stop}` : -stop} है: दूरी ठीक, पर ओर गलत। चिह्न बताता है कि 0 के किस ओर।`,
          ),
          reach: walkTo("road", -stop, 0),
        },
      ],
    });
    return scene({ pieces: { road, ask: ask.piece }, uses: [ask.use] });
  },
});
