import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["segregate", "kulhad", "paperCup", "ewaste", "sewage"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  segregate: {
    prompt: {
      en: "Why keep wet and dry waste in separate bins?",
      hi: "गीला और सूखा कचरा अलग कूड़ेदानों में क्यों रखें?",
    },
    right: { en: "So each can be treated properly", hi: "ताकि हर एक का सही उपचार हो" },
    wrong: [
      { en: "So the bins look neater at home", hi: "ताकि घर में कूड़ेदान साफ़ दिखें" },
      { en: "So the dry waste rots faster", hi: "ताकि सूखा कचरा जल्दी सड़े" },
    ],
    why: {
      en: "Segregated, wet waste can be composted and dry waste recycled or disposed of safely.",
      hi: "अलग रखने पर गीले की खाद और सूखे का पुनर्चक्रण या सुरक्षित निपटान हो सकता है।",
    },
  },
  kulhad: {
    prompt: {
      en: "Why were clay kulhads not a good large-scale answer?",
      hi: "मिट्टी के कुल्हड़ बड़े पैमाने पर अच्छा उपाय क्यों नहीं थे?",
    },
    right: { en: "They'd use up fertile topsoil", hi: "उपजाऊ ऊपरी मिट्टी ख़त्म होती" },
    wrong: [
      { en: "They never break down at all", hi: "वे कभी टूटते नहीं" },
      { en: "Tea tastes bad in clay", hi: "मिट्टी में चाय बुरी लगती है" },
    ],
    why: {
      en: "Making them in huge numbers would mean losing fertile topsoil.",
      hi: "बहुत बड़ी संख्या में बनाने से उपजाऊ ऊपरी मिट्टी ख़त्म होती।",
    },
  },
  paperCup: {
    prompt: {
      en: "An advantage of paper cups over plastic ones is that paper…",
      hi: "प्लास्टिक के मुक़ाबले काग़ज़ के कप का एक फ़ायदा है कि काग़ज़…",
    },
    right: { en: "Is biodegradable", hi: "जैव निम्नीकरणीय है" },
    wrong: [
      { en: "Lasts much longer", hi: "बहुत ज़्यादा टिकता है" },
      { en: "Can't be recycled", hi: "पुनर्चक्रित नहीं होता" },
    ],
    why: {
      en: "Paper is broken down by decomposers; plastic persists.",
      hi: "काग़ज़ को अपघटक तोड़ देते हैं; प्लास्टिक बना रहता है।",
    },
  },
  ewaste: {
    prompt: {
      en: "Old phones and computers need careful disposal because they…",
      hi: "पुराने फ़ोन और कंप्यूटर को सावधानी से फेंकना चाहिए क्योंकि उनमें…",
    },
    right: { en: "Contain hazardous materials", hi: "ख़तरनाक पदार्थ होते हैं" },
    wrong: [
      { en: "Rot and smell quickly", hi: "जल्दी सड़न और बदबू होती है" },
      { en: "Contain lots of food", hi: "ढेर सारा भोजन होता है" },
    ],
    why: {
      en: "E-waste has hazardous materials that harm the environment if dumped.",
      hi: "ई-कचरे में ख़तरनाक पदार्थ होते हैं जो फेंकने पर पर्यावरण को नुकसान पहुँचाते हैं।",
    },
  },
  sewage: {
    prompt: {
      en: "Sewage should be treated before it reaches a river so that…",
      hi: "सीवेज का नदी तक पहुँचने से पहले उपचार होना चाहिए ताकि…",
    },
    right: { en: "The river isn't polluted", hi: "नदी प्रदूषित न हो" },
    wrong: [
      { en: "The river flows faster", hi: "नदी तेज़ बहे" },
      { en: "The fish grow bigger", hi: "मछलियाँ बड़ी हों" },
    ],
    why: {
      en: "Untreated sewage pollutes local water bodies.",
      hi: "बिना उपचार का सीवेज स्थानीय जल-स्रोतों को प्रदूषित करता है।",
    },
  },
};

/** NCERT 15.2.2: segregation, local bodies, sewage, disposable cups, e-waste, recycling. */
export const wasteManagement = family({
  level: Level.Medium,
  tests: [Concept.ManagingGarbage],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
