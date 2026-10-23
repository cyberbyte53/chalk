import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Three divisions, each p = g × q + r, and what is special about their degrees (NCERT Ex 2.3 Q5). */
const divisions = {
  samePQ: {
    tex: r`2x^2 + 2x + 8 = 2 \times (x^2 + x + 4) + 0`,
    en: "Here the divisor 2 has degree 0, so the quotient keeps the dividend's degree, 2.",
    hi: "यहाँ भाजक 2 की घात 0 है, तो भागफल की घात भाज्य जितनी, 2, रहती है।",
  },
  sameQR: {
    tex: r`x^3 + x = x^2 \times x + x`,
    en: "Here the quotient $x$ and the remainder $x$ both have degree 1.",
    hi: "यहाँ भागफल $x$ और शेषफल $x$ दोनों की घात 1 है।",
  },
  zeroR: {
    tex: r`x^3 + 1 = (x - 1)(x^2 + x + 1) + 2`,
    en: "Here the remainder is the number 2: degree 0.",
    hi: "यहाँ शेषफल संख्या 2 है: घात 0।",
  },
} as const;
type Which = keyof typeof divisions;
const asks: Record<Which, { en: string; hi: string }> = {
  samePQ: {
    en: "In which division does the quotient have the same degree as the dividend?",
    hi: "किस भाग में भागफल की घात भाज्य जितनी है?",
  },
  sameQR: {
    en: "In which division do the quotient and the remainder have the same degree?",
    hi: "किस भाग में भागफल और शेषफल की घात बराबर है?",
  },
  zeroR: {
    en: "In which division does the remainder have degree 0?",
    hi: "किस भाग में शेषफल की घात 0 है?",
  },
};

/** NCERT Ex 2.3 Q5, as a choice between three worked divisions. */
export const divisionDegrees = family({
  level: Level.Medium,
  tests: [Concept.DividingPolynomials],
  params: z.object({ which: z.enum(["samePQ", "sameQR", "zeroR"]) }).strict(),
  build: ({ which }, b) => {
    const options = (Object.keys(divisions) as Which[]).map((k) =>
      k === which
        ? { id: "right", label: t(`$${divisions[k].tex}$`, `$${divisions[k].tex}$`) }
        : {
            id: k,
            label: t(`$${divisions[k].tex}$`, `$${divisions[k].tex}$`),
            feedback: t(divisions[k].en, divisions[k].hi),
          },
    );
    const ask = choiceQuestion(b, {
      prompt: t(asks[which].en, asks[which].hi),
      options: settle(options, which.length * 13),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
