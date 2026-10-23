import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem, wordItem } from "../../kit";

const hollowAdds = t(
  "A hollow's inside is new surface: it adds, it doesn't take away.",
  "गड्ढे का अंदरूनी भाग नया पृष्ठ है: वह जुड़ता है, घटता नहीं।",
);
const circleGoes = t(
  "Where the hollow opens, that circle of the face is gone: take it away.",
  "जहाँ गड्ढा खुलता है, फलक का वह वृत्त चला गया: उसे घटाओ।",
);

/** Exercise 13.1 Q5, Q8, Q9, and what happens to faces when solids are joined or scooped. */
const items = {
  q5: numItem(
    t(
      "Exercise 13.1 Q5. A hemisphere of diameter l is scooped out of one face of a cube of edge l. The surface area left is",
      "प्रश्नावली 13.1 प्र5। किनारे l वाले घन के एक फलक से व्यास l का अर्धगोला निकाला जाता है। बचा पृष्ठीय क्षेत्रफल है",
    ),
    "l²(24 + π)/4",
    [
      ["l²(24 − π)/4", hollowAdds],
      ["l²(12 + π)/2", circleGoes],
    ],
  ),
  q8: numItem(
    t(
      "Exercise 13.1 Q8. A cone of the same height and diameter is hollowed out of a solid cylinder 2.4 cm high and 1.4 cm across. The total surface area left, to the nearest cm², is",
      "प्रश्नावली 13.1 प्र8। 2.4 cm ऊँचे और 1.4 cm चौड़े ठोस बेलन से उसी ऊँचाई और व्यास का शंकु खोखला किया जाता है। बचा कुल पृष्ठीय क्षेत्रफल, निकटतम cm² तक, है",
    ),
    "18 cm²",
    [
      ["19 cm²", circleGoes],
      ["8 cm²", hollowAdds],
    ],
  ),
  q9: numItem(
    t(
      "Exercise 13.1 Q9. A hemisphere is scooped out of each end of a solid cylinder 10 cm high, radius 3.5 cm. The article's total surface area is",
      "प्रश्नावली 13.1 प्र9। 10 cm ऊँचे, त्रिज्या 3.5 cm के ठोस बेलन के हर सिरे से एक अर्धगोला निकाला जाता है। वस्तु का कुल पृष्ठीय क्षेत्रफल है",
    ),
    "374 cm²",
    [
      [
        "297 cm²",
        t(
          "That's the plain cylinder. Each flat end is replaced by a hollow of 2πr².",
          "यह सादा बेलन है। हर सपाट सिरा 2πr² के गड्ढे से बदल गया है।",
        ),
      ],
      ["143 cm²", hollowAdds],
    ],
  ),
  stuck: wordItem(
    t(
      "A cone is stuck on a hemisphere of the same radius. Compared with the two parts' total surface areas added, the toy's surface is less by",
      "समान त्रिज्या के अर्धगोले पर एक शंकु चिपकाया जाता है। दोनों भागों के कुल पृष्ठीय क्षेत्रफलों के योग से खिलौने का पृष्ठ कम है",
    ),
    t("Both flat circles", "दोनों सपाट वृत्त"),
    [
      [
        t("One flat circle", "एक सपाट वृत्त"),
        t(
          "Each part had a flat circle at the join, and both are now inside.",
          "जोड़ पर हर भाग का एक सपाट वृत्त था, और दोनों अब अंदर हैं।",
        ),
      ],
      [
        t("Nothing at all", "कुछ भी नहीं"),
        t(
          "Glued faces can't be seen or painted: they leave the surface.",
          "चिपके फलक न दिखते हैं न रंगे जाते हैं: वे पृष्ठ से हट जाते हैं।",
        ),
      ],
    ],
  ),
  scoop: wordItem(
    t(
      "A hemisphere of radius r is scooped out of the top of a wide cylinder. The top face",
      "एक चौड़े बेलन के ऊपर से त्रिज्या r का अर्धगोला निकाला जाता है। ऊपरी फलक",
    ),
    t("Loses πr², and 2πr² is added", "πr² खोता है, और 2πr² जुड़ता है"),
    [
      [t("Loses πr², and nothing is added", "πr² खोता है, और कुछ नहीं जुड़ता"), hollowAdds],
      [
        t("Loses 2πr², and πr² is added", "2πr² खोता है, और πr² जुड़ता है"),
        t(
          "The face loses the flat circle where the hollow opens (πr²); the hollow's curved inside is 2πr².",
          "फलक वह सपाट वृत्त खोता है जहाँ गड्ढा खुलता है (πr²); गड्ढे का वक्र अंदरूनी भाग 2πr² है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Surfaces hidden by joining, and surfaces made by hollowing. */
export const hollowsAndHidden = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SurfaceAreaOfCombinations],
});
