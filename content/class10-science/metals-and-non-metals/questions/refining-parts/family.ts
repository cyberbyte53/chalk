import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const METALS = {
  copper: {
    en: "copper",
    hi: "ताँबा",
    salt: { en: "acidified copper sulphate", hi: "अम्लीय कॉपर सल्फ़ेट" },
  },
  silver: { en: "silver", hi: "चाँदी", salt: { en: "a silver salt", hi: "चाँदी का एक लवण" } },
  gold: { en: "gold", hi: "सोना", salt: { en: "a gold salt", hi: "सोने का एक लवण" } },
  zinc: { en: "zinc", hi: "ज़िंक", salt: { en: "a zinc salt", hi: "ज़िंक का एक लवण" } },
} as const;
type Metal = keyof typeof METALS;

const PARTS = ["anode", "cathode", "electrolyte", "mud"] as const;
type Part = (typeof PARTS)[number];

/** Electrolytic refining (Fig 3.12, Exercise 8): which part is which? */
export const refiningParts = family({
  level: Level.Medium,
  tests: [Concept.ElectrolysisAndRefining],
  params: z
    .object({ metal: z.enum(Object.keys(METALS) as [Metal, ...Metal[]]), part: z.enum(PARTS) })
    .strict(),
  build: ({ metal, part }, b) => {
    const m = METALS[metal];
    const answers: Record<Part, { en: string; hi: string }> = {
      anode: { en: `A block of impure ${m.en}`, hi: `अशुद्ध ${m.hi} का एक टुकड़ा` },
      cathode: { en: `A thin strip of pure ${m.en}`, hi: `शुद्ध ${m.hi} की एक पतली पट्टी` },
      electrolyte: { en: `A solution of ${m.salt.en}`, hi: `${m.salt.hi} का विलयन` },
      mud: {
        en: "The insoluble impurities that settle under the anode",
        hi: "अघुलनशील अशुद्धियाँ जो ऐनोड के नीचे बैठ जाती हैं",
      },
    };
    const asks: Record<Part, { en: string; hi: string }> = {
      anode: { en: "the anode", hi: "ऐनोड" },
      cathode: { en: "the cathode", hi: "कैथोड" },
      electrolyte: { en: "the electrolyte", hi: "विद्युत अपघट्य" },
      mud: { en: "the anode mud", hi: "ऐनोड पंक" },
    };
    const ask = pickOne(b, {
      prompt: t(
        `In the electrolytic refining of ${m.en}, what is ${asks[part].en}?`,
        `${m.hi} के विद्युत अपघटनी परिष्करण में ${asks[part].hi} क्या है?`,
      ),
      right: t(answers[part].en, answers[part].hi),
      wrong: PARTS.filter((p) => p !== part).map((p) => ({
        label: t(answers[p].en, answers[p].hi),
        why: t(
          `That is ${asks[p].en}. The impure metal is the anode, pure metal collects on the cathode, a salt solution carries the ions, and insoluble impurities fall as anode mud.`,
          `वह ${asks[p].hi} है। अशुद्ध धातु ऐनोड है, शुद्ध धातु कैथोड पर जमती है, लवण विलयन आयन ले जाता है, और अघुलनशील अशुद्धियाँ ऐनोड पंक बनकर गिरती हैं।`,
        ),
      })),
      seed: seedOf(metal, part),
    });
    return column([ask, space()]);
  },
});
