import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/**
 * Prime or composite: a product plus one of its own factors, like 7 × 11 × 13 + 13. Take the shared
 * factor out: 13 × (7 × 11 + 1). The wrong options: "prime", and a factor of the product that doesn't
 * divide the number added.
 */
export const isItComposite = family({
  level: Level.Medium,
  tests: [Concept.FundamentalTheorem],
  params: z
    .object({
      /** The product's factors, comma separated, in the order written: "7,11,13". */
      factors: z.string().regex(/^\d+(,\d+)+$/),
      /** The number added: one of the factors. */
      add: z.number().int().min(2),
    })
    .strict(),
  build: ({ factors, add }, b) => {
    const fs = factors.split(",").map(Number);
    if (!fs.includes(add)) throw new Error(`${add} must be one of the factors ${factors}`);
    const product = fs.reduce((p, f) => p * f, 1);
    const rest = product / add;
    const written = `${fs.join(r` \times `)} + ${add}`;
    const decoy = Math.max(...fs.filter((f) => f > 1 && add % f !== 0));
    const options: Option[] = [
      {
        id: "right",
        label: t(`Composite: ${add} is a factor`, `भाज्य: ${add} एक गुणनखंड है`),
      },
      {
        id: "prime",
        label: t(
          `Prime: adding ${add} leaves no common factor`,
          `अभाज्य: ${add} जोड़ने से कोई साझा गुणनखंड नहीं बचता`,
        ),
        feedback: t(
          r`Both terms have a ${add}: $${written} = ${add} \times (${rest} + 1) = ${add} \times ${rest + 1}$.`,
          r`दोनों पदों में ${add} है: $${written} = ${add} \times (${rest} + 1) = ${add} \times ${rest + 1}$।`,
        ),
      },
      {
        id: "decoy",
        label: t(`Composite: ${decoy} is a factor`, `भाज्य: ${decoy} एक गुणनखंड है`),
        feedback: t(
          `${decoy} divides the product but not the ${add} added on. Look for a factor both terms share.`,
          `${decoy} गुणनफल को विभाजित करता है पर जोड़े गए ${add} को नहीं। दोनों पदों में साझा गुणनखंड ढूँढो।`,
        ),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(r`Is $${written}$ prime or composite?`, r`$${written}$ अभाज्य है या भाज्य?`),
      options: settle(options, product % 9973),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
