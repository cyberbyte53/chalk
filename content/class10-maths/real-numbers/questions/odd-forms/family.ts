import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choice } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** "$bq$, $bq + 1$, …" for the given remainders: each form its own bit of maths, so a long list wraps. */
const forms = (divisor: number, rems: readonly number[]) =>
  rems.map((k) => (k === 0 ? `$${divisor}q$` : `$${divisor}q + ${k}$`)).join(", ");

/**
 * "Any positive odd integer is of the form …" (NCERT Examples 3 and 4, Ex 1.1 Q2): divide by an even
 * b; the even remainders give even numbers, so an odd one is left with the odd remainders.
 */
export const oddForms = family({
  level: Level.Medium,
  tests: [Concept.DivisionLemma],
  params: z.object({ divisor: z.number().int().min(2).max(10).multipleOf(2) }).strict(),
  build: ({ divisor }, b) => {
    const all = Array.from({ length: divisor }, (_, k) => k);
    const odd = all.filter((k) => k % 2 === 1);
    const even = all.filter((k) => k % 2 === 0);
    const evenShown = even.map((k) => (k === 0 ? `${divisor}q` : `${divisor}q + ${k}`));
    const why = t(
      r`Divide by ${divisor}: the remainder is one of ${all.join(", ")}. Forms with an even remainder, like $${evenShown.at(-1)}$, are even, since $${divisor}q$ is even.`,
      r`${divisor} से भाग दो: शेषफल ${all.join(", ")} में से एक है। सम शेषफल वाले रूप, जैसे $${evenShown.at(-1)}$, सम हैं, क्योंकि $${divisor}q$ सम है।`,
    );
    const options: Option[] = [
      {
        id: "even",
        label: t(forms(divisor, even), forms(divisor, even)),
        feedback: t(`These are the even ones. ${why.en}`, `ये सम वाले हैं। ${why.hi}`),
      },
    ];
    if (divisor > 2) {
      options.push({
        id: "all",
        label: t(forms(divisor, all), forms(divisor, all)),
        feedback: t(
          `Every integer is one of these, but some are even. ${why.en}`,
          `हर पूर्णांक इनमें से एक है, पर कुछ सम हैं। ${why.hi}`,
        ),
      });
    }
    const ask = choice(b, {
      prompt: t(
        r`Any positive odd integer is of exactly these forms… (for some integer $q$)`,
        r`कोई भी धनात्मक विषम पूर्णांक ठीक-ठीक किन रूपों का होता है? (किसी पूर्णांक $q$ के लिए)`,
      ),
      right: t(forms(divisor, odd), forms(divisor, odd)),
      wrong: Object.fromEntries(options.map(({ id, ...o }) => [id, o])),
    });
    return [ask];
  },
});
