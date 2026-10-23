import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import {
  choiceQuestion,
  distinctOptions,
  exprTex,
  numberOf,
  parsePoly,
  settle,
  zeroesLabel,
} from "@chalk/content-source/patterns";
import { niceNumber, polyTex, zeroesWithRepeats } from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** All the other zeroes, given some (NCERT 2.4, Example 9, Ex 2.3 Q3, Ex 2.4 Q4). */
export const otherZeroes = family({
  level: Level.Hard,
  tests: [Concept.FindingOtherZeroes],
  params: z
    .object({
      coefficients: z.string(),
      /** The zeroes given, in nerdamer's syntax: "sqrt(2), -sqrt(2)". */
      known: z.string(),
    })
    .strict(),
  build: ({ coefficients, known }, b) => {
    const p = parsePoly(coefficients);
    const given = known.split(",").map((k) => numberOf(k.trim()));
    const all = zeroesWithRepeats(p);
    const rest = [...all];
    for (const g of given) {
      const i = rest.findIndex((x) => Math.abs(x - g) < 1e-7);
      if (i === -1) throw new Error(`${known}: ${g} is not a zero of ${coefficients}`);
      rest.splice(i, 1);
    }
    if (rest.length === 0) throw new Error("no zeroes left to find");
    const givenTex = known.split(",").map((k) => `$${exprTex(k.trim())}$`);
    const givenEn =
      givenTex.length === 1
        ? givenTex[0]
        : `${givenTex.slice(0, -1).join(", ")} and ${givenTex.at(-1)}`;
    const givenHi =
      givenTex.length === 1
        ? givenTex[0]
        : `${givenTex.slice(0, -1).join(", ")} और ${givenTex.at(-1)}`;
    const ask = choiceQuestion(b, {
      prompt: t(
        `${givenEn} ${givenTex.length === 1 ? "is a zero" : "are zeroes"} of $${polyTex(p)}$. What are the other zeroes?`,
        `${givenHi}, $${polyTex(p)}$ के शून्यक हैं। बाक़ी शून्यक क्या हैं?`,
      ),
      options: settle(
        distinctOptions({ id: "right", label: zeroesLabel(rest) }, [
          {
            id: "signs",
            label: zeroesLabel(rest.map((x) => (x === 0 ? 0 : -x))),
            feedback: t(
              "Factorise the quotient and set each factor to 0: $x + k = 0$ gives $x = -k$.",
              "भागफल का गुणनखंड करो और हर गुणनखंड को 0 रखो: $x + k = 0$ से $x = -k$।",
            ),
          },
          {
            id: "given",
            label: zeroesLabel([...rest.slice(0, -1), given[0] ?? 0]),
            feedback: t(
              `${givenEn} ${givenTex.length === 1 ? "is" : "are"} already known. Divide by ${givenTex.length === 1 ? "its factor" : "their factors' product"} and find the zeroes of the quotient.`,
              `${givenHi} पहले से ज्ञात ${givenTex.length === 1 ? "है" : "हैं"}। उनके गुणनखंड से भाग दो और भागफल के शून्यक निकालो।`,
            ),
          },
          {
            id: "double",
            label: zeroesLabel(
              rest.length > 1 ? [rest[0] ?? 0, -(rest[0] ?? 0)] : [(rest[0] ?? 0) * 2],
            ),
            feedback: t(
              "Check by putting it back in: a zero $k$ makes $p(k) = 0$.",
              "वापस रखकर जाँचो: शून्यक $k$ के लिए $p(k) = 0$ होता है।",
            ),
          },
        ]),
        p.length * 23 + Math.round(Math.abs(niceNumber(rest[0] ?? 1).value) * 10),
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
