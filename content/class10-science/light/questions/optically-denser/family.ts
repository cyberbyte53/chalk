import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** NCERT Table 10.3. */
const media = {
  air: { n: 1.0003, en: "air", hi: "वायु" },
  ice: { n: 1.31, en: "ice", hi: "बर्फ़" },
  water: { n: 1.33, en: "water", hi: "पानी" },
  kerosene: { n: 1.44, en: "kerosene", hi: "किरोसिन" },
  turpentine: { n: 1.47, en: "turpentine oil", hi: "तारपीन का तेल" },
  benzene: { n: 1.5, en: "benzene", hi: "बेंज़ीन" },
  crownGlass: { n: 1.52, en: "crown glass", hi: "क्राउन काँच" },
  diamond: { n: 2.42, en: "diamond", hi: "हीरा" },
} as const;
type Name = keyof typeof media;
const names = Object.keys(media) as [Name, ...Name[]];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Of two media, which is optically denser, or where light is faster: by the refractive index alone. */
export const opticallyDenser = family({
  level: Level.Easy,
  tests: [Concept.RefractiveIndex],
  params: z
    .object({ a: z.enum(names), b: z.enum(names), ask: z.enum(["denser", "faster"]) })
    .strict(),
  build: ({ a, b: other, ask }, b) => {
    const p = media[a];
    const q = media[other];
    if (p.n === q.n) throw new Error("optically-denser: the two media must differ");
    const denser = p.n > q.n ? p : q;
    const rarer = p.n > q.n ? q : p;
    const right = ask === "denser" ? denser : rarer;
    const wrongOne = ask === "denser" ? rarer : denser;
    const mass =
      (a === "kerosene" && other === "water") || (a === "water" && other === "kerosene")
        ? t(
            " Kerosene floats on water, but optical density isn't mass density.",
            " किरोसिन पानी पर तैरता है, पर प्रकाशिक घनत्व द्रव्यमान घनत्व नहीं है।",
          )
        : t("", "");
    const options: Option[] = [
      { id: "right", label: t(cap(right.en), right.hi) },
      {
        id: "wrong",
        label: t(cap(wrongOne.en), wrongOne.hi),
        feedback: t(
          `${cap(denser.en)} has the larger refractive index, ${denser.n}, so it is optically denser and light is slower in it.${mass.en}`,
          `${denser.hi} का अपवर्तनांक बड़ा, ${denser.n}, है, इसलिए वह प्रकाशिक रूप से सघन है और उसमें प्रकाश धीमा है।${mass.hi}`,
        ),
      },
      {
        id: "same",
        label: t("Neither: they are the same", "कोई नहीं: दोनों बराबर हैं"),
        feedback: t(
          `Their refractive indices differ: ${p.en} ${p.n}, ${q.en} ${q.n}.`,
          `उनके अपवर्तनांक अलग हैं: ${p.hi} ${p.n}, ${q.hi} ${q.n}।`,
        ),
      },
    ];
    const prompt =
      ask === "denser"
        ? t(
            `Using Table 10.3, which is optically denser: ${p.en} (n = ${p.n}) or ${q.en} (n = ${q.n})?`,
            `तालिका 10.3 से, कौन प्रकाशिक रूप से सघन है: ${p.hi} (n = ${p.n}) या ${q.hi} (n = ${q.n})?`,
          )
        : t(
            `In which does light travel faster: ${p.en} (n = ${p.n}) or ${q.en} (n = ${q.n})?`,
            `किसमें प्रकाश तेज़ चलता है: ${p.hi} (n = ${p.n}) या ${q.hi} (n = ${q.n})?`,
          );
    const choice = choiceQuestion(b, {
      prompt,
      options: settle(options, a.length * 7 + other.length * 3 + ask.length),
      answer: "right",
    });
    return column([choice, space()]);
  },
});
