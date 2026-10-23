import { type BoardKit, column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { bagOf, euclidSteps } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** The question: find HCF(a, d) by Euclid's algorithm, with the usual wrong turns as options. */
export function euclidAsk(b: BoardKit, a: number, d: number) {
  const steps = euclidSteps(a, d);
  const first = steps[0];
  const hcf = steps.at(-1)?.b;
  if (first === undefined || hcf === undefined) throw new Error("no division to do");
  const big = Math.max(a, d);
  const small = Math.min(a, d);
  const wrong: Option[] = [];
  const used = new Set([hcf]);
  const offer = (value: number, feedback: { en: string; hi: string }) => {
    if (used.has(value) || value <= 0 || wrong.length >= 3) return;
    used.add(value);
    wrong.push({
      id: `n${value}`,
      label: t(`${value}`, `${value}`),
      feedback: t(feedback.en, feedback.hi),
    });
  };
  if (first.r > 0) {
    offer(first.r, {
      en: r`${first.r} is the first remainder, not the HCF. Keep dividing until the remainder is 0: $${first.a} = ${first.b} \times ${first.q} + ${first.r}$, then divide ${first.b} by ${first.r}.`,
      hi: r`${first.r} पहला शेषफल है, HCF नहीं। शेषफल 0 आने तक भाग देते रहो: $${first.a} = ${first.b} \times ${first.q} + ${first.r}$, फिर ${first.b} को ${first.r} से भाग दो।`,
    });
  }
  const smallestPrime = Number(Object.keys(bagOf(hcf))[0] ?? 1);
  if (hcf > 1) {
    offer(hcf / smallestPrime, {
      en: `${hcf / smallestPrime} divides both, but a bigger number does too. Finish Euclid's algorithm.`,
      hi: `${hcf / smallestPrime} दोनों को विभाजित करता है, पर एक बड़ी संख्या भी करती है। यूक्लिड एल्गोरिथ्म पूरा करो।`,
    });
  }
  if (small !== hcf) {
    offer(small, {
      en: r`${small} doesn't divide ${big}: $${big} = ${small} \times ${first.q} + ${first.r}$.`,
      hi: r`${small}, ${big} को विभाजित नहीं करता: $${big} = ${small} \times ${first.q} + ${first.r}$।`,
    });
  }
  offer(hcf * 2, {
    en: `${hcf * 2} doesn't divide both numbers. Check the last line of the algorithm.`,
    hi: `${hcf * 2} दोनों संख्याओं को विभाजित नहीं करता। एल्गोरिथ्म की आख़िरी पंक्ति जाँचो।`,
  });
  const ask = choiceQuestion(b, {
    prompt: t(
      r`Use Euclid's division algorithm to find $\text{HCF}(${a}, ${d})$.`,
      r`यूक्लिड विभाजन एल्गोरिथ्म से $\text{HCF}(${a}, ${d})$ ज्ञात करो।`,
    ),
    options: settle([{ id: "right", label: t(`${hcf}`, `${hcf}`) }, ...wrong], a + d),
    answer: "right",
  });
  return ask;
}

/** HCF by Euclid's algorithm (NCERT Ex 1.1 Q1). */
export const euclidHcf = family({
  level: Level.Medium,
  tests: [Concept.EuclidAlgorithm],
  params: z.object({ a: z.number().int().min(2), b: z.number().int().min(2) }).strict(),
  build: ({ a, b: d }, b) => column([euclidAsk(b, a, d), space()]),
});
