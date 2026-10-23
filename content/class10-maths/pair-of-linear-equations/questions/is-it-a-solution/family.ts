import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { eqTex, lineOf } from "../../kit";

/** Does (x, y) satisfy a x + b y = k? Substitute and compare the two sides (NCERT 3.2). */
export const isItASolution = family({
  level: Level.Easy,
  tests: [Concept.PairOfEquations],
  params: z
    .object({
      a: z.number().int(),
      b: z.number().int(),
      k: z.number().int(),
      x: z.number(),
      y: z.number(),
    })
    .strict(),
  build: ({ a, b, k, x, y }, bk) => {
    const line = lineOf({ a, b, k });
    const lhs = a * x + b * y;
    const isOn = Math.abs(lhs - k) < 1e-9;
    const working = `$${a}(${x}) ${b < 0 ? "-" : "+"} ${Math.abs(b)}(${y}) = ${lhs}$`;
    const yes = {
      id: "yes",
      label: t("Yes, it is a solution", "हाँ, यह हल है"),
      ...(isOn
        ? {}
        : {
            feedback: t(
              `Substitute: ${working}, which is not ${k}.`,
              `मान रखो: ${working}, जो ${k} नहीं है।`,
            ),
          }),
    };
    const no = {
      id: "no",
      label: t("No, it is not", "नहीं, यह हल नहीं है"),
      ...(isOn
        ? {
            feedback: t(
              `Substitute: ${working}, which is ${k}. Both sides are equal.`,
              `मान रखो: ${working}, जो ${k} ही है। दोनों पक्ष बराबर हैं।`,
            ),
          }
        : {}),
    };
    const ask = choiceQuestion(bk, {
      prompt: t(
        `Is $x = ${x}$, $y = ${y}$ a solution of $${eqTex(line)}$?`,
        `क्या $x = ${x}$, $y = ${y}$ समीकरण $${eqTex(line)}$ का हल है?`,
      ),
      options: settle([yes, no], Math.round(a * 7 + b * 13 + x * 3 + y)),
      answer: isOn ? "yes" : "no",
    });
    return column([ask, space()]);
  },
});
