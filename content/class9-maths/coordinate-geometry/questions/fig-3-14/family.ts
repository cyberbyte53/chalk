import { family, place, scene, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { choice, plane } from "@chalk/patterns";
import { Marks, Tone, coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Fig. 3.14's points, each joined to the axes by dashed lines (L and M are on an axis). */
const POINTS = [
  { name: "B", x: -5, y: 2 },
  { name: "D", x: 6, y: 2 },
  { name: "L", x: 0, y: 5 },
  { name: "M", x: -3, y: 0 },
  { name: "H", x: -5, y: -3 },
  { name: "G", x: 2, y: -4 },
  { name: "E", x: -3, y: -5 },
  { name: "C", x: 5, y: -5 },
];

const same = (s: string): Localized => t(s, s);

/**
 * Each part of Ex 3.2 Q2, in the book's words: its answer first, then three real slips (the pair
 * written y first, a sign dropped, the point at the swapped pair).
 */
const PARTS = {
  b: {
    prompt: t("See the figure. What are the coordinates of B?", "आकृति देखिए। B के निर्देशांक क्या हैं?"),
    options: ["(−5, 2)", "(2, −5)", "(5, 2)", "(−5, −2)"],
  },
  c: {
    prompt: t("See the figure. What are the coordinates of C?", "आकृति देखिए। C के निर्देशांक क्या हैं?"),
    options: ["(5, −5)", "(−5, 5)", "(5, 5)", "(−5, −5)"],
  },
  e: {
    prompt: t(
      "See the figure. Which point is identified by (−3, −5)?",
      "आकृति देखिए। (−3, −5) से कौन-सा बिंदु पहचाना जाता है?",
    ),
    says: t(
      "See the figure. Which point is identified by minus 3, minus 5?",
      "आकृति देखिए। माइनस 3, माइनस 5 से कौन-सा बिंदु पहचाना जाता है?",
    ),
    options: ["E", "H", "M", "C"],
  },
  g: {
    prompt: t(
      "See the figure. Which point is identified by (2, −4)?",
      "आकृति देखिए। (2, −4) से कौन-सा बिंदु पहचाना जाता है?",
    ),
    says: t(
      "See the figure. Which point is identified by 2, minus 4?",
      "आकृति देखिए। 2, माइनस 4 से कौन-सा बिंदु पहचाना जाता है?",
    ),
    options: ["G", "C", "D", "H"],
  },
  d: {
    prompt: t("See the figure. What is the abscissa of D?", "आकृति देखिए। D का भुज क्या है?"),
    options: ["6", "2", "−6", "(6, 2)"],
  },
  h: {
    prompt: t("See the figure. What is the ordinate of H?", "आकृति देखिए। H की कोटि क्या है?"),
    options: ["−3", "−5", "3", "(−5, −3)"],
  },
  l: {
    prompt: t("See the figure. What are the coordinates of L?", "आकृति देखिए। L के निर्देशांक क्या हैं?"),
    options: ["(0, 5)", "(5, 0)", "(0, −5)", "(5, 5)"],
  },
  m: {
    prompt: t("See the figure. What are the coordinates of M?", "आकृति देखिए। M के निर्देशांक क्या हैं?"),
    options: ["(−3, 0)", "(0, −3)", "(3, 0)", "(−3, −3)"],
  },
} as const satisfies Record<
  string,
  { prompt: Localized; says?: Localized; options: readonly [string, ...string[]] }
>;

/** NCERT Ex 3.2 Q2: read Fig. 3.14 both ways, a point's coordinates and the point at a pair. */
export const fig314 = family({
  level: Level.Easy,
  tests: [Concept.CoordinatesOfAPoint],
  params: z.object({ part: z.enum(["b", "c", "e", "g", "d", "h", "l", "m"]) }).strict(),
  build: ({ part }) => {
    const ask = PARTS[part];
    const figure = place(
      coordinatePlane,
      plane.setup({
        plane: {
          // L at y = 5 and E, C at y = −5 a unit clear of the axes' ends.
          window: { xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 6.5 },
          marks: Marks.Numbers,
          numbered: ["x", "y"],
          hasGrid: true,
          showAxisNames: false,
          points: POINTS.map((p) => ({
            ...p,
            isShown: true,
            hasDropLines: p.x !== 0 && p.y !== 0,
            tone: Tone.Main,
          })),
        },
      }),
    );
    const question = choice({
      prompt: ask.prompt,
      ...("says" in ask ? { says: ask.says } : {}),
      options: ask.options.map((label, i) => ({ id: `o${i}`, label: same(label) })),
      answer: "o0",
    });
    return scene({ pieces: { figure, ask: question.piece }, uses: [question.use] });
  },
});
