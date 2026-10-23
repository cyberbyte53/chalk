import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

/** The justification of Construction 11.2, smaller and larger. */
const items = {
  ratio34: {
    prompt: t(
      "Example 1 (scale factor 3/4): BC′/C′C = 3/1. What does that give BC′/BC as?",
      "उदाहरण 1 (स्केल गुणक 3/4): BC′/C′C = 3/1। इससे BC′/BC क्या मिलता है?",
    ),
    right: t("3/4, since BC is 3 + 1 parts", "3/4, क्योंकि BC = 3 + 1 भाग"),
    wrong: [
      {
        label: t("3/1, the same as BC′/C′C", "3/1, BC′/C′C जितना"),
        why: t(
          "BC is the whole, BC′ + C′C = 4 parts, so BC′/BC = 3/4.",
          "BC पूरा है, BC′ + C′C = 4 भाग, तो BC′/BC = 3/4।",
        ),
      },
      {
        label: t("1/3, the inverse of BC′/C′C", "1/3, BC′/C′C का उलटा"),
        why: t(
          "That's C′C/BC′. Compare BC′ with the whole BC: 3 out of 4.",
          "वह C′C/BC′ है। BC′ की तुलना पूरे BC से करो: 4 में से 3।",
        ),
      },
    ],
  },
  ratio53: {
    prompt: t(
      "Example 2 (scale factor 5/3): B₃C ∥ B₅C′. What is BC/BC′?",
      "उदाहरण 2 (स्केल गुणक 5/3): B₃C ∥ B₅C′। BC/BC′ क्या है?",
    ),
    right: t("3/5, from the BPT in ∆BB₅C′", "3/5, ∆BB₅C′ में BPT से"),
    wrong: [
      {
        label: t("5/3, the scale factor itself", "5/3, स्वयं स्केल गुणक"),
        why: t("5/3 is BC′/BC. BC/BC′ = BB₃/BB₅ = 3/5.", "5/3, BC′/BC है। BC/BC′ = BB₃/BB₅ = 3/5।"),
      },
      {
        label: t("2/5, the extra part over the whole", "2/5, अतिरिक्त भाग बटा पूरा"),
        why: t(
          "That's CC′/BC′. Compare the whole BC with BC′: BB₃/BB₅ = 3/5.",
          "वह CC′/BC′ है। पूरे BC की तुलना BC′ से करो: BB₃/BB₅ = 3/5।",
        ),
      },
    ],
  },
  extended: {
    prompt: t(
      "Why do C′ and A′ fall on BC and BA extended when the scale factor is 5/3?",
      "स्केल गुणक 5/3 में C′ और A′ बढ़ाई गई BC और BA पर क्यों पड़ते हैं?",
    ),
    right: t("The new sides are longer than BC and BA", "नई भुजाएँ BC और BA से लंबी हैं"),
    wrong: [
      {
        label: t("The ray BX was drawn on the wrong side", "किरण BX ग़लत ओर खींची गई"),
        why: t(
          "BX goes away from A in both examples. C′ is past C because BC′ = 5/3 of BC.",
          "दोनों उदाहरणों में BX, A से उलटी ओर है। C′, C के आगे है क्योंकि BC′ = BC का 5/3।",
        ),
      },
      {
        label: t("Five steps are more than five centimetres", "पाँच कदम पाँच सेंटीमीटर से ज़्यादा हैं"),
        why: t(
          "The step size doesn't matter; only the ratio of steps does. A scale factor over 1 makes every side longer.",
          "कदम का नाप मायने नहीं रखता; केवल कदमों का अनुपात। 1 से बड़ा स्केल गुणक हर भुजा लंबी कर देता है।",
        ),
      },
    ],
  },
  angles: {
    prompt: t("Why is ∠BC′A′ = ∠BCA in Construction 11.2?", "रचना 11.2 में ∠BC′A′ = ∠BCA क्यों है?"),
    right: t("C′A′ ∥ CA makes them corresponding angles", "C′A′ ∥ CA से वे संगत कोण बनते हैं"),
    wrong: [
      {
        label: t("Both angles were measured with a protractor", "दोनों कोण चाँदे से नापे गए"),
        why: t(
          "Constructions don't measure angles. The parallel line makes them equal.",
          "रचनाओं में कोण नापे नहीं जाते। समांतर रेखा उन्हें बराबर बनाती है।",
        ),
      },
      {
        label: t("They are vertically opposite angles at C", "वे C पर शीर्षाभिमुख कोण हैं"),
        why: t(
          "They are at different points, C′ and C. A transversal BC cuts the parallels C′A′ and CA.",
          "वे अलग बिंदुओं, C′ और C, पर हैं। तिर्यक रेखा BC समांतर रेखाओं C′A′ और CA को काटती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Why the similar-triangle constructions give the right triangle. */
export const similarReasons = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SimilarTriangleLarger, Concept.SimilarTriangleSmaller],
});
