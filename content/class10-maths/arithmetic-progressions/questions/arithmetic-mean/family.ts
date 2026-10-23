import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const mean = (a: string, c: string) =>
  t(`What is the arithmetic mean of ${a} and ${c}?`, `${a} और ${c} का समांतर माध्य क्या है?`);
const gap = t(
  "That's the gap between them. The mean is halfway: (a + c) ÷ 2.",
  "यह उनके बीच का अंतर है। माध्य आधे रास्ते पर है: (a + c) ÷ 2।",
);
const total = t("That's the total; halve it.", "यह योग है; आधा करो।");
const middle = t(
  "In an AP the middle term is the mean of its neighbours: 2b = a + c.",
  "AP में बीच का पद अपने पड़ोसियों का माध्य होता है: 2b = a + c।",
);

/** The note to the reader: if a, b, c are in AP, b = (a + c)/2. */
const items = {
  m6and14: numItem(mean("6", "14"), "10", [
    ["8", gap],
    ["20", total],
  ]),
  m13and27: numItem(mean("13", "27"), "20", [
    ["14", gap],
    ["40", total],
  ]),
  mneg: numItem(mean("−4", "10"), "3", [
    ["7", t("(−4 + 10) ÷ 2 = 3: add with the sign.", "(−4 + 10) ÷ 2 = 3: चिह्न के साथ जोड़ो।")],
    ["14", gap],
  ]),
  mdec: numItem(mean("2.5", "7.5"), "5", [
    ["10", total],
    ["2.5", t("(2.5 + 7.5) ÷ 2 = 5.", "(2.5 + 7.5) ÷ 2 = 5।")],
  ]),
  findx: numItem(
    t("2x, x + 10 and 3x + 2 are in AP. Find x.", "2x, x + 10 और 3x + 2 AP में हैं। x ज्ञात करो।"),
    "6",
    [
      ["8", middle],
      ["4", t("2(x + 10) = 2x + 3x + 2 gives 18 = 3x.", "2(x + 10) = 2x + 3x + 2 से 18 = 3x।")],
    ],
  ),
  findk: numItem(
    t("k − 1, k + 3 and 3k − 1 are in AP. Find k.", "k − 1, k + 3 और 3k − 1 AP में हैं। k ज्ञात करो।"),
    "4",
    [
      ["2", middle],
      [
        "3",
        t("2(k + 3) = (k − 1) + (3k − 1) gives 8 = 2k.", "2(k + 3) = (k − 1) + (3k − 1) से 8 = 2k।"),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** The arithmetic mean, and the middle of three terms in AP. */
export const arithmeticMean = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ChallengeAndFinale],
});
