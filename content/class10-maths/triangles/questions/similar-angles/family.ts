import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Exercise 6.3 Q2 and Example 5's kind: angles and sides of similar triangles. */
const items = {
  q2: numItem(
    t(
      "∆ ODC ~ ∆ OBA, ∠BOC = 125° and ∠CDO = 70°. Find ∠OAB.",
      "∆ ODC ~ ∆ OBA, ∠BOC = 125° और ∠CDO = 70°। ∠OAB ज्ञात करो।",
    ),
    "55°",
    [
      [
        "70°",
        t(
          "70° is ∠OBA, which matches ∠ODC. ∠OAB matches ∠OCD.",
          "70°, ∠OBA है, जो ∠ODC से मिलता है। ∠OAB, ∠OCD से मिलता है।",
        ),
      ],
      [
        "35°",
        t(
          "∠DOC = 180° − 125° = 55°, then ∠DCO = 180° − 70° − 55° = 55°, and ∠OAB = ∠OCD.",
          "∠DOC = 180° − 125° = 55°, फिर ∠DCO = 180° − 70° − 55° = 55°, और ∠OAB = ∠OCD।",
        ),
      ],
    ],
  ),
  third: numItem(
    t(
      "∆ ABC ~ ∆ DEF, with ∠A = 47° and ∠E = 83°. Find ∠F.",
      "∆ ABC ~ ∆ DEF, जिसमें ∠A = 47° और ∠E = 83°। ∠F ज्ञात करो।",
    ),
    "50°",
    [
      [
        "83°",
        t(
          "83° is ∠E, which equals ∠B. ∠F is the third angle: 180° − 47° − 83°.",
          "83°, ∠E है, जो ∠B के बराबर है। ∠F तीसरा कोण है: 180° − 47° − 83°।",
        ),
      ],
      [
        "130°",
        t(
          "That's ∠D + ∠E. Take it from 180° to get ∠F.",
          "यह ∠D + ∠E है। ∠F पाने के लिए इसे 180° से घटाओ।",
        ),
      ],
    ],
  ),
  side: numItem(
    t(
      "In ∆ ABC and ∆ DEF, ∠A = ∠D = 50° and ∠B = ∠E = 60°. AB = 6 cm, DE = 9 cm and BC = 8 cm. Find EF.",
      "∆ ABC और ∆ DEF में ∠A = ∠D = 50° और ∠B = ∠E = 60°। AB = 6 cm, DE = 9 cm और BC = 8 cm। EF ज्ञात करो।",
    ),
    "12 cm",
    [
      [
        "11 cm",
        t(
          "That adds 3 cm. By AA they're similar, so multiply by 9 ÷ 6 = 1.5.",
          "यह 3 cm जोड़ता है। AA से वे समरूप हैं, तो 9 ÷ 6 = 1.5 से गुणा करो।",
        ),
      ],
      [
        "5⅓ cm",
        t(
          "That's the ratio upside down. DE is longer than AB, so EF is longer than BC.",
          "यह उल्टा अनुपात है। DE, AB से लंबी है, तो EF, BC से लंबी है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find angles and sides once two triangles are known to be similar. */
export const similarAngles = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.AaAndSss],
});
