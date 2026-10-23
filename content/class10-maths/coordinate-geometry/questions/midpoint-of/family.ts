import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const half = t(
  "The mid-point averages the coordinates: add the two x's and halve, then the two y's.",
  "मध्य-बिंदु निर्देशांकों का औसत है: दोनों x जोड़कर आधा करो, फिर दोनों y।",
);
const diff = t(
  "You halved the differences. Add the coordinates, then halve.",
  "तुमने अंतर का आधा लिया। निर्देशांक जोड़ो, फिर आधा करो।",
);

const items = {
  basic: numItem(
    t("Find the mid-point of (−2, 4) and (6, −8).", "(−2, 4) और (6, −8) का मध्य-बिंदु ज्ञात करो।"),
    "(2, −2)",
    [
      ["(4, −6)", diff],
      ["(4, −4)", half],
    ],
  ),
  flags: numItem(
    t("Find the mid-point of (2, 25) and (8, 20).", "(2, 25) और (8, 20) का मध्य-बिंदु ज्ञात करो।"),
    "(5, 22.5)",
    [
      ["(3, −2.5)", diff],
      ["(10, 45)", half],
    ],
  ),
  ratio: {
    prompt: t(
      "P is the mid-point of AB. In what ratio does P divide AB?",
      "P, AB का मध्य-बिंदु है। P, AB को किस अनुपात में बाँटता है?",
    ),
    right: t("1 : 1", "1 : 1"),
    wrong: [
      {
        label: t("1 : 2", "1 : 2"),
        why: t(
          "1 : 2 puts P a third of the way. The middle has equal parts each side.",
          "1 : 2 से P एक-तिहाई पर आता है। बीच में दोनों ओर बराबर भाग होते हैं।",
        ),
      },
      {
        label: t("2 : 1", "2 : 1"),
        why: t(
          "2 : 1 puts P two-thirds of the way. The middle is 1 : 1.",
          "2 : 1 से P दो-तिहाई पर आता है। बीच 1 : 1 है।",
        ),
      },
    ],
  },
  origin: numItem(
    t(
      "The mid-point of A and B(6, −2) is the origin. Find A.",
      "A और B(6, −2) का मध्य-बिंदु मूलबिंदु है। A ज्ञात करो।",
    ),
    "(−6, 2)",
    [
      [
        "(3, −1)",
        t(
          "(3, −1) is the mid-point of O and B. We need (x + 6)/2 = 0 and (y − 2)/2 = 0.",
          "(3, −1), O और B का मध्य-बिंदु है। हमें (x + 6)/2 = 0 और (y − 2)/2 = 0 चाहिए।",
        ),
      ],
      [
        "(6, −2)",
        t("That's B itself. A is on the other side of O.", "यह ख़ुद B है। A, O के दूसरी ओर है।"),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** The mid-point formula (NCERT 7.3, special case). */
export const midpointOf = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.SectionFormula],
});
