import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, parsePoly, settle } from "@chalk/content-source/patterns";
import { divisionSteps, polyTex, termsOf, termsTex } from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Quotient and remainder (NCERT Ex 2.3 Q1, Examples 6 to 8), with the usual slips as options. */
export const divide = family({
  level: Level.Medium,
  tests: [Concept.DividingPolynomials],
  params: z.object({ dividend: z.string(), divisor: z.string() }).strict(),
  build: ({ dividend, divisor }, b) => {
    const p = parsePoly(dividend);
    const g = parsePoly(divisor);
    const steps = divisionSteps(p, g);
    const last = steps.at(-1);
    if (last === undefined) throw new Error("nothing to divide");
    const q = steps.map((s) => s.quotient);
    const r = last.remaining;
    const pair = (qt: string, rt: string) =>
      t(`$q = ${qt}$, $r = ${rt}$`, `$q = ${qt}$, $r = ${rt}$`);
    const right = pair(termsTex(q, "x"), termsTex(r, "x"));
    // A slip in the last subtraction: the remainder's constant term with the wrong sign (or off by 1).
    const slipped =
      r.length > 0
        ? r.map((term, i) =>
            i === r.length - 1 ? { ...term, coefficient: term.coefficient.neg() } : term,
          )
        : termsOf([1]);
    const before = steps.at(-2);
    const ask = choiceQuestion(b, {
      prompt: t(
        `Divide $${polyTex(p)}$ by $${polyTex(g)}$. What are the quotient and the remainder?`,
        `$${polyTex(p)}$ को $${polyTex(g)}$ से भाग दो। भागफल और शेषफल क्या हैं?`,
      ),
      options: settle(
        distinctOptions({ id: "right", label: right }, [
          {
            id: "slip",
            label: pair(termsTex(q, "x"), termsTex(slipped, "x")),
            feedback: t(
              "Check the last subtraction: taking away a negative term adds it.",
              "आख़िरी घटाव जाँचो: ऋणात्मक पद घटाने पर वह जुड़ जाता है।",
            ),
          },
          ...(before === undefined
            ? []
            : [
                {
                  id: "early",
                  label: pair(termsTex(q.slice(0, -1), "x"), termsTex(before.remaining, "x")),
                  feedback: t(
                    "What's left still has a degree at least the divisor's: divide once more.",
                    "बचे हुए की घात अभी भी भाजक की घात जितनी या ज़्यादा है: एक बार और भाग दो।",
                  ),
                },
              ]),
          {
            id: "zero",
            label: pair(termsTex(q, "x"), "0"),
            feedback: t(
              "Work out what's left at the end: here it isn't 0, so the divisor is not a factor.",
              "अंत में बचा हुआ निकालो: यहाँ वह 0 नहीं है, इसलिए भाजक गुणनखंड नहीं है।",
            ),
          },
        ]),
        p.length * 19 + g.length,
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
