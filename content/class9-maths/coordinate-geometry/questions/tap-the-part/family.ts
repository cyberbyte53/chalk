import { family, place, scene, t, tap } from "@chalk/author";
import { Level } from "@chalk/content";
import { check, plane } from "@chalk/patterns";
import { Marks, PlanePart, coordinatePlane } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** What each part is called in a prompt, and what it is: as shown, and as said. */
const PARTS = {
  [PlanePart.O]: [t("**the origin, O**", "**मूल बिंदु O**"), t("the origin, O", "मूल बिंदु O")],
  [PlanePart.OX]: [
    t("**OX**, the positive direction of the x-axis", "**OX**, x-अक्ष की धनात्मक दिशा"),
    t("O X, the positive direction of the x-axis", "O X, एक्स-अक्ष की धनात्मक दिशा"),
  ],
  [PlanePart.OXDash]: [
    t("**OX′**, the negative direction of the x-axis", "**OX′**, x-अक्ष की ऋणात्मक दिशा"),
    t("O X dash, the negative direction of the x-axis", "O X डैश, एक्स-अक्ष की ऋणात्मक दिशा"),
  ],
  [PlanePart.OY]: [
    t("**OY**, the positive direction of the y-axis", "**OY**, y-अक्ष की धनात्मक दिशा"),
    t("O Y, the positive direction of the y-axis", "O Y, वाई-अक्ष की धनात्मक दिशा"),
  ],
  [PlanePart.OYDash]: [
    t("**OY′**, the negative direction of the y-axis", "**OY′**, y-अक्ष की ऋणात्मक दिशा"),
    t("O Y dash, the negative direction of the y-axis", "O Y डैश, वाई-अक्ष की ऋणात्मक दिशा"),
  ],
  [PlanePart.I]: [t("**quadrant I**", "**चतुर्थांश I**"), t("quadrant one", "पहले चतुर्थांश")],
  [PlanePart.II]: [t("**quadrant II**", "**चतुर्थांश II**"), t("quadrant two", "दूसरे चतुर्थांश")],
  [PlanePart.III]: [t("**quadrant III**", "**चतुर्थांश III**"), t("quadrant three", "तीसरे चतुर्थांश")],
  [PlanePart.IV]: [t("**quadrant IV**", "**चतुर्थांश IV**"), t("quadrant four", "चौथे चतुर्थांश")],
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
      "वह चतुर्थांश IV है: तुमने घड़ी की दिशा में गिना। चतुर्थांश OX से वामावर्त गिने जाते हैं: I, फिर OX′ के ऊपर II।",
    ),
  },
  [PlanePart.IV]: {
    part: PlanePart.II,
    say: t(
      "That is quadrant II: you counted clockwise. The quadrants are numbered anticlockwise from OX: I, II, III, then IV below OX.",
      "वह चतुर्थांश II है: तुमने घड़ी की दिशा में गिना। चतुर्थांश OX से वामावर्त गिने जाते हैं: I, II, III, फिर OX के नीचे IV।",
    ),
  },
};

/** Ex 3.2 Q1 in the prop: the axes' halves, the quadrants and the origin, each found by a tap. */
export const tapThePart = family({
  level: Level.Easy,
  tests: [Concept.TheCartesianPlane],
  params: z.object({ part: z.nativeEnum(PlanePart) }).strict(),
  build: ({ part }) => {
    const { isNamed, setup } = plane;
    const sheet = place(
      coordinatePlane,
      setup({
        plane: {
          window: { xMin: -5.5, xMax: 5.5, yMin: -4.5, yMax: 4.5 },
          marks: Marks.Numbers,
          numbered: ["x", "y"],
          axisNames: [t("x", "x"), t("y", "y")],
          showDirections: true,
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
