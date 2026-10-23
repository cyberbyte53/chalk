import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { Concept } from "../../concepts.gen";
import { linesOf, pairParams, pairTex, seedOf } from "../../kit";

/** The bottom under 1 in cross-multiplication, a₁b₂ − a₂b₁, and what it says when it is 0. */
export const crossBottom = family({
  level: Level.Easy,
  tests: [Concept.CrossMultiplication],
  params: pairParams,
  build: (p, bk) => {
    const [l1, l2] = linesOf(p);
    const right = p.a1 * p.b2 - p.a2 * p.b1;
    const working = `$(${p.a1})(${p.b2}) - (${p.a2})(${p.b1})$`;
    const why = t(`Work it out: ${working}.`, `निकालो: ${working}।`);
    const m = (n: number) => t(`$${n}$`, `$${n}$`);
    const options = distinctOptions({ id: "right", label: m(right) }, [
      { id: "plus", label: m(p.a1 * p.b2 + p.a2 * p.b1), feedback: why },
      { id: "flip", label: m(-right), feedback: why },
      { id: "wrong-pair", label: m(p.a1 * p.a2 - p.b1 * p.b2), feedback: why },
    ]);
    const pair = pairTex(l1, l2);
    const ask = choiceQuestion(bk, {
      prompt: t(
        `For ${pair.en}, what is $a_1b_2 - a_2b_1$?`,
        `${pair.hi} के लिए $a_1b_2 - a_2b_1$ क्या है?`,
      ),
      options: settle(options, seedOf(p) + 6),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
