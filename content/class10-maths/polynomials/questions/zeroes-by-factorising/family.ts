import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import {
  choiceQuestion,
  distinctOptions,
  parsePoly,
  settle,
  zeroesLabel,
} from "@chalk/content-source/patterns";
import { polyTex, zeroesWithRepeats } from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Find the zeroes of a quadratic (NCERT Ex 2.2 Q1), written the way the book writes it. */
export const zeroesByFactorising = family({
  level: Level.Medium,
  tests: [Concept.ZeroesFromFactors],
  params: z
    .object({
      coefficients: z.string(),
      variable: z.string().regex(/^[a-z]$/),
      /** The polynomial as the book prints it (maybe not in standard form), in LaTeX. */
      written: z.string(),
    })
    .strict(),
  build: ({ coefficients, variable, written }, b) => {
    const p = parsePoly(coefficients);
    const zeroes = zeroesWithRepeats(p);
    if (zeroes.length !== 2) throw new Error(`${written} needs two real zeroes`);
    const [z1 = 0, z2 = 0] = zeroes;
    const isDouble = z1 === z2;
    const v = variable;
    const ask = choiceQuestion(b, {
      prompt: t(`What are the zeroes of $${written}$?`, `$${written}$ के शून्यक क्या हैं?`),
      options: settle(
        distinctOptions({ id: "right", label: zeroesLabel(isDouble ? [z1, z1] : [z1, z2]) }, [
          // (For a repeated zero, "1/2" alone is fair too: the book writes 1/2 and 1/2.)
          {
            id: "signs",
            label: zeroesLabel([-z1, -z2]),
            feedback: t(
              `A factor $(${v} - k)$ is 0 when $${v} = k$, so each zero has the opposite sign to the number in its factor.`,
              `गुणनखंड $(${v} - k)$ तब 0 होता है जब $${v} = k$, इसलिए हर शून्यक का चिह्न उसके गुणनखंड की संख्या से उल्टा होता है।`,
            ),
          },
          {
            id: "scaled",
            label: zeroesLabel([z1 * (p[0] ?? 1), z2 * (p[0] ?? 1)].map((x) => (x === 0 ? 0 : x))),
            feedback: t(
              `Write it as $${polyTex(p, v)}$ and factorise fully: a factor like $2${v} - 3$ is 0 at $${v} = \\frac{3}{2}$.`,
              `इसे $${polyTex(p, v)}$ लिखकर पूरा गुणनखंड करो: $2${v} - 3$ जैसा गुणनखंड $${v} = \\frac{3}{2}$ पर 0 होता है।`,
            ),
          },
          // x² = 3 means x = ±√3, not ±3.
          ...(zeroes.every(
            (x) => !Number.isInteger(x) && Number.isInteger(Math.round(x * x * 1e9) / 1e9),
          )
            ? [
                {
                  id: "squares",
                  label: zeroesLabel(zeroes.map((x) => Math.sign(x) * Math.round(x * x))),
                  feedback: t(
                    `$${v}^2 = k$ means $${v} = \\pm\\sqrt{k}$: take the square root.`,
                    `$${v}^2 = k$ का अर्थ है $${v} = \\pm\\sqrt{k}$: वर्गमूल लो।`,
                  ),
                },
              ]
            : []),
          ...(isDouble
            ? []
            : [
                {
                  id: "one",
                  label: zeroesLabel([z2]),
                  feedback: t(
                    "A quadratic with two different factors has two zeroes. Set each factor to 0.",
                    "दो अलग गुणनखंडों वाले द्विघात बहुपद के दो शून्यक होते हैं। हर गुणनखंड को 0 रखो।",
                  ),
                },
              ]),
        ]),
        p.reduce((s, c) => s + Math.abs(c) * 3, 1),
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
