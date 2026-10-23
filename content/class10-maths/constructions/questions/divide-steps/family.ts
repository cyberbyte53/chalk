import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type StepsItem, stepsFamily } from "../../kit";

/** Construction 11.1 and its alternative method: put the steps in order. */
const items = {
  oneRay: {
    prompt: t(
      "Put the steps for dividing AB in the ratio 3 : 2 in order (Construction 11.1).",
      "AB को 3 : 2 में बाँटने के चरण क्रम में लगाओ (रचना 11.1)।",
    ),
    steps: [
      {
        id: "ray",
        label: t(
          "Draw a ray AX making an acute angle with AB.",
          "AB के साथ न्यून कोण बनाती किरण AX खींचो।",
        ),
      },
      {
        id: "marks",
        label: t("Mark 5 equal steps A₁ to A₅ on AX.", "AX पर 5 बराबर कदम A₁ से A₅ लगाओ।"),
        hint: t("The steps go on the ray, so draw AX first.", "कदम किरण पर लगते हैं, तो पहले AX खींचो।"),
      },
      {
        id: "join",
        label: t("Join A₅ to B.", "A₅ को B से मिलाओ।"),
        hint: t(
          "A₅ has to be marked before you can join it.",
          "A₅ को मिलाने से पहले उसे चिह्नित करना होगा।",
        ),
      },
      {
        id: "parallel",
        label: t(
          "Through A₃ draw a line parallel to A₅B, meeting AB at C.",
          "A₃ से A₅B के समांतर रेखा खींचो, जो AB को C पर मिले।",
        ),
        hint: t(
          "You need the line A₅B before you can draw a parallel to it.",
          "उसके समांतर खींचने से पहले रेखा A₅B चाहिए।",
        ),
      },
    ],
  },
  twoRays: {
    prompt: t(
      "Put the steps of the alternative method for dividing AB in 3 : 2 in order.",
      "AB को 3 : 2 में बाँटने की वैकल्पिक विधि के चरण क्रम में लगाओ।",
    ),
    steps: [
      {
        id: "ray",
        label: t(
          "Draw a ray AX making an acute angle with AB.",
          "AB के साथ न्यून कोण बनाती किरण AX खींचो।",
        ),
      },
      {
        id: "by",
        label: t(
          "Draw a ray BY parallel to AX, making ∠ABY = ∠BAX.",
          "AX के समांतर किरण BY खींचो, ∠ABY = ∠BAX बनाकर।",
        ),
        hint: t(
          "BY is drawn parallel to AX, so AX comes first.",
          "BY को AX के समांतर खींचते हैं, तो AX पहले।",
        ),
      },
      {
        id: "marks",
        label: t(
          "Mark A₁, A₂, A₃ on AX and B₁, B₂ on BY, all steps equal.",
          "AX पर A₁, A₂, A₃ और BY पर B₁, B₂ लगाओ, सब कदम बराबर।",
        ),
        hint: t(
          "The marks go on both rays, so draw BY first.",
          "निशान दोनों किरणों पर लगते हैं, तो पहले BY खींचो।",
        ),
      },
      {
        id: "join",
        label: t("Join A₃B₂; it cuts AB at C.", "A₃B₂ मिलाओ; यह AB को C पर काटती है।"),
        hint: t("A₃ and B₂ must be marked first.", "पहले A₃ और B₂ चिह्नित होने चाहिए।"),
      },
    ],
  },
} satisfies Record<string, StepsItem>;

/** Order the steps of dividing a segment in a ratio. */
export const divideSteps = stepsFamily(items, {
  level: Level.Easy,
  tests: [Concept.DividingASegment],
});
