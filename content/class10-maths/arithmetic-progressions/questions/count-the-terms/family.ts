import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const addOne = t(
  "That's n − 1, the number of steps. The number of terms is one more.",
  "यह n − 1 है, क़दमों की संख्या। पदों की संख्या एक ज़्यादा है।",
);
const startRight = (first: string) =>
  t(
    `Start the list at the first number that fits, ${first}, not at the beginning of the range.`,
    `सूची को पहली फ़िट होने वाली संख्या, ${first}, से शुरू करो, सीमा की शुरुआत से नहीं।`,
  );

/** Example 7, Exercise 5.2 Q13–Q15 and similar: count terms with the nth term. */
const items = {
  ex7: numItem(
    t("How many two-digit numbers are divisible by 3?", "दो अंकों की कितनी संख्याएँ 3 से विभाज्य हैं?"),
    "30",
    [
      ["29", addOne],
      ["33", startRight("12")],
    ],
  ),
  q13: numItem(
    t("How many three-digit numbers are divisible by 7?", "तीन अंकों की कितनी संख्याएँ 7 से विभाज्य हैं?"),
    "128",
    [
      ["127", addOne],
      ["142", startRight("105")],
    ],
  ),
  q14: numItem(
    t("How many multiples of 4 lie between 10 and 250?", "10 और 250 के बीच 4 के कितने गुणज हैं?"),
    "60",
    [
      ["59", addOne],
      ["62", startRight("12")],
    ],
  ),
  q15: numItem(
    t(
      "For what n are the nth terms of 63, 65, 67, … and 3, 10, 17, … equal?",
      "किस n के लिए 63, 65, 67, … और 3, 10, 17, … के n वें पद बराबर हैं?",
    ),
    "13",
    [
      [
        "12",
        t(
          "63 + 2(n − 1) = 3 + 7(n − 1) gives n − 1 = 12, so n = 13.",
          "63 + 2(n − 1) = 3 + 7(n − 1) से n − 1 = 12, तो n = 13।",
        ),
      ],
      [
        "60",
        t(
          "60 is the gap between the first terms; it closes by 5 each step.",
          "60 पहले पदों का अंतर है; यह हर क़दम 5 घटता है।",
        ),
      ],
    ],
  ),
  odd2: numItem(
    t("How many two-digit odd numbers are there?", "दो अंकों की कितनी विषम संख्याएँ हैं?"),
    "45",
    [
      ["44", addOne],
      ["50", startRight("11")],
    ],
  ),
  fives: numItem(
    t(
      "How many multiples of 5 are there from 100 to 300, both included?",
      "100 से 300 तक, दोनों शामिल, 5 के कितने गुणज हैं?",
    ),
    "41",
    [
      ["40", addOne],
      [
        "60",
        t(
          "That's 300 ÷ 5, counting from 5. The list is 100, 105, …, 300.",
          "यह 300 ÷ 5 है, 5 से गिनते हुए। सूची है 100, 105, …, 300।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Count the terms of a finite AP with the nth term. */
export const countTheTerms = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingTheNthTerm],
});
