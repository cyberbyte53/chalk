import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["khadin", "bandhara", "ahar", "eri", "surangam"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  khadin: {
    prompt: {
      en: "Khadins and nadis are traditional systems of…",
      hi: "खडीन और नाडी किस राज्य की पारंपरिक प्रणालियाँ हैं?",
    },
    right: { en: "Rajasthan", hi: "राजस्थान" },
    wrong: [
      { en: "Kerala", hi: "केरल" },
      { en: "Maharashtra", hi: "महाराष्ट्र" },
    ],
    why: { en: "Khadins, tanks and nadis are Rajasthan's.", hi: "खडीन, टैंक और नाडी राजस्थान के हैं।" },
  },
  bandhara: {
    prompt: { en: "Bandharas and tals are found in…", hi: "बंधारा और ताल कहाँ मिलते हैं?" },
    right: { en: "Maharashtra", hi: "महाराष्ट्र" },
    wrong: [
      { en: "Rajasthan", hi: "राजस्थान" },
      { en: "Madhya Pradesh", hi: "मध्य प्रदेश" },
    ],
    why: { en: "Bandharas and tals are in Maharashtra.", hi: "बंधारा और ताल महाराष्ट्र में हैं।" },
  },
  ahar: {
    prompt: { en: "Ahars and pynes are found in…", hi: "आहर और पाइन कहाँ मिलते हैं?" },
    right: { en: "Bihar", hi: "बिहार" },
    wrong: [
      { en: "Kerala", hi: "केरल" },
      { en: "Karnataka", hi: "कर्नाटक" },
    ],
    why: { en: "Ahars and pynes are in Bihar.", hi: "आहर और पाइन बिहार में हैं।" },
  },
  eri: {
    prompt: { en: "Eris (tanks) are found in…", hi: "एरी (तालाब) कहाँ मिलते हैं?" },
    right: { en: "Tamil Nadu", hi: "तमिलनाडु" },
    wrong: [
      { en: "Bihar", hi: "बिहार" },
      { en: "Himachal Pradesh", hi: "हिमाचल प्रदेश" },
    ],
    why: { en: "Eris are the tanks of Tamil Nadu.", hi: "एरी तमिलनाडु के तालाब हैं।" },
  },
  surangam: {
    prompt: { en: "Surangams are found in…", hi: "सुरंगम कहाँ मिलते हैं?" },
    right: { en: "Kerala", hi: "केरल" },
    wrong: [
      { en: "Karnataka", hi: "कर्नाटक" },
      { en: "Rajasthan", hi: "राजस्थान" },
    ],
    why: {
      en: "Surangams are in Kerala; kattas are Karnataka's.",
      hi: "सुरंगम केरल में हैं; कट्टा कर्नाटक के।",
    },
  },
};

/** NCERT 16.3.2: traditional water harvesting systems and where they are found. */
export const harvestingSystems = family({
  level: Level.Easy,
  tests: [Concept.WaterHarvesting],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
