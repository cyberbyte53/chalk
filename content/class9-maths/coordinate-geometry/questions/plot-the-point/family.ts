import { family, place, scene, t, tap } from "@chalk/author";
import { Level } from "@chalk/content";
import { check, plane } from "@chalk/patterns";
import { Marks, coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const shown = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const said = (n: number) => (n < 0 ? `minus ${-n}` : `${n}`);
const saidHi = (n: number) => (n < 0 ? `माइनस ${-n}` : `${n}`);

/**
 * A pair to plot by dragging a dot there, halves between the marks included. The notes are the slips: the two
 * numbers the wrong way round, and x's sign read the wrong way.
 */
export const plotThePoint = family({
  level: Level.Easy,
  tests: [Concept.PlottingPoints],
  params: z
    .object({
      x: z.number().multipleOf(0.5).min(-5).max(5),
      y: z.number().multipleOf(0.5).min(-5).max(5),
    })
    .strict()
    .refine((p) => p.x !== p.y, "x and y not equal, so the swap is another point"),
  build: ({ x, y }) => {
    const { isPlaced } = plane;
    const sheet = place(
      coordinatePlane,
      plane.setup({
        plane: {
          window: { xMin: -5.5, xMax: 5.5, yMin: -5.5, yMax: 5.5 },
          marks: Marks.Numbers,
          numbered: ["x", "y"],
          hasGrid: true,
          showAxisNames: false,
          showDirections: true,
        },
        // A dot to drag from the corner, its coordinates not written: where it goes is the answer.
        reading: {
          point: { x: -5, y: -5 },
          pointStep: 0.5,
          canMovePoint: true,
        },
      }),
    );
    const pair = `(${shown(x)}, ${shown(y)})`;
    const ask = check({
      about: "sheet",
      prompt: t(
        `Plot **${pair}**: drag the dot there, then press Check.`,
        `**${pair}** आलेखित करो: बिंदु को वहाँ खींचो, फिर जाँचो दबाओ।`,
      ),
      says: t(
        `Plot the point ${said(x)}, ${said(y)}: drag the dot there, then press Check.`,
        `बिंदु ${saidHi(x)}, ${saidHi(y)} आलेखित करो: बिंदु को वहाँ खींचो, फिर जाँचो दबाओ।`,
      ),
      isRight: isPlaced("sheet", x, y),
      solve: [tap("sheet.reading", "movePoint", { x, y })],
      notes: [
        {
          when: isPlaced("sheet", y, x),
          say: t(
            `That dot is at (${shown(y)}, ${shown(x)}): the numbers are the wrong way round. The first, ${shown(x)}, is along the x-axis; the second, ${shown(y)}, is up or down. Drag it again.`,
            `वह बिंदु (${shown(y)}, ${shown(x)}) पर है: संख्याएँ उलट गईं। पहली, ${shown(x)}, x-अक्ष के साथ है; दूसरी, ${shown(y)}, ऊपर या नीचे। उसे फिर से खींचो।`,
          ),
          reach: [tap("sheet.reading", "movePoint", { x: y, y: x })],
        },
        ...(x === 0
          ? []
          : [
              {
                when: isPlaced("sheet", -x, y),
                say: t(
                  `That dot is on the wrong side of the y-axis: x = ${shown(x)} is ${x > 0 ? "to the right" : "to the left"}. Drag it again.`,
                  `वह बिंदु y-अक्ष की ग़लत ओर है: x = ${shown(x)} ${x > 0 ? "दाईं ओर" : "बाईं ओर"} है। उसे फिर से खींचो।`,
                ),
                reach: [tap("sheet.reading", "movePoint", { x: -x, y })],
              },
            ]),
      ],
    });
    return scene({ pieces: { sheet, ask: ask.piece }, uses: [ask.use] });
  },
});
