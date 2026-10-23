import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const added = t(
  "Similar sides are multiplied by one number, not increased by one amount.",
  "समरूप भुजाएँ एक संख्या से गुणा होती हैं, एक मात्रा से बढ़ती नहीं।",
);

/** Section 6.2: scale factors between similar figures. */
const items = {
  quad: numItem(
    t(
      "ABCD ~ PQRS, with AB = 4 cm, PQ = 6 cm and BC = 5 cm. Find QR.",
      "ABCD ~ PQRS, जिसमें AB = 4 cm, PQ = 6 cm और BC = 5 cm। QR ज्ञात करो।",
    ),
    "7.5 cm",
    [
      ["7 cm", added],
      [
        "3⅓ cm",
        t(
          "That's the ratio upside down. PQ is longer than AB, so QR is longer than BC: 5 × 6 ÷ 4.",
          "यह उल्टा अनुपात है। PQ, AB से लंबी है, तो QR, BC से लंबी: 5 × 6 ÷ 4।",
        ),
      ],
    ],
  ),
  plan: numItem(
    t(
      "A house plan is drawn at 1 : 50. A wall is 4 m long. How long is it on the plan?",
      "घर का नक्शा 1 : 50 पर बना है। एक दीवार 4 m लंबी है। नक्शे पर वह कितनी लंबी है?",
    ),
    "8 cm",
    [
      [
        "200 cm",
        t(
          "That multiplies by 50. The plan is smaller: 400 cm ÷ 50.",
          "यह 50 से गुणा करता है। नक्शा छोटा है: 400 cm ÷ 50।",
        ),
      ],
      ["0.8 cm", t("4 m is 400 cm, and 400 ÷ 50 = 8.", "4 m = 400 cm, और 400 ÷ 50 = 8।")],
    ],
  ),
  pentagon: numItem(
    t(
      "Two pentagons are similar. The smaller has sides 2, 3, 4, 5 and 6 cm. The bigger's shortest side is 3 cm. Find its longest side.",
      "दो पंचभुज समरूप हैं। छोटे की भुजाएँ 2, 3, 4, 5 और 6 cm हैं। बड़े की सबसे छोटी भुजा 3 cm है। उसकी सबसे लंबी भुजा ज्ञात करो।",
    ),
    "9 cm",
    [
      ["7 cm", added],
      [
        "8 cm",
        t("The scale factor is 3 ÷ 2 = 1.5, so 6 × 1.5.", "स्केल गुणक 3 ÷ 2 = 1.5 है, तो 6 × 1.5।"),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Use the scale factor between similar figures. */
export const scaleFactor = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.SimilarFigures],
});
