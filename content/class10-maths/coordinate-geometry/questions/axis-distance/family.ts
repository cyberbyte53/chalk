import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const added = t(
  "You added the two lengths: that's walking round two sides. The straight line is the hypotenuse, so use Pythagoras.",
  "तुमने दोनों लंबाइयाँ जोड़ दीं: यह दो भुजाओं से घूमकर चलना है। सीधी रेखा कर्ण है, तो पाइथागोरस लो।",
);
const subtracted = t(
  "Subtracting works only for two points on the same axis. These are on different axes: use Pythagoras.",
  "घटाना केवल एक ही अक्ष के दो बिंदुओं के लिए चलता है। ये अलग अक्षों पर हैं: पाइथागोरस लो।",
);
const sign = t(
  "The points are on opposite sides of O. Subtract with the signs: the larger minus the smaller.",
  "बिंदु O के विपरीत ओर हैं। चिह्नों के साथ घटाओ: बड़े में से छोटा।",
);

const items = {
  xAxis: numItem(t("A(−3, 0) and B(4, 0). Find AB.", "A(−3, 0) और B(4, 0)। AB ज्ञात करो।"), "7", [
    ["1", sign],
    [
      "−7",
      t("A distance is never negative: 4 − (−3) = 7.", "दूरी कभी ऋणात्मक नहीं होती: 4 − (−3) = 7।"),
    ],
  ]),
  yAxis: numItem(t("C(0, −2) and D(0, 9). Find CD.", "C(0, −2) और D(0, 9)। CD ज्ञात करो।"), "11", [
    ["7", sign],
    [
      "√85",
      t(
        "Both points are on the y-axis, so just subtract: 9 − (−2).",
        "दोनों बिंदु y-अक्ष पर हैं, तो बस घटाओ: 9 − (−2)।",
      ),
    ],
  ]),
  sixEight: numItem(t("B(6, 0) and D(0, 8). Find BD.", "B(6, 0) और D(0, 8)। BD ज्ञात करो।"), "10", [
    ["14", added],
    ["2", subtracted],
  ]),
  fiveTwelve: numItem(
    t("P(−5, 0) and Q(0, 12). Find PQ.", "P(−5, 0) और Q(0, 12)। PQ ज्ञात करो।"),
    "13",
    [
      ["17", added],
      ["7", subtracted],
    ],
  ),
  origin: numItem(
    t("How far is the point (0, −6) from the origin?", "बिंदु (0, −6) मूलबिंदु से कितनी दूर है?"),
    "6",
    [
      [
        "−6",
        t(
          "A distance is never negative: the point is 6 units below O.",
          "दूरी कभी ऋणात्मक नहीं होती: बिंदु O से 6 इकाई नीचे है।",
        ),
      ],
      [
        "0",
        t(
          "0 is its x-coordinate. Its distance from O is 6.",
          "0 इसका x-निर्देशांक है। O से इसकी दूरी 6 है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Distances between points on the axes: subtract, or Pythagoras across the axes (NCERT 7.2). */
export const axisDistance = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.PointsOnThePlane],
});
