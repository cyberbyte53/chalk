import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const both = t(
  "A square equal to 36 has two roots, +6 and −6, so there are two answers.",
  "36 के बराबर वर्ग के दो मूल हैं, +6 और −6, तो दो उत्तर हैं।",
);

const items = {
  q8: {
    prompt: t(
      "Exercise 7.1 Q8: P(2, −3) and Q(10, y) are 10 units apart. Find y.",
      "प्रश्नावली 7.1 प्र8: P(2, −3) और Q(10, y) में 10 इकाई की दूरी है। y ज्ञात करो।",
    ),
    right: t("3 or −9", "3 या −9"),
    wrong: [
      { label: t("3 only", "केवल 3"), why: both },
      {
        label: t("9 or −3", "9 या −3"),
        why: t("From y + 3 = ±6, subtract 3: 3 or −9.", "y + 3 = ±6 से 3 घटाओ: 3 या −9।"),
      },
    ],
  },
  px: {
    prompt: t(
      "P(x, 2) and Q(3, −6) are 10 units apart. Find x.",
      "P(x, 2) और Q(3, −6) में 10 इकाई की दूरी है। x ज्ञात करो।",
    ),
    right: t("9 or −3", "9 या −3"),
    wrong: [
      { label: t("9 only", "केवल 9"), why: both },
      {
        label: t("3 or −9", "3 या −9"),
        why: t(
          "(3 − x)² = 36, so 3 − x = ±6: x = −3 or 9.",
          "(3 − x)² = 36, तो 3 − x = ±6: x = −3 या 9।",
        ),
      },
    ],
  },
  origin: {
    prompt: t(
      "The point (a, 4) is 5 units from the origin. Find a.",
      "बिंदु (a, 4) मूलबिंदु से 5 इकाई दूर है। a ज्ञात करो।",
    ),
    right: t("3 or −3", "3 या −3"),
    wrong: [
      {
        label: t("1 or −1", "1 या −1"),
        why: t(
          "Subtract the squares, not the numbers: a² = 25 − 16 = 9.",
          "संख्याएँ नहीं, वर्ग घटाओ: a² = 25 − 16 = 9।",
        ),
      },
      { label: t("3 only", "केवल 3"), why: t("a² = 9 has two roots.", "a² = 9 के दो मूल हैं।") },
    ],
  },
  pr: {
    prompt: t(
      "Exercise 7.1 Q9 again: with x = 4, R is (4, 6). Find PR, where P is (5, −3).",
      "प्रश्नावली 7.1 प्र9 फिर: x = 4 पर R (4, 6) है। PR ज्ञात करो, जहाँ P (5, −3) है।",
    ),
    right: t("√82", "√82"),
    wrong: [
      {
        label: t("√41", "√41"),
        why: t(
          "√41 is QR, from Q(0, 1). PR is √(1² + 9²).",
          "√41, Q(0, 1) से QR है। PR = √(1² + 9²)।",
        ),
      },
      {
        label: t("10", "10"),
        why: t(
          "That's 1 + 9, the legs added. Square them: √(1 + 81).",
          "यह 1 + 9 है, भुजाएँ जोड़ीं। वर्ग करो: √(1 + 81)।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Finding an unknown coordinate from a given distance (Ex 7.1 Q8, Q9). */
export const unknownCoordinate = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.UsingDistances],
});
