import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const ask = (list: string) =>
  t(
    `For the AP ${list}, what are the first term a and the common difference d?`,
    `AP ${list} के लिए प्रथम पद a और सार्व अंतर d क्या हैं?`,
  );
const flipped = t(
  "That's this term minus the next. d is always the next term minus this one.",
  "यह इस पद में से अगला घटाना है। d हमेशा अगला पद घटा यह पद होता है।",
);
const notFirst = t("a is the first term of the list.", "a सूची का पहला पद है।");

/** Exercise 5.1 Q3 and Example 1: read off a and d. */
const items = {
  ex1: numItem(
    ask(r`$\tfrac{3}{2}, \tfrac{1}{2}, -\tfrac{1}{2}, -\tfrac{3}{2}, \dots$`),
    r`$a = \tfrac{3}{2}$, $d = -1$`,
    [
      [r`$a = \tfrac{3}{2}$, $d = 1$`, flipped],
      [r`$a = \tfrac{1}{2}$, $d = -1$`, notFirst],
    ],
  ),
  q3i: numItem(ask("3, 1, −1, −3, …"), "a = 3, d = −2", [
    ["a = 3, d = 2", flipped],
    ["a = 1, d = −2", notFirst],
  ]),
  q3ii: numItem(ask("−5, −1, 3, 7, …"), "a = −5, d = 4", [
    ["a = −5, d = −4", flipped],
    ["a = −1, d = 4", notFirst],
  ]),
  q3iii: numItem(
    ask(r`$\tfrac{1}{3}, \tfrac{5}{3}, \tfrac{9}{3}, \tfrac{13}{3}, \dots$`),
    r`$a = \tfrac{1}{3}$, $d = \tfrac{4}{3}$`,
    [
      [r`$a = \tfrac{1}{3}$, $d = -\tfrac{4}{3}$`, flipped],
      [
        r`$a = \tfrac{1}{3}$, $d = 4$`,
        t("Subtract the fractions: 5/3 − 1/3 = 4/3.", "भिन्नें घटाओ: 5/3 − 1/3 = 4/3।"),
      ],
    ],
  ),
  q3iv: numItem(ask("0.6, 1.7, 2.8, 3.9, …"), "a = 0.6, d = 1.1", [
    ["a = 0.6, d = −1.1", flipped],
    ["a = 1.7, d = 1.1", notFirst],
  ]),
  ap6m3: numItem(ask("6, 3, 0, −3, …"), "a = 6, d = −3", [
    ["a = 6, d = 3", flipped],
    ["a = 0, d = −3", notFirst],
  ]),
} satisfies Record<string, Item>;

/** Read the first term and the common difference of an AP. */
export const firstTermAndD = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.PatternsAndAps],
});
