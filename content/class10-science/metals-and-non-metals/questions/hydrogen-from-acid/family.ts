import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const METALS = {
  Mg: { en: "magnesium", hi: "मैग्नीशियम", above: true },
  Al: { en: "aluminium", hi: "ऐलुमिनियम", above: true },
  Zn: { en: "zinc", hi: "ज़िंक", above: true },
  Fe: { en: "iron", hi: "लोहा", above: true },
  Cu: { en: "copper", hi: "ताँबा", above: false },
  Ag: { en: "silver", hi: "चाँदी", above: false },
  Au: { en: "gold", hi: "सोना", above: false },
} as const;
type Metal = keyof typeof METALS;

/** Does this metal give hydrogen with dilute hydrochloric acid? */
export const hydrogenFromAcid = family({
  level: Level.Easy,
  tests: [Concept.MetalsWithWaterAndAcids, Concept.ReactivitySeries],
  params: z.object({ metal: z.enum(Object.keys(METALS) as [Metal, ...Metal[]]) }).strict(),
  build: ({ metal }, b) => {
    const m = METALS[metal];
    const yes = t(
      `Yes: ${m.en} is above hydrogen, so it gives a salt and hydrogen`,
      `हाँ: ${m.hi} हाइड्रोजन से ऊपर है, इसलिए लवण और हाइड्रोजन देता है`,
    );
    const no = t(
      `No: ${m.en} is below hydrogen, so nothing happens`,
      `नहीं: ${m.hi} हाइड्रोजन से नीचे है, इसलिए कुछ नहीं होता`,
    );
    const ask = pickOne(b, {
      prompt: t(
        `A clean piece of ${m.en} is dropped into dilute hydrochloric acid. Is hydrogen gas given off?`,
        `${m.hi} का एक साफ़ टुकड़ा तनु हाइड्रोक्लोरिक अम्ल में डाला जाता है। क्या हाइड्रोजन गैस निकलती है?`,
      ),
      right: m.above ? yes : no,
      wrong: [
        {
          label: m.above ? no : yes,
          why: t(
            "Only metals above hydrogen in the reactivity series displace hydrogen from dilute acids.",
            "सक्रियता श्रेणी में हाइड्रोजन से ऊपर की धातुएँ ही तनु अम्लों से हाइड्रोजन विस्थापित करती हैं।",
          ),
        },
      ],
      seed: seedOf(metal),
    });
    return column([ask, space()]);
  },
});
