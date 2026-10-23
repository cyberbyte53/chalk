import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const Way = {
  Electrolysis: "electrolysis",
  Carbon: "carbon",
  Heat: "heat",
  Native: "native",
} as const;
type Way = (typeof Way)[keyof typeof Way];

const WAYS: Record<Way, { en: string; hi: string }> = {
  electrolysis: {
    en: "Electrolytic reduction of its molten compound",
    hi: "इसके पिघले यौगिक का विद्युत अपघटनी अपचयन",
  },
  carbon: {
    en: "Roasting or calcination to the oxide, then reduction with carbon",
    hi: "भर्जन या निस्तापन से ऑक्साइड, फिर कार्बन से अपचयन",
  },
  heat: { en: "Heating its ore in air alone", hi: "इसके अयस्क को केवल हवा में गर्म करना" },
  native: {
    en: "It is found free in nature (native state)",
    hi: "यह प्रकृति में मुक्त मिलती है (प्राकृत अवस्था)",
  },
};

const METALS = {
  sodium: { en: "sodium", hi: "सोडियम", way: Way.Electrolysis },
  magnesium: { en: "magnesium", hi: "मैग्नीशियम", way: Way.Electrolysis },
  calcium: { en: "calcium", hi: "कैल्शियम", way: Way.Electrolysis },
  aluminium: { en: "aluminium", hi: "ऐलुमिनियम", way: Way.Electrolysis },
  zinc: { en: "zinc", hi: "ज़िंक", way: Way.Carbon },
  iron: { en: "iron", hi: "लोहा", way: Way.Carbon },
  lead: { en: "lead", hi: "लेड", way: Way.Carbon },
  mercury: { en: "mercury", hi: "पारा", way: Way.Heat },
  silver: { en: "silver", hi: "चाँदी", way: Way.Native },
  gold: { en: "gold", hi: "सोना", way: Way.Native },
} as const;
type Metal = keyof typeof METALS;

/** Fig 3.9: how a metal is got from the earth, by its place in the series. */
export const extractionMethod = family({
  level: Level.Medium,
  tests: [Concept.ExtractionOfMetals, Concept.ElectrolysisAndRefining],
  params: z.object({ metal: z.enum(Object.keys(METALS) as [Metal, ...Metal[]]) }).strict(),
  build: ({ metal }, b) => {
    const m = METALS[metal];
    const ask = pickOne(b, {
      prompt: t(`How is ${m.en} usually obtained?`, `${m.hi} सामान्यतः कैसे प्राप्त की जाती है?`),
      right: t(WAYS[m.way].en, WAYS[m.way].hi),
      wrong: (Object.values(Way) as Way[])
        .filter((w) => w !== m.way)
        .map((w) => ({
          label: t(WAYS[w].en, WAYS[w].hi),
          why: t(
            "Top of the series (K, Na, Ca, Mg, Al): electrolysis. Middle (Zn, Fe, Pb): carbon. Low (Hg, Cu): heating alone. Bottom (Ag, Au): found free.",
            "श्रेणी का ऊपरी भाग (K, Na, Ca, Mg, Al): विद्युत अपघटन। बीच (Zn, Fe, Pb): कार्बन। नीचे (Hg, Cu): केवल गर्म करना। सबसे नीचे (Ag, Au): मुक्त मिलती हैं।",
          ),
        })),
      seed: seedOf(metal),
    });
    return column([ask, space()]);
  },
});
