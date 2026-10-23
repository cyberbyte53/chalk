import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** A smaller copy: how many steps, which marks, the new sides (Example 1, Exercise 11.1 Q2, Q5). */
const items = {
  steps23: numItem(
    t(
      "Exercise 11.1 Q2: scale factor 2/3. How many equal steps are marked on BX?",
      "प्रश्नावली 11.1 प्र.2: स्केल गुणक 2/3। BX पर कितने बराबर कदम लगते हैं?",
    ),
    "3",
    [
      [
        "5",
        t(
          "5 = 2 + 3 is for dividing a segment in 2 : 3. A scale factor needs the greater number, 3.",
          "5 = 2 + 3 रेखाखंड को 2 : 3 में बाँटने के लिए है। स्केल गुणक के लिए बड़ी संख्या, 3।",
        ),
      ],
      [
        "2",
        t(
          "2 steps can't reach B₃, which is joined to C. Mark the greater number, 3.",
          "2 कदम B₃ तक नहीं पहुँचते, जिसे C से मिलाना है। बड़ी संख्या, 3, जितने कदम लगाओ।",
        ),
      ],
    ],
  ),
  joined: numItem(
    t(
      "Scale factor 3/4 (Example 1): which mark is joined to C?",
      "स्केल गुणक 3/4 (उदाहरण 1): किस निशान को C से मिलाते हैं?",
    ),
    "B₄",
    [
      [
        "B₃",
        t(
          "B₃ is where the parallel is drawn. C is joined to the denominator's mark, B₄.",
          "B₃ से समांतर रेखा खींचते हैं। C को हर वाले निशान, B₄, से मिलाते हैं।",
        ),
      ],
      [
        "B₇",
        t(
          "There are only 4 marks; 7 = 3 + 4 is for dividing a segment.",
          "केवल 4 निशान हैं; 7 = 3 + 4 रेखाखंड बाँटने के लिए है।",
        ),
      ],
    ],
  ),
  q2sides: numItem(
    t(
      "Exercise 11.1 Q2: sides 4, 5 and 6 cm, scale factor 2/3. How long is the copy of the 6 cm side?",
      "प्रश्नावली 11.1 प्र.2: भुजाएँ 4, 5 और 6 cm, स्केल गुणक 2/3। 6 cm वाली भुजा की नक़ल कितनी लंबी है?",
    ),
    "4 cm",
    [
      [
        "9 cm",
        t("9 is 6 × 3/2, a larger copy. Multiply by 2/3.", "9, 6 × 3/2 है, बड़ी नक़ल। 2/3 से गुणा करो।"),
      ],
      [
        "3 cm",
        t(
          "That's 6 ÷ 2. The scale factor is 2/3: 6 × 2 ÷ 3.",
          "वह 6 ÷ 2 है। स्केल गुणक 2/3 है: 6 × 2 ÷ 3।",
        ),
      ],
    ],
  ),
  q5angle: {
    prompt: t(
      "Exercise 11.1 Q5: ∠ABC = 60°, scale factor 3/4. What is ∠A′BC′ in the copy?",
      "प्रश्नावली 11.1 प्र.5: ∠ABC = 60°, स्केल गुणक 3/4। नक़ल में ∠A′BC′ क्या है?",
    ),
    right: t("60°, the same angle", "60°, वही कोण"),
    wrong: [
      {
        label: t("45°, scaled by 3/4", "45°, 3/4 से घटा"),
        why: t(
          "Similar triangles have equal angles; only the sides scale. ∠B is shared.",
          "समरूप त्रिभुजों के कोण बराबर होते हैं; केवल भुजाएँ बदलती हैं। ∠B साझा है।",
        ),
      },
      {
        label: t("80°, scaled by 4/3", "80°, 4/3 से बढ़ा"),
        why: t(
          "Angles never scale. The copy keeps ∠B = 60°.",
          "कोण कभी छोटे-बड़े नहीं होते। नक़ल में ∠B = 60° ही रहता है।",
        ),
      },
    ],
  },
  inside: {
    prompt: t("With scale factor 3/4, where does C′ fall?", "स्केल गुणक 3/4 में, C′ कहाँ पड़ता है?"),
    right: t("Between B and C, on BC itself", "B और C के बीच, BC पर ही"),
    wrong: [
      {
        label: t("Beyond C, on BC extended", "C के आगे, बढ़ाई गई BC पर"),
        why: t(
          "That happens for a scale factor greater than 1. With 3/4, BC′ is shorter than BC.",
          "ऐसा 1 से बड़े स्केल गुणक में होता है। 3/4 में BC′, BC से छोटा है।",
        ),
      },
      {
        label: t("Beyond B, on CB extended", "B के आगे, बढ़ाई गई CB पर"),
        why: t(
          "C′ is on the same side of B as C, because the parallel cuts BC between the marks.",
          "C′, B के उसी ओर है जिधर C, क्योंकि समांतर रेखा BC को निशानों के बीच काटती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Counts, marks and sides for a smaller similar triangle. */
export const scaleMarks = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.SimilarTriangleSmaller],
});
