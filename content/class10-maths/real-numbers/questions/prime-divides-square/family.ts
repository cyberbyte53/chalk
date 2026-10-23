import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, primesTex } from "@chalk/content-source/patterns";
import { bagOf, isPrime } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** "k divides a². Must k divide a?" Yes when no prime repeats in k; a prime square breaks it. */
export const primeDividesSquare = family({
  level: Level.Medium,
  tests: [Concept.RootTwoIrrational],
  params: z.object({ k: z.number().int().min(2).max(100) }).strict(),
  build: ({ k }, b) => {
    const bag = bagOf(k);
    const repeated = Object.keys(bag)
      .map(Number)
      .find((p) => (bag[p] ?? 0) >= 2);
    const must = repeated === undefined;
    // a counterexample: each prime of k, half as many times (rounded up), so k divides a² but not a
    const a = Object.keys(bag)
      .map(Number)
      .reduce((m, p) => m * p ** Math.ceil((bag[p] ?? 0) / 2), 1);
    const ask = choiceQuestion(b, {
      prompt: t(
        r`$a$ is a positive integer and ${k} divides $a^2$. Must ${k} divide $a$?`,
        r`$a$ एक धनात्मक पूर्णांक है और ${k}, $a^2$ को विभाजित करता है। क्या ${k} को $a$ को विभाजित करना ही होगा?`,
      ),
      options: [
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          ...(must
            ? {}
            : {
                feedback: t(
                  r`Try $a = ${a}$: ${k} divides $a^2 = ${a * a}$, but not ${a}. ${k} = $${primesTex(k)}$ is not prime, and its ${repeated}s can come one from each copy of $a$.`,
                  r`$a = ${a}$ लो: ${k}, $a^2 = ${a * a}$ को विभाजित करता है, पर ${a} को नहीं। ${k} = $${primesTex(k)}$ अभाज्य नहीं है, और इसके ${repeated}, $a$ की हर प्रति से एक-एक आ सकते हैं।`,
                ),
              }),
        },
        {
          id: "no",
          label: t("No", "नहीं"),
          ...(must
            ? {
                feedback: isPrime(k)
                  ? t(
                      r`${k} is prime: a prime in $a^2$'s bag came from $a$'s bag, so ${k} divides $a$.`,
                      r`${k} अभाज्य है: $a^2$ की थैली का अभाज्य, $a$ की थैली से ही आया, इसलिए ${k}, $a$ को विभाजित करता है।`,
                    )
                  : t(
                      r`$${k} = ${primesTex(k)}$: each of these primes divides $a^2$, so each divides $a$, and so does their product.`,
                      r`$${k} = ${primesTex(k)}$: इनमें से हर अभाज्य $a^2$ को विभाजित करता है, इसलिए $a$ को भी, और इसलिए इनका गुणनफल भी।`,
                    ),
              }
            : {}),
        },
      ],
      answer: must ? "yes" : "no",
    });
    return column([ask, space()]);
  },
});
