import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["artery", "vein", "capillary", "platelets", "lymph", "plasma", "ventricle"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  artery: {
    prompt: {
      en: "Which vessel carries blood away from the heart and has thick, elastic walls?",
      hi: "कौन-सी वाहिका रुधिर को हृदय से दूर ले जाती है और जिसकी दीवारें मोटी, लचीली हैं?",
    },
    right: { en: "Artery", hi: "धमनी" },
    wrong: [
      { en: "Vein", hi: "शिरा" },
      { en: "Capillary", hi: "केशिका" },
    ],
    why: {
      en: "Arteries take blood under high pressure, so their walls are thick and elastic.",
      hi: "धमनियाँ ऊँचे दाब पर रुधिर ले जाती हैं, इसलिए उनकी दीवारें मोटी और लचीली हैं।",
    },
  },
  vein: {
    prompt: {
      en: "Which vessel brings blood back to the heart and has valves?",
      hi: "कौन-सी वाहिका रुधिर को हृदय तक वापस लाती है और जिसमें वाल्व हैं?",
    },
    right: { en: "Vein", hi: "शिरा" },
    wrong: [
      { en: "Artery", hi: "धमनी" },
      { en: "Capillary", hi: "केशिका" },
    ],
    why: {
      en: "Veins carry blood back under low pressure; valves keep it flowing one way.",
      hi: "शिराएँ कम दाब पर रुधिर लौटाती हैं; वाल्व उसे एक दिशा में बहाते हैं।",
    },
  },
  capillary: {
    prompt: {
      en: "Which vessels have walls only one cell thick, for exchange with cells?",
      hi: "किन वाहिकाओं की दीवार केवल एक कोशिका मोटी है, कोशिकाओं से आदान-प्रदान के लिए?",
    },
    right: { en: "Capillaries", hi: "केशिकाएँ" },
    wrong: [
      { en: "Thick arteries", hi: "मोटी धमनियाँ" },
      { en: "Large veins", hi: "बड़ी शिराएँ" },
    ],
    why: {
      en: "Materials pass between blood and cells across the thin capillary wall.",
      hi: "पतली केशिका दीवार के आर-पार रुधिर और कोशिकाओं के बीच पदार्थ आते-जाते हैं।",
    },
  },
  platelets: {
    prompt: {
      en: "What helps blood clot to plug a leak?",
      hi: "रिसाव बंद करने के लिए रुधिर का थक्का जमाने में कौन मदद करता है?",
    },
    right: { en: "Platelets", hi: "प्लेटलेट्स" },
    wrong: [
      { en: "Red blood corpuscles", hi: "लाल रुधिर कणिकाएँ" },
      { en: "Lymph", hi: "लसीका" },
    ],
    why: {
      en: "Platelets plug leaks by helping the blood clot at an injury.",
      hi: "प्लेटलेट्स चोट पर रुधिर का थक्का जमाकर रिसाव बंद करती हैं।",
    },
  },
  lymph: {
    prompt: {
      en: "Which colourless fluid carries absorbed fat from the intestine?",
      hi: "कौन-सा रंगहीन द्रव आंत से सोखी गई वसा ले जाता है?",
    },
    right: { en: "Lymph", hi: "लसीका" },
    wrong: [
      { en: "Plasma", hi: "प्लाज़्मा" },
      { en: "Bile", hi: "पित्त" },
    ],
    why: {
      en: "Lymph carries digested and absorbed fat, and drains extra fluid back into the blood.",
      hi: "लसीका पची और सोखी गई वसा ले जाती है, और अतिरिक्त द्रव वापस रुधिर में पहुँचाती है।",
    },
  },
  plasma: {
    prompt: {
      en: "Which part of blood carries food, carbon dioxide and nitrogen wastes dissolved in it?",
      hi: "रुधिर का कौन-सा भाग भोजन, कार्बन डाइऑक्साइड और नाइट्रोजनी अपशिष्ट घोलकर ले जाता है?",
    },
    right: { en: "Plasma", hi: "प्लाज़्मा" },
    wrong: [
      { en: "Red blood corpuscles", hi: "लाल रुधिर कणिकाएँ" },
      { en: "Platelets", hi: "प्लेटलेट्स" },
    ],
    why: {
      en: "Plasma, the fluid part of blood, carries these in dissolved form.",
      hi: "रुधिर का तरल भाग, प्लाज़्मा, इन्हें घुले रूप में ले जाता है।",
    },
  },
  ventricle: {
    prompt: {
      en: "Which heart chambers have the thickest muscular walls?",
      hi: "हृदय के किन कक्षों की मांसल दीवारें सबसे मोटी हैं?",
    },
    right: { en: "Ventricles", hi: "निलय" },
    wrong: [
      { en: "Atria", hi: "आलिंद" },
      { en: "Both the same", hi: "दोनों एक जैसे" },
    ],
    why: {
      en: "Ventricles pump blood to whole organs, so they have thicker walls than the atria.",
      hi: "निलय पूरे अंगों तक रुधिर पंप करते हैं, इसलिए उनकी दीवारें आलिंदों से मोटी हैं।",
    },
  },
};

/** NCERT 6.4.1: which part of the human transport system matches this description? */
export const bloodAndVessels = family({
  level: Level.Medium,
  tests: [Concept.HeartAndBlood],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
