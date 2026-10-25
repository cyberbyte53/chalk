import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, bagTex, choice } from "@chalk/patterns";
import { bagOf, isPrime } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** n as a product of primes (NCERT Ex 1.2 Q1), against a factor that isn't prime and a wrong power. */
export const primeFactorisation = family({
  level: Level.Easy,
  tests: [Concept.FundamentalTheorem],
  params: z.object({ n: z.number().int().min(4) }).strict(),
  build: ({ n }, b) => {
    const bag = bagOf(n);
    const primes = Object.keys(bag).map(Number);
    const p = primes[0];
    if (p === undefined || isPrime(n)) throw new Error(`${n} should be composite`);
    const rest = n / p;
    const options: Option[] = [];
    if (!isPrime(rest)) {
      options.push({
        id: "notPrime",
        label: t(r`$${p} \times ${rest}$`, r`$${p} \times ${rest}$`),
        feedback: t(
          r`${rest} isn't prime: it is $${bagTex(bagOf(rest))}$. Keep splitting until every factor is prime.`,
          r`${rest} अभाज्य नहीं है: यह $${bagTex(bagOf(rest))}$ है। हर गुणनखंड अभाज्य होने तक तोड़ते रहो।`,
        ),
      });
    }
    const extra = { ...bag, [p]: (bag[p] ?? 0) + 1 };
    options.push({
      id: "power",
      label: t(`$${bagTex(extra)}$`, `$${bagTex(extra)}$`),
      feedback: t(
        r`Multiply it out: that is $${n * p}$, not ${n}. One ${p} too many.`,
        r`गुणा करके देखो: यह $${n * p}$ है, ${n} नहीं। एक ${p} ज़्यादा है।`,
      ),
    });
    const repeated = primes.find((q) => (bag[q] ?? 0) >= 2);
    if (repeated !== undefined) {
      const merged = { ...bag, [repeated]: (bag[repeated] ?? 0) - 2 };
      const label = r`${repeated * repeated} \times ${bagTex(merged)}`.replace(/ \\times 1$/, "");
      options.push({
        id: "square",
        label: t(`$${label}$`, `$${label}$`),
        feedback: t(
          r`${repeated * repeated} isn't prime: it is $${repeated}^2$.`,
          r`${repeated * repeated} अभाज्य नहीं है: यह $${repeated}^2$ है।`,
        ),
      });
    }
    const ask = choice(b, {
      prompt: t(
        `Express ${n} as a product of its prime factors.`,
        `${n} को उसके अभाज्य गुणनखंडों के गुणनफल के रूप में लिखो।`,
      ),
      right: t(`$${bagTex(bag)}$`, `$${bagTex(bag)}$`),
      wrong: Object.fromEntries(options.map(({ id, ...o }) => [id, o])),
    });
    return [ask];
  },
});
