import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { fracTex } from "@chalk/prop-linear-equations";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/**
 * The last step of an equation in disguise: from p = 1/(x − h) = top/bottom, back to x
 * (NCERT Examples 17 and 18, Exercise 3.6).
 */
export const goBack = family({
  level: Level.Medium,
  tests: [Concept.ReducibleToLinear],
  params: z
    .object({
      top: z.number().int().positive(),
      bottom: z.number().int().positive(),
      shift: z.number().int(),
    })
    .strict(),
  build: ({ top, bottom, shift }, bk) => {
    const inside = shift === 0 ? "x" : `x ${shift > 0 ? "-" : "+"} ${Math.abs(shift)}`;
    const p =
      top === bottom * Math.round(top / bottom) ? `${top / bottom}` : `\\tfrac{${top}}{${bottom}}`;
    const reciprocal = fracTex(bottom / top);
    const right = shift === 0 ? reciprocal : fracTex(bottom / top + shift);
    const why = t(
      `If $\\tfrac{1}{${inside}} = ${p}$, then $${inside} = ${reciprocal}$${shift === 0 ? "" : `, so $x = ${right}$`}.`,
      `यदि $\\tfrac{1}{${inside}} = ${p}$, तो $${inside} = ${reciprocal}$${shift === 0 ? "" : `, इसलिए $x = ${right}$`}।`,
    );
    const m = (s: string) => t(`$x = ${s}$`, `$x = ${s}$`);
    const options = distinctOptions({ id: "right", label: m(right) }, [
      { id: "same", label: m(p), feedback: why },
      ...(shift === 0 ? [] : [{ id: "stop", label: m(reciprocal), feedback: why }]),
      { id: "neg", label: m(`-${right}`), feedback: why },
    ]);
    const ask = choiceQuestion(bk, {
      prompt: t(
        `You set $p = \\tfrac{1}{${inside}}$ and solved the linear pair: $p = ${p}$. What is $x$?`,
        `तुमने $p = \\tfrac{1}{${inside}}$ रखकर रैखिक युग्म हल किया: $p = ${p}$। $x$ क्या है?`,
      ),
      options: settle(options, top * 7 + bottom * 3 + shift),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
