import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["aerobic", "yeast", "muscle", "firstStep", "mostEnergy", "cramp"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  aerobic: {
    prompt: {
      en: "With oxygen, in the mitochondria, pyruvate is broken down into…",
      hi: "ऑक्सीजन के साथ, माइटोकॉन्ड्रिया में, पाइरुवेट किसमें टूटता है…",
    },
    right: { en: "Carbon dioxide and water", hi: "कार्बन डाइऑक्साइड और पानी" },
    wrong: [
      { en: "Ethanol and carbon dioxide", hi: "एथेनॉल और कार्बन डाइऑक्साइड" },
      { en: "Lactic acid", hi: "लैक्टिक अम्ल" },
    ],
    why: {
      en: "Aerobic respiration breaks pyruvate completely to carbon dioxide and water.",
      hi: "वायवीय श्वसन पाइरुवेट को पूरी तरह कार्बन डाइऑक्साइड और पानी में तोड़ता है।",
    },
  },
  yeast: {
    prompt: {
      en: "In yeast, without oxygen, pyruvate becomes…",
      hi: "यीस्ट में, ऑक्सीजन के बिना, पाइरुवेट क्या बनता है…",
    },
    right: { en: "Ethanol and carbon dioxide", hi: "एथेनॉल और कार्बन डाइऑक्साइड" },
    wrong: [
      { en: "Carbon dioxide and water", hi: "कार्बन डाइऑक्साइड और पानी" },
      { en: "Lactic acid and energy", hi: "लैक्टिक अम्ल और ऊर्जा" },
    ],
    why: {
      en: "Fermentation in yeast makes ethanol and carbon dioxide.",
      hi: "यीस्ट में किण्वन से एथेनॉल और कार्बन डाइऑक्साइड बनते हैं।",
    },
  },
  muscle: {
    prompt: {
      en: "In our muscles, when oxygen runs short, pyruvate becomes…",
      hi: "हमारी मांसपेशियों में, ऑक्सीजन कम पड़ने पर, पाइरुवेट क्या बनता है…",
    },
    right: { en: "Lactic acid", hi: "लैक्टिक अम्ल" },
    wrong: [
      { en: "Ethanol and carbon dioxide", hi: "एथेनॉल और कार्बन डाइऑक्साइड" },
      { en: "Glucose", hi: "ग्लूकोज़" },
    ],
    why: {
      en: "Short of oxygen, muscles turn pyruvate into lactic acid, which causes cramps.",
      hi: "ऑक्सीजन की कमी में मांसपेशियाँ पाइरुवेट को लैक्टिक अम्ल में बदलती हैं, जिससे ऐंठन होती है।",
    },
  },
  firstStep: {
    prompt: {
      en: "Glucose (6 carbons) is first broken into which 3-carbon molecule?",
      hi: "ग्लूकोज़ (6 कार्बन) पहले किस 3-कार्बन अणु में टूटता है?",
    },
    right: { en: "Pyruvate", hi: "पाइरुवेट" },
    wrong: [
      { en: "Lactic acid", hi: "लैक्टिक अम्ल" },
      { en: "Starch", hi: "मंड" },
    ],
    why: {
      en: "The first step on every route is glucose to pyruvate, in the cytoplasm.",
      hi: "हर रास्ते का पहला कदम कोशिकाद्रव्य में ग्लूकोज़ से पाइरुवेट है।",
    },
  },
  mostEnergy: {
    prompt: {
      en: "Which route releases the most energy?",
      hi: "कौन-सा रास्ता सबसे ज़्यादा ऊर्जा देता है?",
    },
    right: { en: "Aerobic, with oxygen", hi: "वायवीय, ऑक्सीजन के साथ" },
    wrong: [
      { en: "Fermentation in yeast", hi: "यीस्ट में किण्वन" },
      { en: "Lactic acid in muscle", hi: "मांसपेशी में लैक्टिक अम्ल" },
    ],
    why: {
      en: "Aerobic respiration releases a lot more energy than the anaerobic routes.",
      hi: "वायवीय श्वसन अवायवीय रास्तों से कहीं ज़्यादा ऊर्जा देता है।",
    },
  },
  cramp: {
    prompt: {
      en: "What causes cramps after sudden hard exercise?",
      hi: "अचानक कड़ी कसरत के बाद ऐंठन किससे होती है?",
    },
    right: { en: "Lactic acid building up in muscles", hi: "पेशियों में लैक्टिक अम्ल जमा होना" },
    wrong: [
      { en: "Too much oxygen reaching the muscles", hi: "पेशियों तक बहुत अधिक ऑक्सीजन पहुँचना" },
      { en: "Ethanol made in the blood", hi: "रक्त में बनता एथेनॉल" },
    ],
    why: {
      en: "When muscles are short of oxygen, lactic acid builds up and causes cramps.",
      hi: "मांसपेशियों में ऑक्सीजन कम हो तो लैक्टिक अम्ल जमा होकर ऐंठन करता है।",
    },
  },
};

/** NCERT 6.3, Fig 6.8: what does pyruvate become on each route? */
export const respirationRoute = family({
  level: Level.Medium,
  tests: [Concept.Respiration],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
