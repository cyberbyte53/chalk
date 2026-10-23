import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Genotype = { TT: "TT", Tt: "Tt", tt: "tt" } as const;
type Genotype = (typeof Genotype)[keyof typeof Genotype];

/** The four boxes of the Punnett square, as counts of TT, Tt, tt. */
function boxes(a: Genotype, b: Genotype): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  for (const x of a)
    for (const y of b) {
      const big = (x === "T" ? 1 : 0) + (y === "T" ? 1 : 0);
      out[2 - big] = (out[2 - big] ?? 0) + 1;
    }
  return out;
}

/** A ratio from counts, dropping zeros and dividing by the common factor. */
function ratio(counts: number[]): string {
  const xs = counts.filter((c) => c > 0);
  const g = (p: number, q: number): number => (q === 0 ? p : g(q, p % q));
  const d = xs.reduce((p, q) => g(p, q));
  return xs.map((x) => x / d).join(" : ");
}

/** A one-trait cross (height): the tall : short ratio of the children. */
export const crossRatio = family({
  level: Level.Medium,
  tests: [Concept.MendelOneTrait],
  params: z.object({ a: z.nativeEnum(Genotype), b: z.nativeEnum(Genotype) }).strict(),
  build: ({ a, b: p2 }, b) => {
    const [tt2, tt1, tt0] = boxes(a, p2);
    const tall = tt2 + tt1;
    const short = tt0;
    const right =
      short === 0
        ? t("All tall", "सब लंबे")
        : tall === 0
          ? t("All short", "सब बौने")
          : t(`${ratio([tall, short])}`, `${ratio([tall, short])}`);
    const candidates: { id: string; en: string; hi: string; fb: { en: string; hi: string } }[] = [
      {
        id: "all",
        en: "All tall",
        hi: "सब लंबे",
        fb: {
          en: "Draw the square: a child is short only when it gets t from both parents. Count those boxes.",
          hi: "वर्ग बनाओ: बच्चा तभी बौना है जब उसे दोनों जनकों से t मिले। ऐसे खाने गिनो।",
        },
      },
      {
        id: "three",
        en: "3 : 1",
        hi: "3 : 1",
        fb: {
          en: "3 : 1 comes only from Tt × Tt. Write each parent's germ cells and fill the four boxes.",
          hi: "3 : 1 केवल Tt × Tt से आता है। हर जनक की जनन कोशिकाएँ लिखकर चारों खाने भरो।",
        },
      },
      {
        id: "one",
        en: "1 : 1",
        hi: "1 : 1",
        fb: {
          en: "1 : 1 comes from Tt × tt: half the boxes get a T. Check which parents you have.",
          hi: "1 : 1 Tt × tt से आता है: आधे खानों को T मिलता है। देखो तुम्हारे जनक कौन हैं।",
        },
      },
      {
        id: "short",
        en: "All short",
        hi: "सब बौने",
        fb: {
          en: "Every child needs two t's to be short. Does each parent always give t?",
          hi: "बौना होने के लिए हर बच्चे को दो t चाहिए। क्या हर जनक हमेशा t देता है?",
        },
      },
    ];
    const options: Option[] = [{ id: "right", label: right }];
    for (const c of candidates) {
      if (options.length >= 3) break;
      if (c.en === right.en) continue;
      options.push({ id: c.id, label: t(c.en, c.hi), feedback: c.fb });
    }
    const ask = choiceQuestion(b, {
      prompt: t(
        `A ${a} pea plant is crossed with a ${p2} plant (T: tall, dominant; t: short). Tall : short among the children is…`,
        `एक ${a} मटर के पौधे का ${p2} पौधे से संकरण होता है (T: लंबा, प्रभावी; t: बौना)। बच्चों में लंबे : बौने है…`,
      ),
      options: settle(options, a.length * 11 + p2.charCodeAt(1)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
