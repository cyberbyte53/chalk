import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const expand = t(
  "Set the two squared distances equal, expand both sides and cancel x² and y² before collecting terms.",
  "दोनों दूरियों के वर्ग बराबर रखो, दोनों पक्ष खोलो और पद इकट्ठे करने से पहले x² और y² काटो।",
);
const axis = t(
  "On the x-axis the point is (x, 0); on the y-axis it is (0, y). Put that in before solving.",
  "x-अक्ष पर बिंदु (x, 0) है; y-अक्ष पर (0, y)। हल करने से पहले यह रखो।",
);

const items = {
  ex4: numItem(
    t(
      "Example 4: (x, y) is equidistant from A(7, 1) and B(3, 5). Which relation holds?",
      "उदाहरण 4: (x, y), A(7, 1) और B(3, 5) से समदूरस्थ है। कौन-सा संबंध सही है?",
    ),
    "x − y = 2",
    [
      ["x + y = 2", expand],
      ["x − y = −2", expand],
    ],
  ),
  q10: numItem(
    t(
      "Exercise 7.1 Q10: (x, y) is equidistant from (3, 6) and (−3, 4). Which relation holds?",
      "प्रश्नावली 7.1 प्र10: (x, y), (3, 6) और (−3, 4) से समदूरस्थ है। कौन-सा संबंध सही है?",
    ),
    "3x + y = 5",
    [
      ["x + 3y = 5", expand],
      ["3x − y = 5", expand],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 7.1 Q7: find the point on the x-axis equidistant from (2, −5) and (−2, 9).",
      "प्रश्नावली 7.1 प्र7: x-अक्ष पर (2, −5) और (−2, 9) से समदूरस्थ बिंदु ज्ञात करो।",
    ),
    "(−7, 0)",
    [
      ["(7, 0)", t("Check the sign: −8x = 56 gives x = −7.", "चिह्न जाँचो: −8x = 56 से x = −7।")],
      ["(0, −7)", axis],
    ],
  ),
  ex5: numItem(
    t(
      "Example 5: find the point on the y-axis equidistant from A(6, 5) and B(−4, 3).",
      "उदाहरण 5: y-अक्ष पर A(6, 5) और B(−4, 3) से समदूरस्थ बिंदु ज्ञात करो।",
    ),
    "(0, 9)",
    [
      ["(9, 0)", axis],
      [
        "(0, 4)",
        t(
          "(0, 4) is the mid-height of A and B, but it isn't equally far: solve 61 − 10y = 25 − 6y.",
          "(0, 4), A और B की बीच की ऊँचाई है, पर बराबर दूर नहीं: 61 − 10y = 25 − 6y हल करो।",
        ),
      ],
    ],
  ),
  q9: {
    prompt: t(
      "Exercise 7.1 Q9: Q(0, 1) is equidistant from P(5, −3) and R(x, 6). Find x.",
      "प्रश्नावली 7.1 प्र9: Q(0, 1), P(5, −3) और R(x, 6) से समदूरस्थ है। x ज्ञात करो।",
    ),
    right: t("x = 4 or −4", "x = 4 या −4"),
    wrong: [
      {
        label: t("x = 4 only", "केवल x = 4"),
        why: t("x² = 16 has two roots: 4 and −4.", "x² = 16 के दो मूल हैं: 4 और −4।"),
      },
      {
        label: t("x = 16 or −16", "x = 16 या −16"),
        why: t(
          "QP² = 41 = x² + 25, so x² = 16 and x = ±4.",
          "QP² = 41 = x² + 25, तो x² = 16 और x = ±4।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Points equidistant from two points: a relation, or a point on an axis (Examples 4–5, Ex 7.1 Q7, Q9, Q10). */
export const equidistantPoint = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingDistances],
});
