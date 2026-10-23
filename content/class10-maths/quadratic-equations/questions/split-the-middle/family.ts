import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { factorPairs, quadTex } from "@chalk/prop-quadratics";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const pairTex = (p: number, q: number) => `$${p}$ and $${q}$`;
const pairTexHi = (p: number, q: number) => `$${p}$ और $${q}$`;

/** Which two numbers split the middle term of ax² + bx + c (multiply to ac, add to b)? */
export const splitTheMiddle = family({
  level: Level.Medium,
  tests: [Concept.SolvingByFactorising],
  params: z.object({ a: z.number().int(), b: z.number().int(), c: z.number().int() }).strict(),
  build: ({ a, b: mid, c }, b) => {
    const ac = a * c;
    const pairs = factorPairs(ac);
    const right = pairs.find(([p, q]) => p + q === mid);
    if (right === undefined) throw new Error(`no whole-number split for ${a}, ${mid}, ${c}`);
    const [p, q] = right;
    const others = pairs.filter(([x, y]) => x + y !== mid && x + y !== -mid).slice(0, 1);
    const options: Option[] = [
      { id: "right", label: t(pairTex(p, q), pairTexHi(p, q)) },
      {
        id: "flip",
        label: t(pairTex(-p, -q), pairTexHi(-p, -q)),
        feedback: t(
          `These multiply to ${ac} but add to ${-mid}. You need the sum to be ${mid}.`,
          `इनका गुणनफल ${ac} है पर योग ${-mid}। योग ${mid} चाहिए।`,
        ),
      },
      ...others.map(([x, y]) => ({
        id: "other",
        label: t(pairTex(x, y), pairTexHi(x, y)),
        feedback: t(
          `These multiply to ${ac}, but they add to ${x + y}, not ${mid}.`,
          `इनका गुणनफल ${ac} है, पर योग ${x + y} है, ${mid} नहीं।`,
        ),
      })),
    ];
    const eq = quadTex(a, mid, c);
    const ask = choiceQuestion(b, {
      prompt: t(
        `To factorise $${eq}$, which two numbers split the middle term? (They multiply to $a \\times c = ${ac}$ and add to $b = ${mid}$.)`,
        `$${eq}$ का गुणनखंड करने के लिए कौन-सी दो संख्याएँ मध्य पद तोड़ती हैं? (उनका गुणनफल $a \\times c = ${ac}$ और योग $b = ${mid}$ है।)`,
      ),
      options: settle(options, Math.abs(ac) + 3 * Math.abs(mid) + 1),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
