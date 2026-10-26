import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choice } from "@chalk/patterns";
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
    const under = (c ?? 1) * (c ?? 1) * n;
    const options: Option[] = isTimes
      ? [
          {
            id: "rational",
            label: t(
              r`Rational: ${c} is rational, so ${c} times anything is rational`,
              r`परिमेय: ${c} परिमेय है, तो ${c} गुणा कुछ भी परिमेय है`,
            ),
            feedback: t(
              r`Not anything: dividing by ${c} would then make $\sqrt{${n}} = \frac{x}{${c}}$ rational. A non-zero rational times an irrational is irrational.`,
              r`कुछ भी नहीं: तब ${c} से भाग देने पर $\sqrt{${n}} = \frac{x}{${c}}$ परिमेय हो जाता। शून्येतर परिमेय गुणा अपरिमेय, अपरिमेय होता है।`,
            ),
          },
          {
            id: "inside",
            label: t(
              r`Rational: $${shown} = \sqrt{${under}}$, and ${under} is an integer`,
              r`परिमेय: $${shown} = \sqrt{${under}}$, और ${under} पूर्णांक है`,
            ),
            feedback: t(
              r`The square root of an integer needn't be rational: $\sqrt{${n}}$ isn't. If $${shown} = x$, then $\sqrt{${n}} = \frac{x}{${c}}$ would be rational.`,
              r`किसी पूर्णांक का वर्गमूल परिमेय हो, ज़रूरी नहीं: $\sqrt{${n}}$ नहीं है। अगर $${shown} = x$, तो $\sqrt{${n}} = \frac{x}{${c}}$ परिमेय होता।`,
            ),
          },
        ]
      : [
          {
            id: "rational",
            label: t(
              r`Rational: it is written as a fraction, 1 over $\sqrt{${n}}$`,
              r`परिमेय: यह भिन्न के रूप में लिखा है, 1 बटा $\sqrt{${n}}$`,
            ),
            feedback: t(
              r`A fraction needs integers top and bottom, and $\sqrt{${n}}$ isn't one. If $${shown} = x$, then $\sqrt{${n}} = \frac{1}{x}$ would be rational.`,
              r`भिन्न के ऊपर-नीचे पूर्णांक चाहिए, और $\sqrt{${n}}$ पूर्णांक नहीं। अगर $${shown} = x$, तो $\sqrt{${n}} = \frac{1}{x}$ परिमेय होता।`,
            ),
          },
          {
            id: "rationalise",
            label: t(
              r`Rational: $${shown} = \frac{\sqrt{${n}}}{${n}}$, and ${n} is an integer`,
              r`परिमेय: $${shown} = \frac{\sqrt{${n}}}{${n}}$, और ${n} पूर्णांक है`,
            ),
            feedback: t(
              r`$\sqrt{${n}}$ is still on top: $\frac{\sqrt{${n}}}{${n}}$ is $\frac{1}{${n}}$ times $\sqrt{${n}}$, a non-zero rational times an irrational, so irrational.`,
              r`ऊपर अब भी $\sqrt{${n}}$ है: $\frac{\sqrt{${n}}}{${n}}$, $\frac{1}{${n}}$ गुणा $\sqrt{${n}}$ है, शून्येतर परिमेय गुणा अपरिमेय, तो अपरिमेय।`,
            ),
          },
        ];
    const ask = choice(b, {
      prompt: t(r`Is $${shown}$ rational or irrational?`, r`$${shown}$ परिमेय है या अपरिमेय?`),
      right: t(
        r`Irrational: if it were a rational $x$, $\sqrt{${n}} = ${back}$ would be too`,
        r`अपरिमेय: अगर यह परिमेय $x$ होता, तो $\sqrt{${n}} = ${back}$ भी होता`,
      ),
      wrong: Object.fromEntries(options.map(({ id, ...o }) => [id, o])),
    });
    return [ask];
  },
});
