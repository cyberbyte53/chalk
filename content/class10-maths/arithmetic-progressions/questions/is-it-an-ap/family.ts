import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const r = String.raw;

const yes = (d: string) => t(`Yes, d = ${d}`, `हाँ, d = ${d}`);
const no = t("No, it is not an AP", "नहीं, यह AP नहीं है");
const notSame = (first: string, second: string) =>
  t(
    `The differences are not all the same: first ${first}, then ${second}.`,
    `अंतर सब एक जैसे नहीं हैं: पहले ${first}, फिर ${second}।`,
  );
const isSame = (d: string) =>
  t(
    `Every term is the one before plus ${d}: the differences are all the same.`,
    `हर पद पिछले पद में ${d} जोड़कर बनता है: सारे अंतर एक जैसे हैं।`,
  );
const ask = (list: string) =>
  t(`Is ${list} an arithmetic progression?`, `क्या ${list} एक समांतर श्रेढ़ी है?`);

/** Exercise 5.1 Q1 and Q4, and Example 2: decide whether a list is an AP, and its d. */
const items = {
  ex2i: {
    prompt: ask("4, 10, 16, 22, …"),
    right: yes("6"),
    wrong: [
      { label: no, why: isSame("6") },
      {
        label: yes("4"),
        why: t(
          "4 is the first term. d is the next term minus this one: 10 − 4 = 6.",
          "4 पहला पद है। d अगला पद घटा यह पद है: 10 − 4 = 6।",
        ),
      },
    ],
  },
  ex2ii: {
    prompt: ask("1, −1, −3, −5, …"),
    right: yes("−2"),
    wrong: [
      { label: yes("2"), why: t("The terms go down: −1 − 1 = −2.", "पद घटते हैं: −1 − 1 = −2।") },
      { label: no, why: isSame("−2") },
    ],
  },
  ex2iii: {
    prompt: ask("−2, 2, −2, 2, −2, …"),
    right: no,
    wrong: [
      { label: yes("4"), why: notSame("4", "−4") },
      { label: yes("0"), why: notSame("4", "−4") },
    ],
  },
  ex2iv: {
    prompt: ask("1, 1, 1, 2, 2, 2, 3, 3, 3, …"),
    right: no,
    wrong: [
      { label: yes("0"), why: notSame("0", "1") },
      { label: yes("1"), why: notSame("0", "1") },
    ],
  },
  q4i: {
    prompt: ask("2, 4, 8, 16, …"),
    right: no,
    wrong: [
      { label: yes("2"), why: notSame("2", "4") },
      {
        label: yes("4"),
        why: t(
          "Each term is doubled, so the jumps grow: 2, 4, 8.",
          "हर पद दुगुना होता है, तो उछाल बढ़ते जाते हैं: 2, 4, 8।",
        ),
      },
    ],
  },
  q4ii: {
    prompt: ask(r`$2, \tfrac{5}{2}, 3, \tfrac{7}{2}, \dots$`),
    right: yes(r`$\tfrac{1}{2}$`),
    wrong: [
      { label: no, why: isSame("1/2") },
      {
        label: yes("2"),
        why: t(
          "2 is the first term. The difference is 5/2 − 2 = 1/2.",
          "2 पहला पद है। अंतर 5/2 − 2 = 1/2 है।",
        ),
      },
    ],
  },
  q4iii: {
    prompt: ask("−1.2, −3.2, −5.2, −7.2, …"),
    right: yes("−2"),
    wrong: [
      {
        label: yes("2"),
        why: t("The terms go down: −3.2 − (−1.2) = −2.", "पद घटते हैं: −3.2 − (−1.2) = −2।"),
      },
      { label: no, why: isSame("−2") },
    ],
  },
  q4iv: {
    prompt: ask("−10, −6, −2, 2, …"),
    right: yes("4"),
    wrong: [
      {
        label: yes("−4"),
        why: t("Next minus this: −6 − (−10) = 4.", "अगला घटा यह: −6 − (−10) = 4।"),
      },
      { label: no, why: isSame("4") },
    ],
  },
  q4v: {
    prompt: ask(r`$3, 3 + \sqrt{2}, 3 + 2\sqrt{2}, 3 + 3\sqrt{2}, \dots$`),
    right: yes(r`$\sqrt{2}$`),
    wrong: [
      { label: no, why: isSame("√2") },
      {
        label: yes("3"),
        why: t("3 is the first term; each term adds √2.", "3 पहला पद है; हर पद √2 जोड़ता है।"),
      },
    ],
  },
  q4vi: {
    prompt: ask("0.2, 0.22, 0.222, 0.2222, …"),
    right: no,
    wrong: [
      { label: yes("0.02"), why: notSame("0.02", "0.002") },
      { label: yes("0.2"), why: notSame("0.02", "0.002") },
    ],
  },
  q4vii: {
    prompt: ask("0, −4, −8, −12, …"),
    right: yes("−4"),
    wrong: [
      { label: yes("4"), why: t("The terms go down: −4 − 0 = −4.", "पद घटते हैं: −4 − 0 = −4।") },
      { label: no, why: isSame("−4") },
    ],
  },
  q4viii: {
    prompt: ask(r`$-\tfrac{1}{2}, -\tfrac{1}{2}, -\tfrac{1}{2}, -\tfrac{1}{2}, \dots$`),
    right: yes("0"),
    wrong: [
      {
        label: no,
        why: t(
          "Adding 0 each time is still adding a fixed number: d can be zero.",
          "हर बार 0 जोड़ना भी एक तय संख्या जोड़ना है: d शून्य हो सकता है।",
        ),
      },
      {
        label: yes(r`$-\tfrac{1}{2}$`),
        why: t("That's the first term. Every difference is 0.", "यह पहला पद है। हर अंतर 0 है।"),
      },
    ],
  },
  q4ix: {
    prompt: ask("1, 3, 9, 27, …"),
    right: no,
    wrong: [
      { label: yes("2"), why: notSame("2", "6") },
      {
        label: yes("3"),
        why: t(
          "Each term is multiplied by 3, so the jumps grow: 2, 6, 18.",
          "हर पद 3 से गुणा होता है, तो उछाल बढ़ते हैं: 2, 6, 18।",
        ),
      },
    ],
  },
  q4x: {
    prompt: ask("a, 2a, 3a, 4a, …"),
    right: yes("a"),
    wrong: [
      { label: no, why: isSame("a") },
      { label: yes("2a"), why: t("2a − a = a.", "2a − a = a।") },
    ],
  },
  q4xii: {
    prompt: ask(r`$\sqrt{2}, \sqrt{8}, \sqrt{18}, \sqrt{32}, \dots$`),
    right: yes(r`$\sqrt{2}$`),
    wrong: [
      {
        label: no,
        why: t(
          "Simplify: √8 = 2√2, √18 = 3√2, √32 = 4√2. The list is √2, 2√2, 3√2, 4√2.",
          "सरल करो: √8 = 2√2, √18 = 3√2, √32 = 4√2। सूची है √2, 2√2, 3√2, 4√2।",
        ),
      },
      {
        label: yes(r`$\sqrt{6}$`),
        why: t(
          "√8 − √2 is not √6: √8 = 2√2, so the difference is √2.",
          "√8 − √2, √6 नहीं है: √8 = 2√2, तो अंतर √2 है।",
        ),
      },
    ],
  },
  q4xiii: {
    prompt: ask(r`$\sqrt{3}, \sqrt{6}, \sqrt{9}, \sqrt{12}, \dots$`),
    right: no,
    wrong: [
      {
        label: yes(r`$\sqrt{3}$`),
        why: t(
          "√6 − √3 is about 0.72 but √9 − √6 is about 0.55: not the same.",
          "√6 − √3 लगभग 0.72 है पर √9 − √6 लगभग 0.55: एक जैसे नहीं।",
        ),
      },
      {
        label: yes("3"),
        why: t(
          "Work out the differences: they shrink, so it's not an AP.",
          "अंतर निकालो: वे घटते हैं, तो यह AP नहीं है।",
        ),
      },
    ],
  },
  q4xiv: {
    prompt: ask(r`$1^2, 3^2, 5^2, 7^2, \dots$`),
    right: no,
    wrong: [
      { label: yes("8"), why: notSame("8", "16") },
      {
        label: yes("2"),
        why: t(
          "The numbers being squared go up by 2, but the squares 1, 9, 25, 49 don't: 8, 16, 24.",
          "जिन संख्याओं का वर्ग है वे 2 से बढ़ती हैं, पर वर्ग 1, 9, 25, 49 नहीं: 8, 16, 24।",
        ),
      },
    ],
  },
  q4xv: {
    prompt: ask(r`$1^2, 5^2, 7^2, 73, \dots$`),
    right: yes("24"),
    wrong: [
      {
        label: no,
        why: t(
          "1, 25, 49, 73: each is 24 more than the one before.",
          "1, 25, 49, 73: हर एक पिछले से 24 ज़्यादा है।",
        ),
      },
      {
        label: yes("4"),
        why: t(
          "Square first: 1, 25, 49, 73. The difference is 24.",
          "पहले वर्ग करो: 1, 25, 49, 73। अंतर 24 है।",
        ),
      },
    ],
  },
  q1taxi: {
    prompt: t(
      "A taxi charges ₹15 for the first km and ₹8 for each km after. Do the fares after 1, 2, 3, … km form an AP?",
      "एक टैक्सी पहले km के ₹15 और उसके बाद हर km के ₹8 लेती है। क्या 1, 2, 3, … km के बाद के किराए AP बनाते हैं?",
    ),
    right: yes("8"),
    wrong: [
      {
        label: no,
        why: t(
          "15, 23, 31, …: each is 8 more than the one before.",
          "15, 23, 31, …: हर एक पिछले से 8 ज़्यादा है।",
        ),
      },
      {
        label: yes("15"),
        why: t("15 is the first fare, the first term.", "15 पहला किराया है, पहला पद।"),
      },
    ],
  },
  q1pump: {
    prompt: t(
      "A pump removes 1/4 of the air left in a cylinder each time. Do the amounts of air left form an AP?",
      "एक पंप हर बार सिलिंडर में बची हवा का 1/4 निकाल देता है। क्या बची हवा की मात्राएँ AP बनाती हैं?",
    ),
    right: no,
    wrong: [
      {
        label: yes("−1/4"),
        why: t(
          "Each amount is 3/4 of the one before: multiplying, not adding. With 1 unit: 1, 3/4, 9/16: drops of 1/4 then 3/16.",
          "हर मात्रा पिछली की 3/4 है: गुणा, जोड़ नहीं। 1 इकाई से: 1, 3/4, 9/16: कमी पहले 1/4 फिर 3/16।",
        ),
      },
      {
        label: yes("3/4"),
        why: t(
          "3/4 is what each amount is multiplied by, not added.",
          "3/4 वह है जिससे हर मात्रा गुणा होती है, जोड़ी नहीं जाती।",
        ),
      },
    ],
  },
  q1well: {
    prompt: t(
      "Digging a well costs ₹150 for the first metre and ₹50 more for each metre after. Do the costs after each metre form an AP?",
      "एक कुआँ खोदने में पहले मीटर के ₹150 और उसके बाद हर मीटर के ₹50 ज़्यादा लगते हैं। क्या हर मीटर के बाद की लागतें AP बनाती हैं?",
    ),
    right: yes("50"),
    wrong: [
      {
        label: no,
        why: t(
          "150, 200, 250, …: each is 50 more than the one before.",
          "150, 200, 250, …: हर एक पिछले से 50 ज़्यादा है।",
        ),
      },
      { label: yes("150"), why: t("150 is the first term.", "150 पहला पद है।") },
    ],
  },
  q1compound: {
    prompt: t(
      "₹10000 is deposited at 8% compound interest a year. Do the amounts in the account each year form an AP?",
      "₹10000, 8% वार्षिक चक्रवृद्धि ब्याज पर जमा किए गए। क्या हर साल खाते की रक़म AP बनाती है?",
    ),
    right: no,
    wrong: [
      {
        label: yes("800"),
        why: t(
          "Only the first year adds 800. Compound interest is on the bigger amount each year: 10800, then 11664 (864 more).",
          "सिर्फ़ पहला साल 800 जोड़ता है। चक्रवृद्धि ब्याज हर साल बढ़ी रक़म पर लगता है: 10800, फिर 11664 (864 ज़्यादा)।",
        ),
      },
      {
        label: yes("8"),
        why: t(
          "8% is the rate, and it multiplies the amount each year.",
          "8% दर है, और यह हर साल रक़म को गुणा करती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Decide whether a list is an arithmetic progression, and if so its common difference. */
export const isItAnAp = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.PatternsAndAps],
});
