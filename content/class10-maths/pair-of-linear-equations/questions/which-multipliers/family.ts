import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { linesOf, pairParams, pairTex, seedOf } from "../../kit";

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Elimination step 1: which multipliers make one variable's coefficients the same size? */
export const whichMultipliers = family({
  level: Level.Medium,
  tests: [Concept.EliminationMethod],
  params: pairParams.extend({ remove: z.enum(["x", "y"]) }).strict(),
  build: (p, bk) => {
    const [l1, l2] = linesOf(p);
    const c1 = Math.abs(p.remove === "x" ? p.a1 : p.b1);
    const c2 = Math.abs(p.remove === "x" ? p.a2 : p.b2);
    const g = gcd(c1, c2);
    const m1 = c2 / g;
    const m2 = c1 / g;
    const size = (m1 * c1).toString();
    const say = (a: number, b: number) =>
      t(`(1) by ${a} and (2) by ${b}`, `(1) को ${a} से और (2) को ${b} से`);
    const why = t(
      `You want both ${p.remove}-coefficients the same size, ${size}: multiply ${c1} by ${m1} and ${c2} by ${m2}.`,
      `दोनों ${p.remove} गुणांक एक ही आकार, ${size}, के चाहिए: ${c1} को ${m1} से और ${c2} को ${m2} से गुणा करो।`,
    );

    const options = distinctOptions({ id: "right", label: say(m1, m2) }, [
      { id: "swap", label: say(m2, m1), feedback: why },
      { id: "same", label: say(c1, c2), feedback: why },
    ]);
    const pair = pairTex(l1, l2);
    const ask = choiceQuestion(bk, {
      prompt: t(
        `To remove $${p.remove}$ from (1) and (2), ${pair.en}, multiply…`,
        `(1) और (2), ${pair.hi}, से $${p.remove}$ हटाने के लिए गुणा करो…`,
      ),
      options: settle(options, seedOf(p) + (p.remove === "x" ? 4 : 5)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
