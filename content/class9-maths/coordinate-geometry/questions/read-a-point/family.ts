import { family, place, scene, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choice, plane } from "@chalk/patterns";
import { Marks, Tone, coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const shown = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const pairOf = (x: number, y: number) => `(${shown(x)}, ${shown(y)})`;

/**
 * A point on the axes, with its dashed lines to them: its coordinates read. The wrong options are
 * the slips students make: y written first, and one sign read the wrong way. x and y are not 0 and
 * not equal, so the four never coincide.
 */
export const readAPoint = family({
  level: Level.Easy,
  tests: [Concept.CoordinatesOfAPoint],
  params: z
    .object({ x: z.number().int().min(-5).max(5), y: z.number().int().min(-5).max(5) })
    .strict()
    .refine((p) => p.x !== 0 && p.y !== 0 && p.x !== p.y, "x and y not 0, and not equal"),
  build: ({ x, y }) => {
    const figure = place(
      coordinatePlane,
      plane.setup({
        plane: {
          window: { xMin: -5.5, xMax: 5.5, yMin: -5.5, yMax: 5.5 },
          marks: Marks.Numbers,
          numbered: ["x", "y"],
          hasGrid: true,
          showAxisNames: false,
          points: [{ name: "P", x, y, isShown: true, hasDropLines: true, tone: Tone.Main }],
        },
      }),
    );
    const options = [
      { id: "right", pair: pairOf(x, y) },
      { id: "swapped", pair: pairOf(y, x) },
      { id: "xSign", pair: pairOf(-x, y) },
      { id: "ySign", pair: pairOf(x, -y) },
    ];
    const ask = choice({
      prompt: t("What are the coordinates of the point P?", "बिंदु P के निर्देशांक क्या हैं?"),
      options: options.map((o) => ({ id: o.id, label: t(o.pair, o.pair) })),
      answer: "right",
    });
    return scene({ pieces: { figure, ask: ask.piece }, uses: [ask.use] });
  },
});
