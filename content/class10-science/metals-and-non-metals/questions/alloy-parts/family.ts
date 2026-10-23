import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

type W = { en: string; hi: string };

const ALLOYS = {
  brass: { name: { en: "brass", hi: "पीतल" }, parts: { en: "Copper and zinc", hi: "ताँबा और ज़िंक" } },
  bronze: {
    name: { en: "bronze", hi: "काँसा" },
    parts: { en: "Copper and tin", hi: "ताँबा और टिन" },
  },
  solder: { name: { en: "solder", hi: "सोल्डर" }, parts: { en: "Lead and tin", hi: "लेड और टिन" } },
  steel: {
    name: { en: "steel", hi: "स्टील" },
    parts: { en: "Iron and a little carbon", hi: "लोहा और थोड़ा कार्बन" },
  },
  stainless: {
    name: { en: "stainless steel", hi: "स्टेनलेस स्टील" },
    parts: { en: "Iron, nickel and chromium", hi: "लोहा, निकेल और क्रोमियम" },
  },
  amalgam: {
    name: { en: "an amalgam", hi: "अमलगम" },
    parts: { en: "Mercury and another metal", hi: "पारा और कोई दूसरी धातु" },
  },
  gold22: {
    name: { en: "22 carat gold", hi: "22 कैरेट सोना" },
    parts: {
      en: "22 parts gold with 2 parts copper or silver",
      hi: "22 भाग सोना और 2 भाग ताँबा या चाँदी",
    },
  },
} as const satisfies Record<string, { name: W; parts: W }>;
type Alloy = keyof typeof ALLOYS;
const ORDER = Object.keys(ALLOYS) as Alloy[];

/** What an alloy is made of (section 3.5.1). */
export const alloyParts = family({
  level: Level.Easy,
  tests: [Concept.CorrosionAndAlloys],
  params: z.object({ alloy: z.enum(ORDER as [Alloy, ...Alloy[]]) }).strict(),
  build: ({ alloy }, b) => {
    const a = ALLOYS[alloy];
    const i = ORDER.indexOf(alloy);
    const others = [1, 2, 3].map((k) => ORDER[(i + k) % ORDER.length] as Alloy);
    const ask = pickOne(b, {
      prompt: t(`What is ${a.name.en} made of?`, `${a.name.hi} किससे बना है?`),
      right: t(a.parts.en, a.parts.hi),
      wrong: others.map((o) => ({
        label: t(ALLOYS[o].parts.en, ALLOYS[o].parts.hi),
        why: t(`That is ${ALLOYS[o].name.en}.`, `वह ${ALLOYS[o].name.hi} है।`),
      })),
      seed: seedOf(alloy),
    });
    return column([ask, space()]);
  },
});
