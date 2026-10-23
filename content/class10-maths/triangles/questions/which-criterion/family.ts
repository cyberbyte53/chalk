import { t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

type Verdict = "aa" | "sss" | "no";

const label: Record<Verdict, Localized> = {
  aa: t("Yes, by AA", "हाँ, AA से"),
  sss: t("Yes, by SSS", "हाँ, SSS से"),
  no: t("No, not similar", "नहीं, समरूप नहीं"),
};

/** An item for Exercise 6.3 Q1: which criterion, if any, makes the pair similar. */
function criterionItem(
  prompt: Localized,
  right: Verdict,
  why: Readonly<Partial<Record<Verdict, Localized>>>,
): Item {
  const others = (["aa", "sss", "no"] as const).filter((v) => v !== right);
  return {
    prompt,
    right: label[right],
    wrong: others.map((v) => ({ label: label[v], why: why[v] as Localized })),
  };
}

/** Exercise 6.3 Q1 (i), (ii), (vi) and one more: AA and SSS. */
const items = {
  q1i: criterionItem(
    t(
      "∆ ABC: ∠A = 60°, ∠B = 80°, ∠C = 40°. ∆ PQR: ∠P = 60°, ∠Q = 80°, ∠R = 40°. Are they similar?",
      "∆ ABC: ∠A = 60°, ∠B = 80°, ∠C = 40°। ∆ PQR: ∠P = 60°, ∠Q = 80°, ∠R = 40°। क्या वे समरूप हैं?",
    ),
    "aa",
    {
      sss: t(
        "No sides are given here; the angles match, which is AA.",
        "यहाँ कोई भुजा नहीं दी है; कोण मिलते हैं, यानी AA।",
      ),
      no: t(
        "All three angles match, so ∆ ABC ~ ∆ PQR by AA.",
        "तीनों कोण मिलते हैं, तो AA से ∆ ABC ~ ∆ PQR।",
      ),
    },
  ),
  q1ii: criterionItem(
    t(
      "∆ ABC: AB = 2, BC = 2.5, CA = 3 cm. ∆ PQR: PQ = 6, QR = 4, RP = 5 cm. Are they similar?",
      "∆ ABC: AB = 2, BC = 2.5, CA = 3 cm। ∆ PQR: PQ = 6, QR = 4, RP = 5 cm। क्या वे समरूप हैं?",
    ),
    "sss",
    {
      aa: t(
        "No angles are given. Sort the sides: 2, 2.5, 3 and 4, 5, 6, all doubled. That's SSS.",
        "कोई कोण नहीं दिया। भुजाएँ क्रम से लगाओ: 2, 2.5, 3 और 4, 5, 6, सब दोगुनी। यह SSS है।",
      ),
      no: t(
        "Match smallest with smallest: 2 : 4, 2.5 : 5, 3 : 6. All are 1 : 2.",
        "छोटी को छोटी से मिलाओ: 2 : 4, 2.5 : 5, 3 : 6। सब 1 : 2 हैं।",
      ),
    },
  ),
  q1vi: criterionItem(
    t(
      "∆ DEF: ∠D = 70°, ∠E = 80°. ∆ PQR: ∠P = 80°, ∠R = 30°. Are they similar?",
      "∆ DEF: ∠D = 70°, ∠E = 80°। ∆ PQR: ∠P = 80°, ∠R = 30°। क्या वे समरूप हैं?",
    ),
    "aa",
    {
      sss: t(
        "Only angles are given. ∠F = 30° and ∠Q = 70°, so AA.",
        "केवल कोण दिए हैं। ∠F = 30° और ∠Q = 70°, तो AA।",
      ),
      no: t(
        "Find the third angles: ∠F = 180° − 150° = 30° and ∠Q = 70°. They match, so ∆ DEF ~ ∆ QPR.",
        "तीसरे कोण निकालो: ∠F = 180° − 150° = 30° और ∠Q = 70°। वे मिलते हैं, तो ∆ DEF ~ ∆ QPR।",
      ),
    },
  ),
  notSss: criterionItem(
    t(
      "∆ LMN: sides 3, 4 and 6 cm. ∆ XYZ: sides 4.5, 6 and 8 cm. Are they similar?",
      "∆ LMN: भुजाएँ 3, 4 और 6 cm। ∆ XYZ: भुजाएँ 4.5, 6 और 8 cm। क्या वे समरूप हैं?",
    ),
    "no",
    {
      aa: t(
        "No angles are given, so AA can't be used here.",
        "कोई कोण नहीं दिया, तो यहाँ AA नहीं लग सकता।",
      ),
      sss: t(
        "4.5 ÷ 3 = 1.5 and 6 ÷ 4 = 1.5, but 8 ÷ 6 ≈ 1.33. One ratio is off.",
        "4.5 ÷ 3 = 1.5 और 6 ÷ 4 = 1.5, पर 8 ÷ 6 ≈ 1.33। एक अनुपात अलग है।",
      ),
    },
  ),
} satisfies Record<string, Item>;

/** Decide whether two triangles are similar, and by which criterion. */
export const whichCriterion = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.AaAndSss],
});
