import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "gasIn",
  "gasOut",
  "pigment",
  "organelle",
  "pores",
  "guard",
  "store",
  "koh",
  "nitrogen",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  gasIn: {
    prompt: {
      en: "Which gas does a plant take in for photosynthesis?",
      hi: "प्रकाश संश्लेषण के लिए पौधा कौन-सी गैस लेता है?",
    },
    right: { en: "Carbon dioxide", hi: "कार्बन डाइऑक्साइड" },
    wrong: [
      { en: "Oxygen from the air", hi: "हवा की ऑक्सीजन" },
      { en: "Nitrogen from the air", hi: "हवा की नाइट्रोजन" },
    ],
    why: {
      en: "Carbon dioxide is turned into carbohydrates; oxygen is given out.",
      hi: "कार्बन डाइऑक्साइड कार्बोहाइड्रेट में बदलती है; ऑक्सीजन बाहर निकलती है।",
    },
  },
  gasOut: {
    prompt: {
      en: "Which gas is given out in photosynthesis?",
      hi: "प्रकाश संश्लेषण में कौन-सी गैस निकलती है?",
    },
    right: { en: "Oxygen", hi: "ऑक्सीजन" },
    wrong: [
      { en: "Carbon dioxide", hi: "कार्बन डाइऑक्साइड" },
      { en: "Water vapour only", hi: "केवल जलवाष्प" },
    ],
    why: {
      en: "Water molecules are split, and the oxygen is released.",
      hi: "पानी के अणु टूटते हैं, और ऑक्सीजन निकलती है।",
    },
  },
  pigment: {
    prompt: {
      en: "Which green pigment absorbs light for photosynthesis?",
      hi: "कौन-सा हरा वर्णक प्रकाश संश्लेषण के लिए प्रकाश सोखता है?",
    },
    right: { en: "Chlorophyll", hi: "क्लोरोफ़िल" },
    wrong: [
      { en: "Haemoglobin", hi: "हीमोग्लोबिन" },
      { en: "Starch", hi: "मंड" },
    ],
    why: {
      en: "Chlorophyll, inside the chloroplasts, absorbs light energy.",
      hi: "क्लोरोप्लास्ट के अंदर का क्लोरोफ़िल प्रकाश ऊर्जा सोखता है।",
    },
  },
  organelle: {
    prompt: {
      en: "In which part of a leaf cell is chlorophyll found?",
      hi: "पत्ती की कोशिका के किस भाग में क्लोरोफ़िल होता है?",
    },
    right: { en: "Chloroplasts", hi: "क्लोरोप्लास्ट" },
    wrong: [
      { en: "Mitochondria", hi: "माइटोकॉन्ड्रिया" },
      { en: "Nucleus", hi: "केंद्रक" },
    ],
    why: {
      en: "The green dots in leaf cells are chloroplasts, which contain chlorophyll.",
      hi: "पत्ती की कोशिकाओं के हरे बिंदु क्लोरोप्लास्ट हैं, जिनमें क्लोरोफ़िल होता है।",
    },
  },
  pores: {
    prompt: {
      en: "Through which tiny pores on leaves does carbon dioxide mainly enter?",
      hi: "पत्तियों के किन नन्हे छिद्रों से कार्बन डाइऑक्साइड मुख्यतः अंदर जाती है?",
    },
    right: { en: "Stomata", hi: "रंध्र" },
    wrong: [
      { en: "Villi", hi: "दीर्घरोम" },
      { en: "Alveoli", hi: "कूपिकाएँ" },
    ],
    why: {
      en: "Stomata, opened and closed by guard cells, let gases in and out.",
      hi: "द्वार कोशिकाओं से खुलने-बंद होने वाले रंध्र गैसों को अंदर-बाहर जाने देते हैं।",
    },
  },
  guard: {
    prompt: { en: "What makes a stoma open?", hi: "रंध्र किस कारण खुलता है?" },
    right: {
      en: "Water enters the guard cells and they swell",
      hi: "द्वार कोशिकाओं में पानी जाता है और वे फूलती हैं",
    },
    wrong: [
      { en: "The guard cells lose water and shrink", hi: "द्वार कोशिकाएँ पानी खोकर सिकुड़ती हैं" },
      { en: "Sunlight heats the leaf and melts it open", hi: "धूप पत्ती को गर्म करके उसे खोल देती है" },
    ],
    why: {
      en: "Swollen guard cells open the pore; shrunken ones close it.",
      hi: "फूली द्वार कोशिकाएँ छिद्र खोलती हैं; सिकुड़ी उसे बंद करती हैं।",
    },
  },
  store: {
    prompt: {
      en: "How do plants store food they don't need right away?",
      hi: "पौधे तुरंत न चाहिए भोजन को कैसे जमा करते हैं?",
    },
    right: { en: "As starch", hi: "मंड के रूप में" },
    wrong: [
      { en: "As glycogen", hi: "ग्लाइकोजन के रूप में" },
      { en: "As protein", hi: "प्रोटीन के रूप में" },
    ],
    why: {
      en: "Plants store spare carbohydrate as starch; animals like us store glycogen.",
      hi: "पौधे अतिरिक्त कार्बोहाइड्रेट मंड के रूप में रखते हैं; हम जैसे जंतु ग्लाइकोजन।",
    },
  },
  koh: {
    prompt: {
      en: "In Activity 6.2, why is potassium hydroxide kept beside one plant?",
      hi: "क्रियाकलाप 6.2 में एक पौधे के पास पोटैशियम हाइड्रॉक्साइड क्यों रखा जाता है?",
    },
    right: { en: "To absorb carbon dioxide", hi: "कार्बन डाइऑक्साइड सोखने के लिए" },
    wrong: [
      { en: "To give the plant extra water", hi: "पौधे को अतिरिक्त पानी देने के लिए" },
      { en: "To test the leaves for starch", hi: "पत्तियों में मंड जाँचने के लिए" },
    ],
    why: {
      en: "Potassium hydroxide absorbs carbon dioxide, so that plant can't photosynthesise.",
      hi: "पोटैशियम हाइड्रॉक्साइड कार्बन डाइऑक्साइड सोखता है, इसलिए वह पौधा प्रकाश संश्लेषण नहीं कर पाता।",
    },
  },
  nitrogen: {
    prompt: {
      en: "In what form do plants usually take up nitrogen?",
      hi: "पौधे आमतौर पर नाइट्रोजन किस रूप में लेते हैं?",
    },
    right: { en: "As nitrates or nitrites from soil", hi: "मिट्टी से नाइट्रेट या नाइट्राइट के रूप में" },
    wrong: [
      { en: "As nitrogen gas taken from the air", hi: "हवा से ली गई नाइट्रोजन गैस के रूप में" },
      { en: "By making it in photosynthesis", hi: "प्रकाश संश्लेषण में बनाकर" },
    ],
    why: {
      en: "Nitrogen comes as inorganic nitrates or nitrites, or as compounds made by bacteria.",
      hi: "नाइट्रोजन अकार्बनिक नाइट्रेट या नाइट्राइट, या जीवाणुओं के बनाए यौगिकों के रूप में आती है।",
    },
  },
};

/** NCERT 6.2.1: what photosynthesis needs, gives out and where it happens. */
export const photosynthesisFacts = family({
  level: Level.Easy,
  tests: [Concept.Photosynthesis],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
