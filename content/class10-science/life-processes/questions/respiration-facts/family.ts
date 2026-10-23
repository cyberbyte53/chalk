import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["cytoplasm", "mitochondria", "atp", "limeWater", "night", "day"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  cytoplasm: {
    prompt: {
      en: "Where does glucose break down into pyruvate?",
      hi: "ग्लूकोज़ पाइरुवेट में कहाँ टूटता है?",
    },
    right: { en: "Cytoplasm", hi: "कोशिकाद्रव्य" },
    wrong: [
      { en: "Mitochondria", hi: "माइटोकॉन्ड्रिया" },
      { en: "Chloroplast", hi: "क्लोरोप्लास्ट" },
    ],
    why: { en: "The first step happens in the cytoplasm.", hi: "पहला कदम कोशिकाद्रव्य में होता है।" },
  },
  mitochondria: {
    prompt: {
      en: "Where is pyruvate broken down using oxygen?",
      hi: "ऑक्सीजन से पाइरुवेट कहाँ टूटता है?",
    },
    right: { en: "Mitochondria", hi: "माइटोकॉन्ड्रिया" },
    wrong: [
      { en: "The cytoplasm", hi: "कोशिकाद्रव्य" },
      { en: "The nucleus", hi: "केंद्रक" },
    ],
    why: {
      en: "Aerobic breakdown of pyruvate takes place in the mitochondria.",
      hi: "पाइरुवेट का वायवीय विघटन माइटोकॉन्ड्रिया में होता है।",
    },
  },
  atp: {
    prompt: { en: "What is the energy currency of the cell?", hi: "कोशिका की ऊर्जा मुद्रा क्या है?" },
    right: { en: "ATP", hi: "ATP" },
    wrong: [
      { en: "Glucose", hi: "ग्लूकोज़" },
      { en: "Haemoglobin", hi: "हीमोग्लोबिन" },
    ],
    why: {
      en: "Energy from respiration is used to make ATP, which fuels the cell's activities.",
      hi: "श्वसन की ऊर्जा से ATP बनता है, जो कोशिका की गतिविधियों को ईंधन देता है।",
    },
  },
  limeWater: {
    prompt: {
      en: "Why does breathed-out air turn lime water milky faster than ordinary air?",
      hi: "बाहर छोड़ी साँस चूने के पानी को साधारण हवा से जल्दी दूधिया क्यों करती है?",
    },
    right: { en: "It has more carbon dioxide", hi: "इसमें अधिक कार्बन डाइऑक्साइड है" },
    wrong: [
      { en: "It has more oxygen in it", hi: "इसमें अधिक ऑक्सीजन है" },
      { en: "It is warmer than room air", hi: "यह कमरे की हवा से गर्म है" },
    ],
    why: {
      en: "Lime water turns milky with carbon dioxide, and breathed-out air has much more of it.",
      hi: "चूने का पानी कार्बन डाइऑक्साइड से दूधिया होता है, और बाहर छोड़ी साँस में यह बहुत ज़्यादा होती है।",
    },
  },
  night: {
    prompt: {
      en: "What is the main gas a leaf releases at night?",
      hi: "पत्ती रात में मुख्य रूप से कौन-सी गैस छोड़ती है?",
    },
    right: { en: "Carbon dioxide", hi: "कार्बन डाइऑक्साइड" },
    wrong: [
      { en: "Oxygen", hi: "ऑक्सीजन" },
      { en: "Nitrogen", hi: "नाइट्रोजन" },
    ],
    why: {
      en: "At night there's no photosynthesis, so the carbon dioxide from respiration is let out.",
      hi: "रात में प्रकाश संश्लेषण नहीं होता, इसलिए श्वसन की कार्बन डाइऑक्साइड बाहर निकलती है।",
    },
  },
  day: {
    prompt: {
      en: "Why does a leaf release no carbon dioxide in bright daylight?",
      hi: "तेज़ धूप में पत्ती कार्बन डाइऑक्साइड क्यों नहीं छोड़ती?",
    },
    right: {
      en: "Photosynthesis uses up the CO₂ from respiration",
      hi: "प्रकाश संश्लेषण श्वसन की CO₂ खर्च कर लेता है",
    },
    wrong: [
      { en: "Plants stop respiring during the day", hi: "पौधे दिन में श्वसन बंद कर देते हैं" },
      { en: "The stomata stay closed all day long", hi: "रंध्र पूरे दिन बंद रहते हैं" },
    ],
    why: {
      en: "Plants respire all the time; by day photosynthesis uses the carbon dioxide made.",
      hi: "पौधे हर समय श्वसन करते हैं; दिन में बनी कार्बन डाइऑक्साइड प्रकाश संश्लेषण में ख़र्च होती है।",
    },
  },
};

/** NCERT 6.3: where respiration happens, ATP, the lime-water test and plants' gas exchange. */
export const respirationFacts = family({
  level: Level.Medium,
  tests: [Concept.Respiration],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
