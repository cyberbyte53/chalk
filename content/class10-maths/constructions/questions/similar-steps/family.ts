import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type StepsItem, stepsFamily } from "../../kit";

/** Construction 11.2: put the steps in order, smaller (Example 1) and larger (Example 2). */
const items = {
  smaller: {
    prompt: t(
      "Put the steps for a triangle similar to ABC with scale factor 3/4 in order.",
      "स्केल गुणक 3/4 से ABC के समरूप त्रिभुज के चरण क्रम में लगाओ।",
    ),
    steps: [
      {
        id: "ray",
        label: t(
          "Draw ray BX at an acute angle to BC, away from A.",
          "BC के साथ न्यून कोण पर किरण BX खींचो, A से उलटी ओर।",
        ),
      },
      {
        id: "marks",
        label: t("Mark 4 equal steps B₁ to B₄ on BX.", "BX पर 4 बराबर कदम B₁ से B₄ लगाओ।"),
        hint: t("The steps go on BX, so draw it first.", "कदम BX पर लगते हैं, तो पहले उसे खींचो।"),
      },
      {
        id: "join",
        label: t(
          "Join B₄C, and through B₃ draw a parallel to it, meeting BC at C′.",
          "B₄C मिलाओ, और B₃ से उसके समांतर रेखा खींचो, जो BC को C′ पर मिले।",
        ),
        hint: t("B₄ and B₃ must be marked first.", "पहले B₄ और B₃ चिह्नित होने चाहिए।"),
      },
      {
        id: "last",
        label: t(
          "Through C′ draw a parallel to CA, meeting BA at A′.",
          "C′ से CA के समांतर रेखा खींचो, जो BA को A′ पर मिले।",
        ),
        hint: t("You need C′ before drawing through it.", "उससे रेखा खींचने से पहले C′ चाहिए।"),
      },
    ],
  },
  larger: {
    prompt: t(
      "Put the steps for a triangle similar to ABC with scale factor 5/3 in order.",
      "स्केल गुणक 5/3 से ABC के समरूप त्रिभुज के चरण क्रम में लगाओ।",
    ),
    steps: [
      {
        id: "ray",
        label: t(
          "Draw ray BX at an acute angle to BC, away from A.",
          "BC के साथ न्यून कोण पर किरण BX खींचो, A से उलटी ओर।",
        ),
      },
      {
        id: "marks",
        label: t("Mark 5 equal steps B₁ to B₅ on BX.", "BX पर 5 बराबर कदम B₁ से B₅ लगाओ।"),
        hint: t("The steps go on BX, so draw it first.", "कदम BX पर लगते हैं, तो पहले उसे खींचो।"),
      },
      {
        id: "join",
        label: t(
          "Join B₃C, and through B₅ draw a parallel to it, meeting BC extended at C′.",
          "B₃C मिलाओ, और B₅ से उसके समांतर रेखा खींचो, जो बढ़ाई गई BC को C′ पर मिले।",
        ),
        hint: t("B₃ and B₅ must be marked first.", "पहले B₃ और B₅ चिह्नित होने चाहिए।"),
      },
      {
        id: "last",
        label: t(
          "Through C′ draw a parallel to CA, meeting BA extended at A′.",
          "C′ से CA के समांतर रेखा खींचो, जो बढ़ाई गई BA को A′ पर मिले।",
        ),
        hint: t("You need C′ before drawing through it.", "उससे रेखा खींचने से पहले C′ चाहिए।"),
      },
    ],
  },
} satisfies Record<string, StepsItem>;

/** Order the steps of constructing a similar triangle. */
export const similarSteps = stepsFamily(items, {
  level: Level.Medium,
  tests: [Concept.SimilarTriangleSmaller, Concept.SimilarTriangleLarger],
});
