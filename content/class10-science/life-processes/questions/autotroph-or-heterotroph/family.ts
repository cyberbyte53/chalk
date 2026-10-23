import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["mango", "mushroom", "cow", "grass", "yeast", "amarBel", "tiger"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  mango: {
    prompt: {
      en: "Is a mango tree an autotroph or a heterotroph?",
      hi: "आम का पेड़ स्वपोषी है या विषमपोषी?",
    },
    right: { en: "Autotroph", hi: "स्वपोषी" },
    wrong: [{ en: "Heterotroph", hi: "विषमपोषी" }],
    why: {
      en: "A green plant makes its own food by photosynthesis.",
      hi: "हरा पौधा प्रकाश संश्लेषण से अपना भोजन ख़ुद बनाता है।",
    },
  },
  mushroom: {
    prompt: {
      en: "Is a mushroom an autotroph or a heterotroph?",
      hi: "मशरूम स्वपोषी है या विषमपोषी?",
    },
    right: { en: "Heterotroph", hi: "विषमपोषी" },
    wrong: [{ en: "Autotroph", hi: "स्वपोषी" }],
    why: {
      en: "A mushroom has no chlorophyll; it absorbs food made by others.",
      hi: "मशरूम में क्लोरोफ़िल नहीं; वह दूसरों का बनाया भोजन सोखता है।",
    },
  },
  cow: {
    prompt: { en: "Is a cow an autotroph or a heterotroph?", hi: "गाय स्वपोषी है या विषमपोषी?" },
    right: { en: "Heterotroph", hi: "विषमपोषी" },
    wrong: [{ en: "Autotroph", hi: "स्वपोषी" }],
    why: {
      en: "A cow eats grass: food made by a plant.",
      hi: "गाय घास खाती है: पौधे का बनाया भोजन।",
    },
  },
  grass: {
    prompt: { en: "Is grass an autotroph or a heterotroph?", hi: "घास स्वपोषी है या विषमपोषी?" },
    right: { en: "Autotroph", hi: "स्वपोषी" },
    wrong: [{ en: "Heterotroph", hi: "विषमपोषी" }],
    why: { en: "Grass is green and makes its own food.", hi: "घास हरी है और अपना भोजन ख़ुद बनाती है।" },
  },
  yeast: {
    prompt: { en: "Is yeast an autotroph or a heterotroph?", hi: "यीस्ट स्वपोषी है या विषमपोषी?" },
    right: { en: "Heterotroph", hi: "विषमपोषी" },
    wrong: [{ en: "Autotroph", hi: "स्वपोषी" }],
    why: {
      en: "Yeast is a fungus; it uses sugar made by plants.",
      hi: "यीस्ट एक कवक है; यह पौधों की बनाई शर्करा का उपयोग करता है।",
    },
  },
  amarBel: {
    prompt: {
      en: "Is amar-bel (cuscuta) an autotroph or a heterotroph?",
      hi: "अमरबेल (कस्कुटा) स्वपोषी है या विषमपोषी?",
    },
    right: { en: "Heterotroph", hi: "विषमपोषी" },
    wrong: [{ en: "Autotroph", hi: "स्वपोषी" }],
    why: {
      en: "Amar-bel has no green leaves; it takes food from its host plant.",
      hi: "अमरबेल में हरी पत्तियाँ नहीं; यह अपने परपोषी पौधे से भोजन लेती है।",
    },
  },
  tiger: {
    prompt: { en: "Is a tiger an autotroph or a heterotroph?", hi: "बाघ स्वपोषी है या विषमपोषी?" },
    right: { en: "Heterotroph", hi: "विषमपोषी" },
    wrong: [{ en: "Autotroph", hi: "स्वपोषी" }],
    why: {
      en: "A tiger eats other animals, which ate plants.",
      hi: "बाघ दूसरे जंतुओं को खाता है, जिन्होंने पौधे खाए।",
    },
  },
};

/** NCERT 6.2: is this organism an autotroph (makes its own food) or a heterotroph? */
export const autotrophOrHeterotroph = family({
  level: Level.Easy,
  tests: [Concept.Photosynthesis, Concept.HeterotrophicNutrition],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
