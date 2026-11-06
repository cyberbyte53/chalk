import { family, place, scene, t, tap } from "@chalk/author";
import { Level } from "@chalk/content";
import { check, plane } from "@chalk/patterns";
import { Marks, PlanePart, coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** What each part is called in a prompt: its name only, as shown and as said. */
const PARTS = {
  [PlanePart.O]: [t("**O**", "**O**"), t("O", "O")],
  [PlanePart.OX]: [t("**OX**", "**OX**"), t("O X", "O X")],
  [PlanePart.OXDash]: [t("**OX′**", "**OX′**"), t("O X dash", "O X डैश")],
  [PlanePart.OY]: [t("**OY**", "**OY**"), t("O Y", "O Y")],
  [PlanePart.OYDash]: [t("**OY′**", "**OY′**"), t("O Y dash", "O Y डैश")],
  // In Devanagari a Roman I reads as a danda (।): the ordinal comes first.
  [PlanePart.I]: [t("**quadrant I**", "**पहले चतुर्थांश (I)**"), t("quadrant one", "पहले चतुर्थांश")],
  [PlanePart.II]: [t("**quadrant II**", "**दूसरे चतुर्थांश (II)**"), t("quadrant two", "दूसरे चतुर्थांश")],
  [PlanePart.III]: [
    t("**quadrant III**", "**तीसरे चतुर्थांश (III)**"),
    t("quadrant three", "तीसरे चतुर्थांश"),
  ],
  [PlanePart.IV]: [t("**quadrant IV**", "**चौथे चतुर्थांश (IV)**"), t("quadrant four", "चौथे चतुर्थांश")],
} as const;

/** What each part is called as an answer: the part a learner tapped. */
const NAMES = {
  [PlanePart.O]: t("O", "O"),
  [PlanePart.OX]: t("OX", "OX"),
  [PlanePart.OXDash]: t("OX′", "OX′"),
  [PlanePart.OY]: t("OY", "OY"),
  [PlanePart.OYDash]: t("OY′", "OY′"),
  [PlanePart.I]: t("quadrant I", "पहला चतुर्थांश (I)"),
  [PlanePart.II]: t("quadrant II", "दूसरा चतुर्थांश (II)"),
  [PlanePart.III]: t("quadrant III", "तीसरा चतुर्थांश (III)"),
  [PlanePart.IV]: t("quadrant IV", "चौथा चतुर्थांश (IV)"),
} as const;

/** The wrong tap a student makes for a part, and why, where there is one to name. */
const MISTAKES: Partial<Record<PlanePart, { part: PlanePart; say: ReturnType<typeof t> }>> = {
  [PlanePart.OXDash]: {
    part: PlanePart.OX,
    say: t(
      "That is OX: the positive numbers lie along it. OX′ is the other half, where −1, −2, −3, … are.",
      "वह OX है: धनात्मक संख्याएँ उस पर हैं। OX′ दूसरा आधा भाग है, जहाँ −1, −2, −3, … हैं।",
    ),
  },
  [PlanePart.OX]: {
    part: PlanePart.OXDash,
    say: t(
      "That is OX′: the negative numbers lie along it. OX is the other half, where 1, 2, 3, … are.",
      "वह OX′ है: ऋणात्मक संख्याएँ उस पर हैं। OX दूसरा आधा भाग है, जहाँ 1, 2, 3, … हैं।",
    ),
  },
  [PlanePart.OYDash]: {
    part: PlanePart.OY,
    say: t(
      "That is OY: the positive numbers lie along it. OY′ is the other half, where −1, −2, −3, … are.",
      "वह OY है: धनात्मक संख्याएँ उस पर हैं। OY′ दूसरा आधा भाग है, जहाँ −1, −2, −3, … हैं।",
    ),
  },
  [PlanePart.OY]: {
    part: PlanePart.OYDash,
    say: t(
      "That is OY′: the negative numbers lie along it. OY is the other half, where 1, 2, 3, … are.",
      "वह OY′ है: ऋणात्मक संख्याएँ उस पर हैं। OY दूसरा आधा भाग है, जहाँ 1, 2, 3, … हैं।",
    ),
  },
  [PlanePart.II]: {
    part: PlanePart.IV,
    say: t(
      "That is quadrant IV: you counted clockwise. The quadrants are numbered anticlockwise from OX: I, then II above OX′.",
      "वह चौथा चतुर्थांश (IV) है: तुमने घड़ी की दिशा में गिना। चतुर्थांश OX से वामावर्त गिने जाते हैं: पहला (I), फिर OX′ के ऊपर दूसरा (II)।",
    ),
  },
  [PlanePart.IV]: {
    part: PlanePart.II,
    say: t(
      "That is quadrant II: you counted clockwise. The quadrants are numbered anticlockwise from OX: I, II, III, then IV below OX.",
      "वह दूसरा चतुर्थांश (II) है: तुमने घड़ी की दिशा में गिना। चतुर्थांश OX से वामावर्त गिने जाते हैं: पहला, दूसरा, तीसरा, फिर OX के नीचे चौथा (IV)।",
    ),
  },
};

/** Ex 3.2 Q1 in the prop: the axes' halves and the quadrants, each found by its name alone. */
export const tapThePart = family({
  level: Level.Easy,
  tests: [Concept.TheCartesianPlane],
  params: z
    .object({ part: z.nativeEnum(PlanePart) })
    .strict()
    // O is printed on the picture: asking for it would ask the student to read a label.
    .refine((p) => p.part !== PlanePart.O, "the origin is labelled O on the picture"),
  build: ({ part }) => {
    const { isNamed, namedPart, setup } = plane;
    const sheet = place(
      coordinatePlane,
      setup({
        plane: {
          window: { xMin: -5.5, xMax: 5.5, yMin: -5.5, yMax: 5.5 },
          marks: Marks.Numbers,
          numbered: ["x", "y"],
          axisNames: [t("x", "x"), t("y", "y")],
          showAxisNames: false,
          showDirections: true,
          // A tap marks a part without naming it: Check says whether it is the one asked for.
          namesTapped: false,
          canTapQuadrants: true,
        },
      }),
    );
    const [shown, said] = PARTS[part];
    const mistake = MISTAKES[part];
    const ask = check({
      about: "sheet",
      prompt: t(`Tap ${shown.en}, then press Check.`, `${shown.hi} को दबाओ, फिर जाँचो दबाओ।`),
      says: t(`Tap ${said.en}, then press Check.`, `${said.hi} को दबाओ, फिर जाँचो दबाओ।`),
      isRight: isNamed("sheet", part),
      answer: (read) => {
        const named = namedPart("sheet")(read);
        return named === null ? null : NAMES[named];
      },
      solve: [tap("sheet.plane", "namePart", { part })],
      notes:
        mistake === undefined
          ? []
          : [
              {
                when: isNamed("sheet", mistake.part),
                say: mistake.say,
                reach: [tap("sheet.plane", "namePart", { part: mistake.part })],
              },
            ],
    });
    return scene({ pieces: { sheet, ask: ask.piece }, uses: [ask.use] });
  },
});
