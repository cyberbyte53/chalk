import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;
const Sign = { Plus: "+", Minus: "-" } as const;

/** Proving a ± c√n irrational: suppose it is a rational x; what is √n? */
export const isolateTheRoot = family({
  level: Level.Medium,
  tests: [Concept.RootTwoIrrational],
  params: z
    .object({
      a: z.number().int().min(1).max(20),
      sign: z.nativeEnum(Sign),
      c: z.number().int().min(1).max(9),
      n: z.number().int().min(2).max(13),
    })
    .strict(),
  build: ({ a, sign, c, n }, b) => {
    const root = c === 1 ? r`\sqrt{${n}}` : r`${c}\sqrt{${n}}`;
    const sum = sign === Sign.Plus ? `${a} + ${root}` : `${a} - ${root}`;
    const over = (top: string) => (c === 1 ? top : r`\frac{${top}}{${c}}`);
    const right = sign === Sign.Plus ? `x - ${a}` : `${a} - x`;
    const flipped = sign === Sign.Plus ? `${a} - x` : `x - ${a}`;
    const options: Option[] = [
      { id: "right", label: t(`$${over(right)}$`, `$${over(right)}$`) },
      {
        id: "flip",
        label: t(`$${over(flipped)}$`, `$${over(flipped)}$`),
        feedback: t(
          r`Check the sign when ${a} moves across: $${sign === Sign.Plus ? root : `-${root}`} = x - ${a}$.`,
          r`${a} को दूसरी तरफ़ ले जाते समय चिह्न जाँचो: $${sign === Sign.Plus ? root : `-${root}`} = x - ${a}$।`,
        ),
      },
    ];
    if (c > 1) {
      options.push({
        id: "notDivided",
        label: t(`$${right}$`, `$${right}$`),
        feedback: t(
          r`That is $${c}\sqrt{${n}}$. Divide by ${c} to get $\sqrt{${n}}$ alone.`,
          r`यह $${c}\sqrt{${n}}$ है। $\sqrt{${n}}$ अकेला पाने के लिए ${c} से भाग दो।`,
        ),
      });
    } else {
      options.push({
        id: "added",
        label: t(`$x + ${a}$`, `$x + ${a}$`),
        feedback: t(
          r`Moving ${a} across the equals sign changes its sign: take ${a} away from both sides.`,
          r`${a} को बराबर के चिह्न के पार ले जाने पर उसका चिह्न बदलता है: दोनों तरफ़ से ${a} घटाओ।`,
        ),
      });
    }
    const ask = choiceQuestion(b, {
      prompt: t(
        r`To prove $${sum}$ irrational, suppose $${sum} = x$, where $x$ is rational. Then $\sqrt{${n}} = $ ?`,
        r`$${sum}$ को अपरिमेय सिद्ध करने के लिए मान लो $${sum} = x$, जहाँ $x$ परिमेय है। तब $\sqrt{${n}} = $ ?`,
      ),
      options: settle(options, a * 13 + c * 7 + n),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
