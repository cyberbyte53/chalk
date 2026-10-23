import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** A larger copy's lengths (Example 2, Exercise 11.1 Q3, Q4, Q6, Q7). */
const items = {
  q3: numItem(
    t(
      "Exercise 11.1 Q3: sides 5, 6 and 7 cm, scale factor 7/5. How long is the copy of the 5 cm side?",
      "प्रश्नावली 11.1 प्र.3: भुजाएँ 5, 6 और 7 cm, स्केल गुणक 7/5। 5 cm वाली भुजा की नक़ल कितनी लंबी है?",
    ),
    "7 cm",
    [
      [
        "25/7 cm",
        t(
          "That's 5 × 5/7, a smaller copy. Multiply by 7/5.",
          "वह 5 × 5/7 है, छोटी नक़ल। 7/5 से गुणा करो।",
        ),
      ],
      [
        "12 cm",
        t("Adding 7 doesn't keep the shape. 5 × 7/5 = 7.", "7 जोड़ने से आकार नहीं बचता। 5 × 7/5 = 7।"),
      ],
    ],
  ),
  q3long: numItem(
    t(
      "Exercise 11.1 Q3: the copy of the 7 cm side at scale factor 7/5 is how long?",
      "प्रश्नावली 11.1 प्र.3: स्केल गुणक 7/5 पर 7 cm वाली भुजा की नक़ल कितनी लंबी है?",
    ),
    "9.8 cm",
    [
      [
        "5 cm",
        t(
          "That's 7 × 5/7, a smaller copy. Larger means 7 × 7/5.",
          "वह 7 × 5/7 है, छोटी नक़ल। बड़ी यानी 7 × 7/5।",
        ),
      ],
      [
        "8.4 cm",
        t(
          "8.4 cm is the copy of the 6 cm side. This one is 7 × 7/5.",
          "8.4 cm, 6 cm वाली भुजा की नक़ल है। यह 7 × 7/5 है।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 11.1 Q4: an isosceles triangle with base 8 cm and altitude 4 cm is copied at 1½ times. What is the new altitude?",
      "प्रश्नावली 11.1 प्र.4: आधार 8 cm, शीर्षलंब 4 cm वाले समद्विबाहु त्रिभुज की 1½ गुना नक़ल। नया शीर्षलंब क्या है?",
    ),
    "6 cm",
    [
      [
        "4 cm",
        t(
          "Every length of a similar triangle scales, the altitude too: 4 × 3/2.",
          "समरूप त्रिभुज की हर लंबाई बदलती है, शीर्षलंब भी: 4 × 3/2।",
        ),
      ],
      [
        "12 cm",
        t(
          "12 cm is the new base, 8 × 3/2. The altitude is 4 × 3/2.",
          "12 cm नया आधार है, 8 × 3/2। शीर्षलंब 4 × 3/2 है।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 11.1 Q6: BC = 7 cm, scale factor 4/3. How long is BC′?",
      "प्रश्नावली 11.1 प्र.6: BC = 7 cm, स्केल गुणक 4/3। BC′ कितना लंबा है?",
    ),
    "28/3 cm",
    [
      [
        "21/4 cm",
        t(
          "That's 7 × 3/4, a smaller copy. 4/3 makes it longer.",
          "वह 7 × 3/4 है, छोटी नक़ल। 4/3 से लंबी होती है।",
        ),
      ],
      [
        "11 cm",
        t(
          "7 + 4 adds instead of scaling. BC′ = 7 × 4/3.",
          "7 + 4 जोड़ता है, बदलता नहीं। BC′ = 7 × 4/3।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 11.1 Q7: a right triangle with legs 4 cm and 3 cm, scale factor 5/3. How long is the copy's hypotenuse?",
      "प्रश्नावली 11.1 प्र.7: 4 cm और 3 cm पादों वाला समकोण त्रिभुज, स्केल गुणक 5/3। नक़ल का कर्ण कितना लंबा है?",
    ),
    "25/3 cm",
    [
      [
        "5 cm",
        t(
          "5 cm is the original hypotenuse (3, 4, 5). Scale it: 5 × 5/3.",
          "5 cm मूल कर्ण है (3, 4, 5)। उसे बदलो: 5 × 5/3।",
        ),
      ],
      [
        "20/3 cm",
        t(
          "20/3 is the copy of the 4 cm leg. The hypotenuse is 5 × 5/3.",
          "20/3, 4 cm वाले पाद की नक़ल है। कर्ण 5 × 5/3 है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** The sides of a larger similar triangle. */
export const largerSides = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SimilarTriangleLarger],
});
