import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type OrderStep, orderQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Put the proof that √p is irrational in order (NCERT Theorem 1.4, Example 9, Ex 1.3 Q1). */
export const orderTheProof = family({
  level: Level.Medium,
  tests: [Concept.RootTwoIrrational],
  params: z.object({ p: z.number().int().min(2).max(13) }).strict(),
  build: ({ p }, b) => {
    const steps: OrderStep[] = [
      {
        id: "suppose",
        label: t(
          r`Suppose $\sqrt{${p}} = \frac{a}{b}$, with $a$ and $b$ having no common factor other than 1.`,
          r`मान लो $\sqrt{${p}} = \frac{a}{b}$, जहाँ $a$ और $b$ का 1 के अलावा कोई साझा गुणनखंड नहीं।`,
        ),
      },
      {
        id: "square",
        label: t(r`Squaring, $${p}b^2 = a^2$.`, r`वर्ग करने पर, $${p}b^2 = a^2$।`),
        hint: t(
          r`To square something, you first need $\sqrt{${p}} = \frac{a}{b}$.`,
          r`वर्ग करने के लिए पहले $\sqrt{${p}} = \frac{a}{b}$ चाहिए।`,
        ),
      },
      {
        id: "divA",
        label: t(
          r`So ${p} divides $a^2$. ${p} is prime, so ${p} divides $a$.`,
          r`तो ${p}, $a^2$ को विभाजित करता है। ${p} अभाज्य है, इसलिए ${p}, $a$ को भी।`,
        ),
        hint: t(
          r`Why would ${p} divide $a^2$? That comes from $${p}b^2 = a^2$.`,
          r`${p}, $a^2$ को क्यों विभाजित करेगा? यह $${p}b^2 = a^2$ से आता है।`,
        ),
      },
      {
        id: "sub",
        label: t(
          r`Write $a = ${p}c$: then $${p}b^2 = ${p * p}c^2$, so $b^2 = ${p}c^2$.`,
          r`$a = ${p}c$ लिखो: तब $${p}b^2 = ${p * p}c^2$, इसलिए $b^2 = ${p}c^2$।`,
        ),
        hint: t(
          r`You can only write $a = ${p}c$ once you know ${p} divides $a$.`,
          r`$a = ${p}c$ तभी लिख सकते हो जब पता हो कि ${p}, $a$ को विभाजित करता है।`,
        ),
      },
      {
        id: "divB",
        label: t(
          r`So ${p} divides $b^2$. ${p} is prime, so ${p} divides $b$.`,
          r`तो ${p}, $b^2$ को विभाजित करता है। ${p} अभाज्य है, इसलिए ${p}, $b$ को भी।`,
        ),
        hint: t(r`That needs $b^2 = ${p}c^2$ first.`, r`इसके लिए पहले $b^2 = ${p}c^2$ चाहिए।`),
      },
      {
        id: "clash",
        label: t(
          r`So ${p} divides both $a$ and $b$: a contradiction. So $\sqrt{${p}}$ is irrational.`,
          r`तो ${p}, $a$ और $b$ दोनों को विभाजित करता है: विरोधाभास। इसलिए $\sqrt{${p}}$ अपरिमेय है।`,
        ),
        hint: t(
          r`The contradiction comes last, once ${p} divides both $a$ and $b$.`,
          r`विरोधाभास अंत में आता है, जब ${p}, $a$ और $b$ दोनों को विभाजित करे।`,
        ),
      },
    ];
    const answer = steps.map((s) => s.id);
    // Shuffled the same way every build, and never already in order.
    let shown = settle(answer, p * 101);
    if (shown.every((id, i) => id === answer[i])) shown = [...answer].reverse();
    const ask = orderQuestion(b, {
      prompt: t(
        r`Put the proof that $\sqrt{${p}}$ is irrational in order.`,
        r`$\sqrt{${p}}$ अपरिमेय है, इसकी उपपत्ति क्रम में लगाओ।`,
      ),
      steps,
      shown,
      answers: [answer],
    });
    return column([ask, space()]);
  },
});
