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
    const said = (n: number, minus: string) => (n < 0 ? `${minus} ${-n}` : `${n}`);
    const lr = x < 0 ? ["left", "बाईं"] : ["right", "दाईं"];
    const ud = y < 0 ? ["below", "नीचे"] : ["above", "ऊपर"];
    const sign = (v: number) => (v < 0 ? ["negative", "ऋणात्मक"] : ["positive", "धनात्मक"]);
    // Each slip and its note: y written first, or one sign the wrong way.
    const wrong = [
      {
        id: "swapped",
        pair: pairOf(y, x),
        en: `That is y first. P is ${Math.abs(x)} units ${lr[0]} of the y-axis, so x = ${shown(x)}, written first.`,
        hi: `यह y पहले है। P, y-अक्ष से ${Math.abs(x)} इकाई ${lr[1]} ओर है, इसलिए x = ${shown(x)}, जो पहले लिखा जाता है।`,
        enSays: `That is y first. P is ${Math.abs(x)} units ${lr[0]} of the y-axis, so x is ${said(x, "minus")}, written first.`,
        hiSays: `यह वाई पहले है। P, वाई-अक्ष से ${Math.abs(x)} इकाई ${lr[1]} ओर है, इसलिए एक्स ${said(x, "माइनस")} है, जो पहले लिखा जाता है।`,
      },
      {
        id: "xSign",
        pair: pairOf(-x, y),
        en: `That point is on the other side of the y-axis. P is ${lr[0]} of it, so its x-coordinate is ${sign(x)[0]}.`,
        hi: `वह बिंदु y-अक्ष की दूसरी ओर है। P उसके ${lr[1]} ओर है, इसलिए उसका x-निर्देशांक ${sign(x)[1]} है।`,
        enSays: `That point is on the other side of the y-axis. P is ${lr[0]} of it, so its x-coordinate is ${sign(x)[0]}.`,
        hiSays: `वह बिंदु वाई-अक्ष की दूसरी ओर है। P उसके ${lr[1]} ओर है, इसलिए उसका एक्स-निर्देशांक ${sign(x)[1]} है।`,
      },
      {
        id: "ySign",
        pair: pairOf(x, -y),
        en: `That point is on the other side of the x-axis. P is ${ud[0]} it, so its y-coordinate is ${sign(y)[0]}.`,
        hi: `वह बिंदु x-अक्ष की दूसरी ओर है। P उसके ${ud[1]} है, इसलिए उसका y-निर्देशांक ${sign(y)[1]} है।`,
        enSays: `That point is on the other side of the x-axis. P is ${ud[0]} it, so its y-coordinate is ${sign(y)[0]}.`,
        hiSays: `वह बिंदु एक्स-अक्ष की दूसरी ओर है। P उसके ${ud[1]} है, इसलिए उसका वाई-निर्देशांक ${sign(y)[1]} है।`,
      },
    ];
    const ask = choice({
      prompt: t("What are the coordinates of the point P?", "बिंदु P के निर्देशांक क्या हैं?"),
      options: [
        { id: "right", label: t(pairOf(x, y), pairOf(x, y)) },
        ...wrong.map((w) => ({
          id: w.id,
          label: t(w.pair, w.pair),
          feedback: t(w.en, w.hi),
          feedbackSays: t(w.enSays, w.hiSays),
        })),
      ],
      answer: "right",
    });
    return scene({ pieces: { figure, ask: ask.piece }, uses: [ask.use] });
  },
});
