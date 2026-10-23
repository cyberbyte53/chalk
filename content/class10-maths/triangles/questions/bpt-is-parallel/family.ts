import { t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const yes = t("Yes: the two ratios are equal", "हाँ: दोनों अनुपात बराबर हैं");
const no = t("No: the two ratios differ", "नहीं: दोनों अनुपात अलग हैं");
const only = t("Only if PQ and PR are equal", "केवल तब जब PQ और PR बराबर हों");

const onlyWhy = t(
  "The converse of the BPT needs only PE/EQ = PF/FR; the triangle can be any shape.",
  "BPT के विलोम को बस PE/EQ = PF/FR चाहिए; त्रिभुज किसी भी आकार का हो सकता है।",
);

/** An item for Exercise 6.2 Q2: is EF ∥ QR? */
function parallelItem(prompt: Localized, isParallel: boolean, why: Localized): Item {
  return {
    prompt,
    right: isParallel ? yes : no,
    wrong: [
      { label: isParallel ? no : yes, why },
      { label: only, why: onlyWhy },
    ],
  };
}

/** Exercise 6.2 Q2: use the converse of the BPT to test for parallel lines. */
const items = {
  q2i: parallelItem(
    t(
      "E and F are on PQ and PR of ∆ PQR. PE = 3.9 cm, EQ = 3 cm, PF = 3.6 cm, FR = 2.4 cm. Is EF ∥ QR?",
      "E और F, ∆ PQR की PQ और PR पर हैं। PE = 3.9 cm, EQ = 3 cm, PF = 3.6 cm, FR = 2.4 cm। क्या EF ∥ QR?",
    ),
    false,
    t("PE/EQ = 1.3 but PF/FR = 1.5.", "PE/EQ = 1.3 पर PF/FR = 1.5।"),
  ),
  q2ii: parallelItem(
    t(
      "E and F are on PQ and PR of ∆ PQR. PE = 4 cm, EQ = 4.5 cm, PF = 8 cm, FR = 9 cm. Is EF ∥ QR?",
      "E और F, ∆ PQR की PQ और PR पर हैं। PE = 4 cm, EQ = 4.5 cm, PF = 8 cm, FR = 9 cm। क्या EF ∥ QR?",
    ),
    true,
    t("PE/EQ = 4/4.5 = 8/9 and PF/FR = 8/9.", "PE/EQ = 4/4.5 = 8/9 और PF/FR = 8/9।"),
  ),
  q2iii: parallelItem(
    t(
      "E and F are on PQ and PR of ∆ PQR. PQ = 1.28 cm, PR = 2.56 cm, PE = 0.18 cm, PF = 0.36 cm. Is EF ∥ QR?",
      "E और F, ∆ PQR की PQ और PR पर हैं। PQ = 1.28 cm, PR = 2.56 cm, PE = 0.18 cm, PF = 0.36 cm। क्या EF ∥ QR?",
    ),
    true,
    t(
      "PE/PQ = 0.18/1.28 and PF/PR = 0.36/2.56, which is the same fraction doubled top and bottom.",
      "PE/PQ = 0.18/1.28 और PF/PR = 0.36/2.56, जो वही भिन्न है, ऊपर-नीचे दोगुना।",
    ),
  ),
  equalParts: parallelItem(
    t(
      "E and F are on PQ and PR of ∆ PQR. PE = 2 cm, EQ = 3 cm, PF = 3 cm, FR = 2 cm. Is EF ∥ QR?",
      "E और F, ∆ PQR की PQ और PR पर हैं। PE = 2 cm, EQ = 3 cm, PF = 3 cm, FR = 2 cm। क्या EF ∥ QR?",
    ),
    false,
    t(
      "The same numbers in a different order: PE/EQ = 2/3 but PF/FR = 3/2.",
      "वही संख्याएँ अलग क्रम में: PE/EQ = 2/3 पर PF/FR = 3/2।",
    ),
  ),
} satisfies Record<string, Item>;

/** Decide whether a line is parallel to a side, by the converse of the BPT. */
export const bptIsParallel = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.BasicProportionality],
});
