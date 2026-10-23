import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { gcd } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Given HCF(a, b), find LCM(a, b) = ab / HCF (NCERT Ex 1.2 Q4). */
export const lcmFromHcf = family({
  level: Level.Medium,
  tests: [Concept.HcfAndLcm],
  params: z.object({ a: z.number().int().min(2), b: z.number().int().min(2) }).strict(),
  build: ({ a, b: c }, b) => {
    const h = gcd(a, c);
    if (h === 1) throw new Error("pick numbers with an HCF bigger than 1");
    const l = (a * c) / h;
    const options: Option[] = [
      { id: "right", label: t(`${l}`, `${l}`) },
      {
        id: "product",
        label: t(`${a * c}`, `${a * c}`),
        feedback: t(
          r`That is $a \times b$ itself. $\text{HCF} \times \text{LCM} = a \times b$, so divide it by the HCF.`,
          r`यह स्वयं $a \times b$ है। $\text{HCF} \times \text{LCM} = a \times b$, इसलिए इसे HCF से भाग दो।`,
        ),
      },
      {
        id: "twice",
        label: t(`${l / h}`, `${l / h}`),
        feedback: t(
          r`Divide $a \times b$ by the HCF once, not twice: $\frac{${a} \times ${c}}{${h}}$.`,
          r`$a \times b$ को HCF से एक बार भाग दो, दो बार नहीं: $\frac{${a} \times ${c}}{${h}}$।`,
        ),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        r`Given that $\text{HCF}(${a}, ${c}) = ${h}$, find $\text{LCM}(${a}, ${c})$.`,
        r`दिया है कि $\text{HCF}(${a}, ${c}) = ${h}$, तो $\text{LCM}(${a}, ${c})$ ज्ञात करो।`,
      ),
      options: settle(options, a + 3 * c),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
