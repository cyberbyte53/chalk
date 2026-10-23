import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const ask = (a: string, d: string) =>
  t(
    `Write the first four terms of the AP with a = ${a} and d = ${d}.`,
    `a = ${a} और d = ${d} वाली AP के पहले चार पद लिखो।`,
  );
const skipsA = t(
  "The first term is a itself; d is added from the second term on.",
  "पहला पद ख़ुद a है; d दूसरे पद से जुड़ना शुरू होता है।",
);
const wrongWay = t("Adding a negative d makes the terms go down.", "ऋणात्मक d जोड़ने से पद घटते हैं।");

/** Exercise 5.1 Q2 and the section's examples: build an AP from a and d. */
const items = {
  q2i: numItem(ask("10", "10"), "10, 20, 30, 40", [
    ["20, 30, 40, 50", skipsA],
    [
      "10, 100, 1000, 10000",
      t("That multiplies by 10. An AP adds d.", "यह 10 से गुणा करता है। AP में d जोड़ा जाता है।"),
    ],
  ]),
  q2ii: numItem(ask("−2", "0"), "−2, −2, −2, −2", [
    [
      "−2, 0, 2, 4",
      t(
        "d = 0 means nothing is added: every term stays −2.",
        "d = 0 का मतलब है कुछ नहीं जुड़ता: हर पद −2 रहता है।",
      ),
    ],
    ["0, 0, 0, 0", skipsA],
  ]),
  q2iii: numItem(ask("4", "−3"), "4, 1, −2, −5", [
    ["4, 7, 10, 13", wrongWay],
    ["1, −2, −5, −8", skipsA],
  ]),
  q2iv: numItem(ask("−1", r`$\tfrac{1}{2}$`), r`$-1, -\tfrac{1}{2}, 0, \tfrac{1}{2}$`, [
    [
      r`$-1, -\tfrac{3}{2}, -2, -\tfrac{5}{2}$`,
      t("d = 1/2 is positive, so the terms go up.", "d = 1/2 धनात्मक है, तो पद बढ़ते हैं।"),
    ],
    [r`$-\tfrac{1}{2}, 0, \tfrac{1}{2}, 1$`, skipsA],
  ]),
  q2v: numItem(ask("−1.25", "−0.25"), "−1.25, −1.50, −1.75, −2.00", [
    ["−1.25, −1.00, −0.75, −0.50", wrongWay],
    ["−1.50, −1.75, −2.00, −2.25", skipsA],
  ]),
  ex0half: numItem(ask("0", r`$1\tfrac{1}{2}$`), r`$0, 1\tfrac{1}{2}, 3, 4\tfrac{1}{2}$`, [
    [r`$1\tfrac{1}{2}, 3, 4\tfrac{1}{2}, 6$`, skipsA],
    ["0, 1, 2, 3", t("Add 1½ each time, not 1.", "हर बार 1½ जोड़ो, 1 नहीं।")],
  ]),
} satisfies Record<string, Item>;

/** Write out the first terms of an AP from its first term and common difference. */
export const writeFourTerms = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.PatternsAndAps],
});
