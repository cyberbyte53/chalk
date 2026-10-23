import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["filter", "reabsorb", "ureter", "bladder", "urethra", "stays", "waste"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  filter: {
    prompt: {
      en: "Where is blood first filtered in a nephron?",
      hi: "वृक्काणु में रुधिर पहले कहाँ छनता है?",
    },
    right: {
      en: "Capillary cluster into Bowman's capsule",
      hi: "कोशिका-गुच्छ से बोमन संपुट में",
    },
    wrong: [
      { en: "In the urinary bladder, before release", hi: "मूत्राशय में, बाहर निकलने से पहले" },
      { en: "In the ureter, on the way down", hi: "मूत्रवाहिनी में, नीचे जाते हुए" },
    ],
    why: {
      en: "A cluster of thin-walled capillaries filters blood into the cup-shaped Bowman's capsule.",
      hi: "पतली दीवार वाली केशिकाओं का गुच्छा रुधिर को प्याले जैसे बोमन संपुट में छानता है।",
    },
  },
  reabsorb: {
    prompt: {
      en: "Where are glucose, amino acids and most of the water taken back?",
      hi: "ग्लूकोज़, अमीनो अम्ल और ज़्यादातर पानी कहाँ वापस लिए जाते हैं?",
    },
    right: { en: "Along the nephron's tube", hi: "वृक्काणु की नलिका में" },
    wrong: [
      { en: "In the urethra, on the way out", hi: "मूत्रमार्ग में, बाहर जाते हुए" },
      { en: "In the bladder, while it fills", hi: "मूत्राशय में, भरते समय" },
    ],
    why: {
      en: "Useful substances are selectively re-absorbed as the filtrate flows along the tube.",
      hi: "निस्यंद के नली में बहते समय काम के पदार्थ चुनकर वापस सोखे जाते हैं।",
    },
  },
  ureter: {
    prompt: {
      en: "Which tube carries urine from a kidney to the bladder?",
      hi: "कौन-सी नली मूत्र को वृक्क से मूत्राशय तक ले जाती है?",
    },
    right: { en: "Ureter", hi: "मूत्रवाहिनी" },
    wrong: [
      { en: "Urethra", hi: "मूत्रमार्ग" },
      { en: "Oesophagus", hi: "ग्रसिका" },
    ],
    why: {
      en: "Each kidney's urine flows down a ureter into the bladder.",
      hi: "हर वृक्क का मूत्र मूत्रवाहिनी से मूत्राशय में जाता है।",
    },
  },
  bladder: {
    prompt: {
      en: "Where is urine stored until it is passed out?",
      hi: "मूत्र बाहर निकलने तक कहाँ जमा रहता है?",
    },
    right: { en: "Urinary bladder", hi: "मूत्राशय" },
    wrong: [
      { en: "Kidneys", hi: "वृक्क" },
      { en: "Ureters", hi: "मूत्रवाहिनियाँ" },
    ],
    why: {
      en: "The muscular bladder stores urine until it is released through the urethra.",
      hi: "मांसल मूत्राशय मूत्र को तब तक रखता है जब तक वह मूत्रमार्ग से न निकले।",
    },
  },
  urethra: {
    prompt: {
      en: "Through which tube is urine passed out of the body?",
      hi: "मूत्र किस नली से शरीर से बाहर निकलता है?",
    },
    right: { en: "Urethra", hi: "मूत्रमार्ग" },
    wrong: [
      { en: "Ureter", hi: "मूत्रवाहिनी" },
      { en: "Bowman's capsule", hi: "बोमन संपुट" },
    ],
    why: {
      en: "Urine leaves the bladder through the urethra.",
      hi: "मूत्र मूत्राशय से मूत्रमार्ग द्वारा निकलता है।",
    },
  },
  stays: {
    prompt: {
      en: "What is too big to be filtered and stays in the blood?",
      hi: "क्या इतना बड़ा है कि छन नहीं पाता और रुधिर में रहता है?",
    },
    right: { en: "Blood cells and proteins", hi: "रक्त कोशिकाएँ और प्रोटीन" },
    wrong: [
      { en: "Urea and other nitrogen waste", hi: "यूरिया और अन्य नाइट्रोजनी अपशिष्ट" },
      { en: "Glucose and salts", hi: "ग्लूकोज़ और लवण" },
    ],
    why: {
      en: "Small substances pass the filter; blood cells and proteins stay behind.",
      hi: "छोटे पदार्थ छन्नी पार करते हैं; रुधिर कोशिकाएँ और प्रोटीन पीछे रहते हैं।",
    },
  },
  waste: {
    prompt: {
      en: "Which nitrogen waste is removed in urine?",
      hi: "मूत्र में कौन-सा नाइट्रोजनी अपशिष्ट निकलता है?",
    },
    right: { en: "Urea", hi: "यूरिया" },
    wrong: [
      { en: "Glucose", hi: "ग्लूकोज़" },
      { en: "Amino acids", hi: "अमीनो अम्ल" },
    ],
    why: {
      en: "Nitrogenous wastes like urea are removed from the blood in the kidneys.",
      hi: "यूरिया जैसे नाइट्रोजनी अपशिष्ट वृक्कों में रुधिर से हटाए जाते हैं।",
    },
  },
};

/** NCERT 6.5.1: the parts of the excretory system and the nephron, and what each does. */
export const nephronParts = family({
  level: Level.Medium,
  tests: [Concept.Excretion],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
