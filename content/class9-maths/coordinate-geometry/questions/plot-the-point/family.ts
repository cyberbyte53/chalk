import { family, place, scene, t, tap } from "@chalk/author";
import { Level } from "@chalk/content";
import { check, plane } from "@chalk/patterns";
import { Marks, coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const shown = (n: number) => (n < 0 ? `−${-n}` : `${n}`);

/** A pair as a mark: shown (−2.5, 3), said as "the point minus 2.5, 3" in a language's words. */
const pointMark = (point: string, minus: string) => (x: number, y: number) => {
  const said = [x, y].map((n) => (n < 0 ? `${minus} ${-n}` : `${n}`)).join(", ");
  return `[[(${shown(x)}, ${shown(y)})|${point} ${said}]]`;
};
const pointEn = pointMark("the point", "minus");
const pointHi = pointMark("बिंदु", "माइनस");
/** A pair alone as a mark, its words in Hindi: "बिंदु" stays on screen before it. */
const pairHi = (x: number, y: number) =>
  `[[(${shown(x)}, ${shown(y)})|${[x, y].map((n) => (n < 0 ? `माइनस ${-n}` : `${n}`)).join(", ")}]]`;

/** A number as a mark where it has a sign: shown −3.5, said "minus 3.5" in a language's words. */
const numberMark = (minus: string) => (n: number) =>
  n < 0 ? `[[${shown(n)}|${minus} ${-n}]]` : shown(n);
const numberEn = numberMark("minus");
const numberHi = numberMark("माइनस");

/** "x = −2" as a mark: said "x equals minus 2" (en), "एक्स बराबर माइनस 2" (hi). */
const equalsEn = (letter: "x" | "y", n: number) =>
  `[[${letter}\u00a0=\u00a0${shown(n)}|${letter} equals ${n < 0 ? `minus ${-n}` : n}]]`;
const equalsHi = (letter: "x" | "y", n: number) =>
  `[[${letter}\u00a0=\u00a0${shown(n)}|${letter === "x" ? "एक्स" : "वाई"} बराबर ${n < 0 ? `माइनस ${-n}` : n}]]`;

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
    const { isPlaced, placedAt } = plane;
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
        // A dot to drag from O, as on every plotting board; its coordinates not written: where
        // it goes is the answer.
        reading: {
          point: { x: 0, y: 0 },
          pointStep: 0.5,
          canMovePoint: true,
        },
      }),
    );
    const ask = check({
      about: "sheet",
      prompt: t(
        `Plot **${pointEn(x, y)}**: drag the dot there, then press Check.`,
        `**${pointHi(x, y)}** आलेखित करो: बिंदु को वहाँ खींचो, फिर जाँचो दबाओ।`,
      ),
      isRight: isPlaced("sheet", x, y),
      answer: (read) => {
        const p = placedAt("sheet")(read);
        return p === null
          ? null
          : t(`(${shown(p.x)}, ${shown(p.y)})`, `(${shown(p.x)}, ${shown(p.y)})`);
      },
      solve: [tap("sheet.reading", "movePoint", { x, y })],
      notes: [
        {
          when: isPlaced("sheet", y, x),
          say: t(
            `That dot is at ${pointEn(y, x)}: the numbers are the wrong way round. The first, ${numberEn(x)}, is along the x-axis; the second, ${numberEn(y)}, is up or down. Drag it again.`,
            `वह बिंदु ${pairHi(y, x)} पर है: संख्याएँ उलट गईं। पहली, ${numberHi(x)}, x-अक्ष के साथ है; दूसरी, ${numberHi(y)}, ऊपर या नीचे। उसे फिर से खींचो।`,
          ),
          reach: [tap("sheet.reading", "movePoint", { x: y, y: x })],
        },
        ...(x === 0
          ? []
          : [
              {
                when: isPlaced("sheet", -x, y),
                say: t(
                  `That dot is on the wrong side of the y-axis: ${equalsEn("x", x)} is ${x > 0 ? "to the right" : "to the left"}. Drag it again.`,
                  `वह बिंदु y-अक्ष की ग़लत ओर है: ${equalsHi("x", x)} ${x > 0 ? "दाईं ओर" : "बाईं ओर"} है। उसे फिर से खींचो।`,
                ),
                reach: [tap("sheet.reading", "movePoint", { x: -x, y })],
              },
            ]),
        ...(y === 0
          ? []
          : [
              {
                when: isPlaced("sheet", x, -y),
                say: t(
                  `That dot is on the wrong side of the x-axis: ${equalsEn("y", y)} is ${y > 0 ? "up" : "down"}. Drag it again.`,
                  `वह बिंदु x-अक्ष की ग़लत ओर है: ${equalsHi("y", y)} ${y > 0 ? "ऊपर" : "नीचे"} है। उसे फिर से खींचो।`,
                ),
                reach: [tap("sheet.reading", "movePoint", { x, y: -y })],
              },
            ]),
      ],
    });
    return scene({ pieces: { sheet, ask: ask } });
  },
});
