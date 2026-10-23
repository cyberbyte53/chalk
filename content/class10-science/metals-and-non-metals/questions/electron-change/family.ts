import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

/** Table 3.3: electrons in shells, and the electrons each element loses (−) or gains (+). */
const ELEMENTS = {
  Na: { en: "sodium", hi: "सोडियम", shells: "2, 8, 1", change: -1 },
  Mg: { en: "magnesium", hi: "मैग्नीशियम", shells: "2, 8, 2", change: -2 },
  Al: { en: "aluminium", hi: "ऐलुमिनियम", shells: "2, 8, 3", change: -3 },
  K: { en: "potassium", hi: "पोटैशियम", shells: "2, 8, 8, 1", change: -1 },
  Ca: { en: "calcium", hi: "कैल्शियम", shells: "2, 8, 8, 2", change: -2 },
  Cl: { en: "chlorine", hi: "क्लोरीन", shells: "2, 8, 7", change: 1 },
  O: { en: "oxygen", hi: "ऑक्सीजन", shells: "2, 6", change: 2 },
  S: { en: "sulphur", hi: "सल्फ़र", shells: "2, 8, 6", change: 2 },
  F: { en: "fluorine", hi: "फ़्लुओरीन", shells: "2, 7", change: 1 },
} as const;
type Element = keyof typeof ELEMENTS;

const CHANGES = [-3, -2, -1, 1, 2] as const;
const words = (n: number) =>
  n < 0
    ? t(`Loses ${-n} electron${n === -1 ? "" : "s"}`, `${-n} इलेक्ट्रॉन खोता है`)
    : t(`Gains ${n} electron${n === 1 ? "" : "s"}`, `${n} इलेक्ट्रॉन पाता है`);

/** How an element reaches a completely filled outer shell when it forms an ionic compound. */
export const electronChange = family({
  level: Level.Medium,
  tests: [Concept.IonicCompounds],
  params: z.object({ element: z.enum(Object.keys(ELEMENTS) as [Element, ...Element[]]) }).strict(),
  build: ({ element }, b) => {
    const e = ELEMENTS[element];
    const others = CHANGES.filter((c) => c !== e.change)
      .sort((a, c) => Math.abs(a - e.change) - Math.abs(c - e.change))
      .slice(0, 3);
    const ask = pickOne(b, {
      prompt: t(
        `${e.en[0]?.toUpperCase()}${e.en.slice(1)} (${element}) has electrons ${e.shells}. To reach a completely filled outer shell in an ionic compound, it…`,
        `${e.hi} (${element}) के इलेक्ट्रॉन ${e.shells} हैं। आयनिक यौगिक में पूरा भरा बाहरी कोश पाने के लिए यह…`,
      ),
      right: words(e.change),
      wrong: others.map((c) => ({
        label: words(c),
        why: t(
          "Metals lose their few outer electrons; non-metals gain just enough to make eight.",
          "धातुएँ अपने थोड़े बाहरी इलेक्ट्रॉन खोती हैं; अधातुएँ आठ बनाने भर के इलेक्ट्रॉन पाती हैं।",
        ),
      })),
      seed: seedOf(element),
    });
    return column([ask, space()]);
  },
});
