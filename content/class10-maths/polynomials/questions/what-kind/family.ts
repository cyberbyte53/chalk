import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Kind = { Not: "not", Linear: "linear", Quadratic: "quadratic", Cubic: "cubic" } as const;
const names = {
  not: { en: "Not a polynomial", hi: "बहुपद नहीं" },
  linear: { en: "Linear", hi: "रैखिक" },
  quadratic: { en: "Quadratic", hi: "द्विघात" },
  cubic: { en: "Cubic", hi: "त्रिघात" },
} as const;
const degreeOf = { linear: 1, quadratic: 2, cubic: 3 } as const;

/** Polynomial or not, and which kind (NCERT 2.1): whole-number powers only; the degree names it. */
export const whatKind = family({
  level: Level.Easy,
  tests: [Concept.WhatIsAPolynomial],
  params: z
    .object({
      /** The expression, in LaTeX. */
      expression: z.string(),
      kind: z.nativeEnum(Kind),
      /** Not a polynomial: the power that breaks the rule, in LaTeX ("(x - 1)^{-1}"). */
      power: z.string().optional(),
    })
    .strict(),
  build: ({ expression, kind, power }, b) => {
    const options = (Object.keys(names) as (keyof typeof names)[]).map((k) => {
      if (k === kind) return { id: "right", label: t(names[k].en, names[k].hi) };
      const feedback =
        kind === Kind.Not
          ? t(
              `It isn't a polynomial: it has $${power ?? ""}$, and a power in a polynomial must be a whole number.`,
              `यह बहुपद नहीं है: इसमें $${power ?? ""}$ है, और बहुपद में घात पूर्ण संख्या होनी चाहिए।`,
            )
          : k === Kind.Not
            ? t(
                "Every power of the variable here is a whole number, so it is a polynomial. Which kind?",
                "यहाँ चर की हर घात पूर्ण संख्या है, तो यह बहुपद है। किस तरह का?",
              )
            : t(
                `Find the highest power, wherever it is written: it is ${degreeOf[kind]}.`,
                `सबसे बड़ी घात खोजो, चाहे वह कहीं भी लिखी हो: वह ${degreeOf[kind]} है।`,
              );
      return { id: k, label: t(names[k].en, names[k].hi), feedback };
    });
    const ask = choiceQuestion(b, {
      prompt: t(`What is $${expression}$?`, `$${expression}$ क्या है?`),
      options,
      answer: "right",
    });
    return column([ask, space()]);
  },
});
