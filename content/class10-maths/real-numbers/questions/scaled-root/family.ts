import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;
const Form = { Times: "times", Over: "over" } as const;

/** c√n or 1/√n: irrational, because if it were a rational x, √n would be rational too (NCERT Ex 1.3 Q3). */
export const scaledRoot = family({
  level: Level.Medium,
  tests: [Concept.RootTwoIrrational],
  params: z
    .object({
      form: z.nativeEnum(Form),
      c: z.number().int().min(2).max(12).optional(),
      n: z.number().int().min(2).max(13),
    })
    .strict(),
  build: ({ form, c, n }, b) => {
    const isTimes = form === Form.Times;
    if (isTimes && c === undefined) throw new Error("c√n needs c");
    const shown = isTimes ? r`${c}\sqrt{${n}}` : r`\frac{1}{\sqrt{${n}}}`;
    const back = isTimes ? r`\frac{x}{${c}}` : r`\frac{1}{x}`;
    const options: Option[] = [
      {
        id: "right",
        label: t(
          r`Irrational: if $${shown} = x$, then $\sqrt{${n}} = ${back}$ would be rational`,
          r`अपरिमेय: अगर $${shown} = x$, तो $\sqrt{${n}} = ${back}$ परिमेय होता`,
        ),
      },
      {
        id: "rational",
        label: isTimes
          ? t(r`Rational: ${c} is rational`, r`परिमेय: ${c} परिमेय है`)
          : t("Rational: it's a fraction", "परिमेय: यह एक भिन्न है"),
        feedback: isTimes
          ? t(
              r`A non-zero rational times an irrational is irrational: dividing by ${c} would make $\sqrt{${n}}$ rational.`,
              r`शून्येतर परिमेय गुणा अपरिमेय, अपरिमेय होता है: ${c} से भाग देने पर $\sqrt{${n}}$ परिमेय हो जाता।`,
            )
          : t(
              r`A fraction needs integers top and bottom. $\sqrt{${n}}$ isn't one: if $\frac{1}{\sqrt{${n}}} = x$, then $\sqrt{${n}} = \frac{1}{x}$.`,
              r`भिन्न के ऊपर-नीचे पूर्णांक चाहिए। $\sqrt{${n}}$ पूर्णांक नहीं: अगर $\frac{1}{\sqrt{${n}}} = x$, तो $\sqrt{${n}} = \frac{1}{x}$।`,
            ),
      },
      {
        id: "cant",
        label: t("Can't tell without a calculator", "कैलकुलेटर के बिना नहीं कह सकते"),
        feedback: t(
          r`No decimals needed: suppose it equals a rational $x$ and solve for $\sqrt{${n}}$.`,
          r`दशमलव की ज़रूरत नहीं: मान लो यह किसी परिमेय $x$ के बराबर है और $\sqrt{${n}}$ निकालो।`,
        ),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(r`Is $${shown}$ rational or irrational?`, r`$${shown}$ परिमेय है या अपरिमेय?`),
      options: settle(options, n * 7 + (c ?? 1)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
