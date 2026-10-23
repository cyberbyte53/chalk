import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["peel", "bag", "glass", "cloth", "why", "fastest"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  peel: {
    prompt: { en: "A banana peel is…", hi: "केले का छिलका…" },
    right: { en: "Biodegradable", hi: "जैव निम्नीकरणीय है" },
    wrong: [
      { en: "Non-biodegradable", hi: "जैव अनिम्नीकरणीय है" },
      { en: "Neither of these", hi: "इनमें से कोई नहीं" },
    ],
    why: { en: "Decomposers break it down quickly.", hi: "अपघटक इसे जल्दी तोड़ देते हैं।" },
  },
  bag: {
    prompt: { en: "A polythene bag is…", hi: "पॉलीथीन की थैली…" },
    right: { en: "Non-biodegradable", hi: "जैव अनिम्नीकरणीय है" },
    wrong: [
      { en: "Biodegradable", hi: "जैव निम्नीकरणीय है" },
      { en: "Neither of these", hi: "इनमें से कोई नहीं" },
    ],
    why: {
      en: "Decomposers have no enzymes for plastics, so it persists.",
      hi: "अपघटकों के पास प्लास्टिक के लिए एंज़ाइम नहीं, इसलिए यह बना रहता है।",
    },
  },
  glass: {
    prompt: { en: "A glass bottle buried for 60 days…", hi: "60 दिन दबी काँच की बोतल…" },
    right: { en: "Stays unchanged", hi: "बिना बदले रहती है" },
    wrong: [
      { en: "Rots away fully", hi: "पूरी सड़ जाती है" },
      { en: "Turns into soil", hi: "मिट्टी बन जाती है" },
    ],
    why: {
      en: "Glass is non-biodegradable: it persists.",
      hi: "काँच जैव अनिम्नीकरणीय है: यह बना रहता है।",
    },
  },
  cloth: {
    prompt: { en: "An old cotton shirt is…", hi: "पुरानी सूती कमीज़…" },
    right: { en: "Biodegradable", hi: "जैव निम्नीकरणीय है" },
    wrong: [
      { en: "Non-biodegradable", hi: "जैव अनिम्नीकरणीय है" },
      { en: "Neither of these", hi: "इनमें से कोई नहीं" },
    ],
    why: {
      en: "Cotton comes from a plant and is broken down, though slowly.",
      hi: "कपास पौधे से आता है और धीरे-धीरे टूट जाता है।",
    },
  },
  why: {
    prompt: {
      en: "Why are some substances not biodegradable?",
      hi: "कुछ पदार्थ जैव निम्नीकरणीय क्यों नहीं होते?",
    },
    right: { en: "No enzyme can break them down", hi: "कोई एंज़ाइम उन्हें नहीं तोड़ सकता" },
    wrong: [
      { en: "They are too heavy for bacteria", hi: "वे जीवाणुओं के लिए बहुत भारी हैं" },
      { en: "They contain no carbon at all", hi: "उनमें बिल्कुल कार्बन नहीं" },
    ],
    why: {
      en: "Enzymes are specific; decomposers have none for many human-made materials.",
      hi: "एंज़ाइम विशिष्ट होते हैं; कई मानव-निर्मित चीज़ों के लिए अपघटकों के पास कोई नहीं।",
    },
  },
  fastest: {
    prompt: {
      en: "In the burial pit, which changes fastest?",
      hi: "दफ़न गड्ढे में सबसे जल्दी क्या बदलता है?",
    },
    right: { en: "Vegetable peels", hi: "सब्ज़ियों के छिलके" },
    wrong: [
      { en: "Old newspaper", hi: "पुराना अख़बार" },
      { en: "Cotton cloth", hi: "सूती कपड़ा" },
    ],
    why: {
      en: "Soft kitchen waste like peels breaks down first.",
      hi: "छिलके जैसा नरम रसोई कचरा सबसे पहले टूटता है।",
    },
  },
};

/** NCERT 15.2.2 and Activity 15.5: biodegradable or non-biodegradable. */
export const biodegradableOrNot = family({
  level: Level.Easy,
  tests: [Concept.BiodegradableOrNot],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
