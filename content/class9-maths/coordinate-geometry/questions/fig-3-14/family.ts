import { family, place, scene, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { choice, plane } from "@chalk/patterns";
import { Marks, Tone, coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Fig. 3.14's points, each joined to the axes by dashed lines (L and M are on an axis). */
const POINTS = {
  B: { x: -5, y: 2 },
  D: { x: 6, y: 2 },
  L: { x: 0, y: 5 },
  M: { x: -3, y: 0 },
  H: { x: -5, y: -3 },
  G: { x: 2, y: -4 },
  E: { x: -3, y: -5 },
  C: { x: 5, y: -5 },
} as const;
type Name = keyof typeof POINTS;
type Point = { x: number; y: number };

const shown = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const pairOf = (p: Point) => `(${shown(p.x)}, ${shown(p.y)})`;
const spoken = (n: number, minus: string) => (n < 0 ? `${minus} ${-n}` : `${n}`);
const same = (s: string): Localized => t(s, s);

/** A pair in a line, as a mark: shown (−3, 5), said in a language's words after `as` ("the point"). */
const pairMark = (p: Point, minus: string, as: string) =>
  `[[${pairOf(p)}|${as} ${spoken(p.x, minus)}, ${spoken(p.y, minus)}]]`;
/** An axis letter in a Hindi line: written x, said एक्स. */
const hiLetter = (v: "x" | "y") => (v === "x" ? "[[x|एक्स]]" : "[[y|वाई]]");
/** "x = −3" in a sentence, as a mark: said "x is minus 3", in Hindi "एक्स माइनस 3 है". */
const isEn = (v: "x" | "y", n: number) =>
  `[[${v}\u00a0=\u00a0${shown(n)}|${v} is ${spoken(n, "minus")}]]`;
const isHi = (v: "x" | "y", n: number) =>
  `[[${v}\u00a0=\u00a0${shown(n)}|${v === "x" ? "एक्स" : "वाई"} ${spoken(n, "माइनस")} है]]`;

/** A wrong option and its note: the slip it is, for the point asked about. */
type Wrong = { label: string; feedback: Localized };

/** The pair written y first. */
function swapped(name: Name): Wrong {
  const p = POINTS[name];
  const q = { x: p.y, y: p.x };
  const side = p.x < 0 ? ["left", "बाईं"] : ["right", "दाईं"];
  return {
    label: pairOf(q),
    feedback: t(
      `That is y first. ${name} is ${Math.abs(p.x)} units ${side[0]} of the y-axis, so ${isEn("x", p.x)}, written first.`,
      `यह ${hiLetter("y")} पहले है। ${name}, ${hiLetter("y")}-अक्ष से ${Math.abs(p.x)} इकाई ${side[1]} ओर है, इसलिए ${isHi("x", p.x)}, जो पहले लिखा जाता है।`,
    ),
  };
}

/** One coordinate's sign the wrong way: the point on the other side of that axis. */
function flipped(name: Name, axis: "x" | "y"): Wrong {
  const p = POINTS[name];
  const q = axis === "x" ? { x: -p.x, y: p.y } : { x: p.x, y: -p.y };
  const [where, whereHi] =
    axis === "x"
      ? p.x < 0
        ? ["left of the y-axis", `${hiLetter("y")}-अक्ष के बाईं ओर`]
        : ["right of the y-axis", `${hiLetter("y")}-अक्ष के दाईं ओर`]
      : p.y < 0
        ? ["below the x-axis", `${hiLetter("x")}-अक्ष के नीचे`]
        : ["above the x-axis", `${hiLetter("x")}-अक्ष के ऊपर`];
  const sign = (axis === "x" ? p.x : p.y) < 0 ? ["negative", "ऋणात्मक"] : ["positive", "धनात्मक"];
  return {
    label: pairOf(q),
    feedback: t(
      `${pairMark(q, "minus", "The point")} is on the other side. ${name} is ${where}, so its ${axis}-coordinate is ${sign[0]}.`,
      `${pairMark(q, "माइनस", "बिंदु")} दूसरी ओर है। ${name}, ${whereHi} है, इसलिए उसका ${hiLetter(axis)}-निर्देशांक ${sign[1]} है।`,
    ),
  };
}

/** Another point of the figure, taken for the one at the pair asked about: where it is. */
function another(name: Name): Wrong {
  const p = POINTS[name];
  return {
    label: name,
    feedback: t(
      `${name} is ${pairMark(p, "minus", "the point")}.`,
      `${name} है ${pairMark(p, "माइनस", "बिंदु")}।`,
    ),
  };
}

/** A note for a number option of a one-coordinate part. */
const note = (label: string, en: string, hi: string): Wrong => ({ label, feedback: t(en, hi) });

/**
 * Each part of Ex 3.2 Q2, in the book's words: its answer, then three real slips, each with its
 * note. For the two "which point" parts no point of the figure sits at the pair read y first or
 * with a sign flipped, so the wrong options are the figure's other points, each with where it is.
 */
const PARTS: Record<
  "b" | "c" | "e" | "g" | "d" | "h" | "l" | "m",
  { prompt: Localized; answer: string; wrong: Wrong[] }
> = {
  b: {
    prompt: t("See the figure. What are the coordinates of B?", "आकृति देखिए। B के निर्देशांक क्या हैं?"),
    answer: pairOf(POINTS.B),
    wrong: [swapped("B"), flipped("B", "x"), flipped("B", "y")],
  },
  c: {
    prompt: t("See the figure. What are the coordinates of C?", "आकृति देखिए। C के निर्देशांक क्या हैं?"),
    answer: pairOf(POINTS.C),
    wrong: [swapped("C"), flipped("C", "x"), flipped("C", "y")],
  },
  e: {
    prompt: t(
      "See the figure. Which point is identified by [[(−3, −5)|minus 3, minus 5]]?",
      "आकृति देखिए। [[(−3, −5)|माइनस 3, माइनस 5]] से कौन-सा बिंदु पहचाना जाता है?",
    ),
    answer: "E",
    wrong: [another("H"), another("M"), another("C")],
  },
  g: {
    prompt: t(
      "See the figure. Which point is identified by [[(2, −4)|2, minus 4]]?",
      "आकृति देखिए। [[(2, −4)|2, माइनस 4]] से कौन-सा बिंदु पहचाना जाता है?",
    ),
    answer: "G",
    wrong: [another("C"), another("D"), another("H")],
  },
  d: {
    prompt: t("See the figure. What is the abscissa of D?", "आकृति देखिए। D का भुज क्या है?"),
    answer: "6",
    wrong: [
      note(
        "2",
        "2 is D's ordinate: its distance from the x-axis. The abscissa is its distance from the y-axis.",
        "2, D की कोटि है: x-अक्ष से उसकी दूरी। भुज, y-अक्ष से उसकी दूरी है।",
      ),
      note(
        "−6",
        "D is right of the y-axis, so its abscissa is positive.",
        "D, y-अक्ष के दाईं ओर है, इसलिए उसका भुज धनात्मक है।",
      ),
      note(
        "(6, 2)",
        "That is D's pair. The abscissa is one number: the first.",
        "यह D का जोड़ा है। भुज एक संख्या है: पहली।",
      ),
    ],
  },
  h: {
    prompt: t("See the figure. What is the ordinate of H?", "आकृति देखिए। H की कोटि क्या है?"),
    answer: "−3",
    wrong: [
      note(
        "−5",
        "[[−5|Minus 5]] is H's abscissa: its distance from the y-axis. The ordinate is its distance from the x-axis.",
        "[[−5|माइनस 5]], H का भुज है: [[y|वाई]]-अक्ष से उसकी दूरी। कोटि, [[x|एक्स]]-अक्ष से उसकी दूरी है।",
      ),
      note(
        "3",
        "H is below the x-axis, so its ordinate is negative.",
        "H, x-अक्ष के नीचे है, इसलिए उसकी कोटि ऋणात्मक है।",
      ),
      note(
        "(−5, −3)",
        "That is H's pair. The ordinate is one number: the second.",
        "यह H का जोड़ा है। कोटि एक संख्या है: दूसरी।",
      ),
    ],
  },
  l: {
    prompt: t("See the figure. What are the coordinates of L?", "आकृति देखिए। L के निर्देशांक क्या हैं?"),
    answer: pairOf(POINTS.L),
    wrong: [
      note(
        "(5, 0)",
        `That is y first. L is on the y-axis, 0 units from it, so ${isEn("x", 0)}, written first.`,
        `यह ${hiLetter("y")} पहले है। L, ${hiLetter("y")}-अक्ष पर है, उससे 0 इकाई दूर, इसलिए ${isHi("x", 0)}, जो पहले लिखा जाता है।`,
      ),
      flipped("L", "y"),
      note(
        "(5, 5)",
        "L is on the y-axis: 0 units from it, so its x-coordinate is 0.",
        "L, y-अक्ष पर है: उससे 0 इकाई दूर, इसलिए उसका x-निर्देशांक 0 है।",
      ),
    ],
  },
  m: {
    prompt: t("See the figure. What are the coordinates of M?", "आकृति देखिए। M के निर्देशांक क्या हैं?"),
    answer: pairOf(POINTS.M),
    wrong: [
      note(
        "(0, −3)",
        `That is y first. M is on the x-axis, 0 units from it, so ${isEn("y", 0)}, written second.`,
        `यह ${hiLetter("y")} पहले है। M, ${hiLetter("x")}-अक्ष पर है, उससे 0 इकाई दूर, इसलिए ${isHi("y", 0)}, जो दूसरा लिखा जाता है।`,
      ),
      flipped("M", "x"),
      note(
        "(−3, −3)",
        "M is on the x-axis: 0 units from it, so its y-coordinate is 0.",
        "M, x-अक्ष पर है: उससे 0 इकाई दूर, इसलिए उसका y-निर्देशांक 0 है।",
      ),
    ],
  },
};

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
          // L at y\u00a0=\u00a05 and E, C at y\u00a0=\u00a0−5 a unit clear of the axes' ends.
          window: { xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 7.5 },
          marks: Marks.Numbers,
          numbered: ["x", "y"],
          hasGrid: true,
          showAxisNames: false,
          points: (Object.keys(POINTS) as Name[]).map((name) => ({
            name,
            ...POINTS[name],
            isShown: true,
            hasDropLines: POINTS[name].x !== 0 && POINTS[name].y !== 0,
            tone: Tone.Main,
          })),
        },
      }),
    );
    const question = choice({
      prompt: ask.prompt,
      options: [
        { id: "right", label: same(ask.answer) },
        ...ask.wrong.map((w, i) => ({
          id: `slip${i}`,
          label: same(w.label),
          feedback: w.feedback,
        })),
      ],
      answer: "right",
    });
    return scene({ pieces: { figure, ask: question } });
  },
});
