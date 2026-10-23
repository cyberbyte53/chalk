import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, parsePoly, settle } from "@chalk/content-source/patterns";
import { polyTex, times } from "@chalk/prop-polynomials";
import nerdamer from "nerdamer";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Coefficients of a nerdamer expression in x, highest power first. */
function coefficientsOf(expression: string): number[] {
  const low = nerdamer(`coeffs(${expression}, x)`)
    .toString()
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map(Number);
  return low.reverse();
}

const asNerdamer = (p: readonly number[]) =>
  p.map((c, i) => `(${c})*x^${p.length - 1 - i}`).join("+");

/** Find g(x) from p, q and r (NCERT Ex 2.3 Q4): g = (p − r) ÷ q, by nerdamer's exact division. */
export const findTheDivisor = family({
  level: Level.Hard,
  tests: [Concept.DividingPolynomials],
  params: z.object({ dividend: z.string(), quotient: z.string(), remainder: z.string() }).strict(),
  build: ({ dividend, quotient, remainder }, b) => {
    const p = parsePoly(dividend);
    const q = parsePoly(quotient);
    const r = parsePoly(remainder);
    const [g, left] = nerdamer(`div(${asNerdamer(p)} - (${asNerdamer(r)}), ${asNerdamer(q)})`)
      .toString()
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((part) => part.trim());
    if (g === undefined || left !== "0") throw new Error("p − r must divide exactly by q");
    const divisor = coefficientsOf(g);
    // Check: divisor × quotient + remainder gives the dividend back.
    const back = times(divisor, q);
    const pad = (x: readonly number[]) => [...new Array(p.length - x.length).fill(0), ...x];
    if (pad(back).some((c, i) => Math.abs(c + (pad(r)[i] ?? 0) - (p[i] ?? 0)) > 1e-9)) {
      throw new Error("divisor × quotient + remainder isn't the dividend");
    }
    const [wrongPlus] = nerdamer(`div(${asNerdamer(p)} + (${asNerdamer(r)}), ${asNerdamer(q)})`)
      .toString()
      .replace(/^\[|\]$/g, "")
      .split(",");
    const show = (x: readonly number[]) => t(`$${polyTex(x)}$`, `$${polyTex(x)}$`);
    const ask = choiceQuestion(b, {
      prompt: t(
        `Dividing $${polyTex(p)}$ by $g(x)$ gives quotient $${polyTex(q)}$ and remainder $${polyTex(r)}$. What is $g(x)$?`,
        `$${polyTex(p)}$ को $g(x)$ से भाग देने पर भागफल $${polyTex(q)}$ और शेषफल $${polyTex(r)}$ मिलते हैं। $g(x)$ क्या है?`,
      ),
      options: settle(
        distinctOptions({ id: "right", label: show(divisor) }, [
          {
            id: "plus",
            label: show(coefficientsOf(wrongPlus ?? "0")),
            feedback: t(
              "Take the remainder **away** first: $p(x) - r(x) = g(x) \\times q(x)$, then divide by $q(x)$.",
              "पहले शेषफल **घटाओ**: $p(x) - r(x) = g(x) \\times q(x)$, फिर $q(x)$ से भाग दो।",
            ),
          },
          {
            id: "times",
            label: show(times(q, q)),
            feedback: t(
              "$g(x) \\times q(x) = p(x) - r(x)$, so divide by $q(x)$; don't multiply.",
              "$g(x) \\times q(x) = p(x) - r(x)$, इसलिए $q(x)$ से भाग दो; गुणा मत करो।",
            ),
          },
        ]),
        p.length * 7 + q.length,
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
