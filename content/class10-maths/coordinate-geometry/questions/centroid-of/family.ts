import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const third = t(
  "The centroid averages the three vertices: add the x's and divide by 3, then the y's.",
  "केन्द्रक तीनों शीर्षों का औसत है: x जोड़कर 3 से भाग दो, फिर y।",
);
const twoOne = t(
  "The centroid divides each median 2 : 1 from the vertex: two-thirds of the way from the vertex to the mid-point.",
  "केन्द्रक हर माध्यिका को शीर्ष से 2 : 1 में बाँटता है: शीर्ष से मध्य-बिंदु तक दो-तिहाई पर।",
);

const items = {
  q7d: numItem(
    t(
      "Exercise 7.4 Q7 (i): A(4, 2), B(6, 5), C(1, 4). The median from A meets BC at D. Find D.",
      "प्रश्नावली 7.4 प्र7 (i): A(4, 2), B(6, 5), C(1, 4)। A से माध्यिका BC को D पर मिलती है। D ज्ञात करो।",
    ),
    "(7/2, 9/2)",
    [
      [
        "(11/3, 11/3)",
        t(
          "That's the centroid. D is just the mid-point of BC.",
          "यह केन्द्रक है। D बस BC का मध्य-बिंदु है।",
        ),
      ],
      [
        "(5, 7/2)",
        t(
          "That's the mid-point of AB. The median from A goes to the side opposite A, which is BC.",
          "यह AB का मध्य-बिंदु है। A से माध्यिका A के सामने की भुजा BC पर जाती है।",
        ),
      ],
    ],
  ),
  q7p: numItem(
    t(
      "Exercise 7.4 Q7 (ii): P on AD with AP : PD = 2 : 1, where A(4, 2) and D(7/2, 9/2). Find P.",
      "प्रश्नावली 7.4 प्र7 (ii): AD पर P जिसमें AP : PD = 2 : 1, जहाँ A(4, 2) और D(7/2, 9/2)। P ज्ञात करो।",
    ),
    "(11/3, 11/3)",
    [
      [
        "(23/6, 17/6)",
        t(
          "That's 1 : 2, nearer A. Use 2 : 1: x = (2 × 7/2 + 4)/3.",
          "यह 1 : 2 है, A के पास। 2 : 1 लो: x = (2 × 7/2 + 4)/3।",
        ),
      ],
      [
        "(15/4, 13/4)",
        t("That's the mid-point of AD. Use 2 : 1.", "यह AD का मध्य-बिंदु है। 2 : 1 लो।"),
      ],
    ],
  ),
  formula: numItem(
    t(
      "Find the centroid of the triangle with vertices (1, 2), (4, 6) and (7, 1).",
      "शीर्ष (1, 2), (4, 6) और (7, 1) वाले त्रिभुज का केन्द्रक ज्ञात करो।",
    ),
    "(4, 3)",
    [
      ["(12, 9)", third],
      ["(6, 4.5)", t("Divide by 3 (three vertices), not by 2.", "2 से नहीं, 3 से भाग दो (तीन शीर्ष)।")],
    ],
  ),
  ratio: {
    prompt: t(
      "In what ratio does the centroid divide each median, from the vertex?",
      "केन्द्रक हर माध्यिका को, शीर्ष से, किस अनुपात में बाँटता है?",
    ),
    right: t("2 : 1", "2 : 1"),
    wrong: [
      { label: t("1 : 2", "1 : 2"), why: twoOne },
      { label: t("1 : 1", "1 : 1"), why: twoOne },
    ],
  },
} satisfies Record<string, Item>;

/** Medians and the centroid (Ex 7.4 Q7). */
export const centroidOf = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.ChallengeAndFinale],
});
