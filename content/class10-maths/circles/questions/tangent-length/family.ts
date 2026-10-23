import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const added = t(
  "You added the squares. OQ is the hypotenuse (opposite the right angle at P), so subtract.",
  "तुमने वर्ग जोड़ दिए। OQ कर्ण है (P पर समकोण के सामने), इसलिए घटाओ।",
);
const lengths = t(
  "Subtract the squares, not the lengths: PQ² = OQ² − OP².",
  "लंबाइयाँ नहीं, वर्ग घटाओ: PQ² = OQ² − OP²।",
);

const items = {
  q3: numItem(
    t(
      "Exercise 10.1 Q3: a tangent PQ at P meets a line through the centre O at Q. The radius is 5 cm and OQ = 12 cm. Find PQ.",
      "प्रश्नावली 10.1 प्र3: P पर स्पर्श रेखा PQ, केंद्र O से जाने वाली रेखा से Q पर मिलती है। त्रिज्या 5 cm और OQ = 12 cm है। PQ ज्ञात करो।",
    ),
    "√119 cm",
    [
      ["13 cm", added],
      ["7 cm", lengths],
      [
        "8.5 cm",
        t(
          "That's the average of 5 and 12. Use PQ² = 12² − 5².",
          "यह 5 और 12 का औसत है। PQ² = 12² − 5² लो।",
        ),
      ],
    ],
  ),
  six: numItem(
    t(
      "The radius is 6 cm and a point Q on the tangent at P is 10 cm from the centre. Find PQ.",
      "त्रिज्या 6 cm है और P पर स्पर्श रेखा का बिंदु Q केंद्र से 10 cm दूर है। PQ ज्ञात करो।",
    ),
    "8 cm",
    [
      ["4 cm", lengths],
      ["√136 cm", added],
    ],
  ),
  eight: numItem(
    t(
      "The radius is 8 cm and OQ = 17 cm, where Q is on the tangent at P. Find PQ.",
      "त्रिज्या 8 cm और OQ = 17 cm है, जहाँ Q, P पर स्पर्श रेखा पर है। PQ ज्ञात करो।",
    ),
    "15 cm",
    [
      ["9 cm", lengths],
      ["√353 cm", added],
    ],
  ),
  oq: numItem(
    t(
      "The tangent from P to a point Q is 12 cm long, and the radius is 5 cm. How far is Q from the centre?",
      "P से बिंदु Q तक स्पर्श रेखा 12 cm लंबी है, और त्रिज्या 5 cm है। Q केंद्र से कितनी दूर है?",
    ),
    "13 cm",
    [
      [
        "√119 cm",
        t(
          "Here OQ is the one we want, and it's the hypotenuse: add the squares, 12² + 5² = 169.",
          "यहाँ OQ चाहिए, और वही कर्ण है: वर्ग जोड़ो, 12² + 5² = 169।",
        ),
      ],
      ["17 cm", t("That's 12 + 5. Use squares: √(144 + 25).", "यह 12 + 5 है। वर्ग लो: √(144 + 25)।")],
    ],
  ),
} satisfies Record<string, Item>;

/** Tangent ⟂ radius gives a right triangle: find the missing length (Ex 10.1 Q3 and similar). */
export const tangentLength = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TangentPerpendicularRadius],
});
