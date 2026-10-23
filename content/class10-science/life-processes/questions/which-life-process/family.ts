import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "plantMakesFood",
  "glucoseBroken",
  "bloodCarries",
  "ureaRemoved",
  "amoebaEats",
  "xylemWater",
  "yeastSugar",
  "leavesFall",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  plantMakesFood: {
    prompt: {
      en: "Which life process is this? A plant makes carbohydrates from carbon dioxide and water.",
      hi: "यह कौन-सा जैव प्रक्रम है? पौधा कार्बन डाइऑक्साइड और पानी से कार्बोहाइड्रेट बनाता है।",
    },
    right: { en: "Nutrition", hi: "पोषण" },
    wrong: [
      { en: "Respiration", hi: "श्वसन" },
      { en: "Transport", hi: "परिवहन" },
      { en: "Excretion", hi: "उत्सर्जन" },
    ],
    why: {
      en: "Making or taking in food, the source of energy, is nutrition.",
      hi: "भोजन, ऊर्जा का स्रोत, बनाना या लेना पोषण है।",
    },
  },
  glucoseBroken: {
    prompt: {
      en: "Which life process is this? Cells break down glucose using oxygen to release energy.",
      hi: "यह कौन-सा जैव प्रक्रम है? कोशिकाएँ ऑक्सीजन से ग्लूकोज़ तोड़कर ऊर्जा निकालती हैं।",
    },
    right: { en: "Respiration", hi: "श्वसन" },
    wrong: [
      { en: "Nutrition", hi: "पोषण" },
      { en: "Transport", hi: "परिवहन" },
      { en: "Excretion", hi: "उत्सर्जन" },
    ],
    why: {
      en: "Using oxygen to break down food for energy is respiration.",
      hi: "ऊर्जा के लिए ऑक्सीजन से भोजन तोड़ना श्वसन है।",
    },
  },
  bloodCarries: {
    prompt: {
      en: "Which life process is this? Blood carries oxygen from the lungs to the leg muscles.",
      hi: "यह कौन-सा जैव प्रक्रम है? रुधिर फेफड़ों से पैर की मांसपेशियों तक ऑक्सीजन ले जाता है।",
    },
    right: { en: "Transport", hi: "परिवहन" },
    wrong: [
      { en: "Nutrition", hi: "पोषण" },
      { en: "Respiration", hi: "श्वसन" },
      { en: "Excretion", hi: "उत्सर्जन" },
    ],
    why: {
      en: "Carrying materials from one part of the body to another is transport.",
      hi: "पदार्थों को शरीर के एक भाग से दूसरे तक ले जाना परिवहन है।",
    },
  },
  ureaRemoved: {
    prompt: {
      en: "Which life process is this? The kidneys remove urea from the blood.",
      hi: "यह कौन-सा जैव प्रक्रम है? वृक्क रुधिर से यूरिया हटाते हैं।",
    },
    right: { en: "Excretion", hi: "उत्सर्जन" },
    wrong: [
      { en: "Nutrition", hi: "पोषण" },
      { en: "Respiration", hi: "श्वसन" },
      { en: "Transport", hi: "परिवहन" },
    ],
    why: {
      en: "Removing harmful waste from the body is excretion.",
      hi: "शरीर से हानिकारक अपशिष्ट हटाना उत्सर्जन है।",
    },
  },
  amoebaEats: {
    prompt: {
      en: "Which life process is this? An Amoeba takes in a food particle.",
      hi: "यह कौन-सा जैव प्रक्रम है? अमीबा भोजन का एक कण अंदर लेता है।",
    },
    right: { en: "Nutrition", hi: "पोषण" },
    wrong: [
      { en: "Respiration", hi: "श्वसन" },
      { en: "Transport", hi: "परिवहन" },
      { en: "Excretion", hi: "उत्सर्जन" },
    ],
    why: { en: "Taking food in from outside is nutrition.", hi: "बाहर से भोजन अंदर लेना पोषण है।" },
  },
  xylemWater: {
    prompt: {
      en: "Which life process is this? Water rises through the xylem of a tree.",
      hi: "यह कौन-सा जैव प्रक्रम है? पेड़ के जाइलम में पानी ऊपर चढ़ता है।",
    },
    right: { en: "Transport", hi: "परिवहन" },
    wrong: [
      { en: "Nutrition", hi: "पोषण" },
      { en: "Respiration", hi: "श्वसन" },
      { en: "Excretion", hi: "उत्सर्जन" },
    ],
    why: {
      en: "Moving water from the roots to the leaves is transport in plants.",
      hi: "पानी को जड़ों से पत्तियों तक ले जाना पौधों में परिवहन है।",
    },
  },
  yeastSugar: {
    prompt: {
      en: "Which life process is this? Yeast turns sugar into ethanol and carbon dioxide, releasing energy.",
      hi: "यह कौन-सा जैव प्रक्रम है? यीस्ट शर्करा को एथेनॉल और कार्बन डाइऑक्साइड में बदलकर ऊर्जा निकालता है।",
    },
    right: { en: "Respiration", hi: "श्वसन" },
    wrong: [
      { en: "Nutrition", hi: "पोषण" },
      { en: "Transport", hi: "परिवहन" },
      { en: "Excretion", hi: "उत्सर्जन" },
    ],
    why: {
      en: "Breaking down food to release energy, even without oxygen, is respiration.",
      hi: "ऊर्जा के लिए भोजन तोड़ना, ऑक्सीजन के बिना भी, श्वसन है।",
    },
  },
  leavesFall: {
    prompt: {
      en: "Which life process is this? A tree stores wastes in old leaves that then fall off.",
      hi: "यह कौन-सा जैव प्रक्रम है? पेड़ अपशिष्ट पुरानी पत्तियों में जमा करता है जो फिर गिर जाती हैं।",
    },
    right: { en: "Excretion", hi: "उत्सर्जन" },
    wrong: [
      { en: "Nutrition", hi: "पोषण" },
      { en: "Respiration", hi: "श्वसन" },
      { en: "Transport", hi: "परिवहन" },
    ],
    why: {
      en: "Getting rid of wastes is excretion; plants often do it by shedding leaves.",
      hi: "अपशिष्ट से छुटकारा पाना उत्सर्जन है; पौधे अक्सर पत्तियाँ गिराकर ऐसा करते हैं।",
    },
  },
};

/** NCERT 6.1: name the life process (nutrition, respiration, transport, excretion) behind an everyday event. */
export const whichLifeProcess = family({
  level: Level.Easy,
  tests: [Concept.WhatAreLifeProcesses],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
