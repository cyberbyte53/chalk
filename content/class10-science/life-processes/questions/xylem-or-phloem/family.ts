import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "waterUp",
  "sugarDown",
  "minerals",
  "aminoAcids",
  "springBuds",
  "usesAtp",
  "sieveTubes",
  "tracheids",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  waterUp: {
    prompt: {
      en: "Water moving up from the roots to the leaves: xylem or phloem?",
      hi: "पानी का जड़ों से पत्तियों तक ऊपर जाना: जाइलम या फ़्लोएम?",
    },
    right: { en: "Xylem", hi: "जाइलम" },
    wrong: [{ en: "Phloem", hi: "फ़्लोएम" }],
    why: {
      en: "Xylem carries water and minerals from the soil.",
      hi: "जाइलम मिट्टी से पानी और खनिज ले जाता है।",
    },
  },
  sugarDown: {
    prompt: {
      en: "Sugar made in the leaves moving to the roots: xylem or phloem?",
      hi: "पत्तियों में बनी शर्करा का जड़ों तक जाना: जाइलम या फ़्लोएम?",
    },
    right: { en: "Phloem", hi: "फ़्लोएम" },
    wrong: [{ en: "Xylem", hi: "जाइलम" }],
    why: {
      en: "Phloem carries the products of photosynthesis: translocation.",
      hi: "फ़्लोएम प्रकाश संश्लेषण के उत्पाद ले जाता है: स्थानांतरण।",
    },
  },
  minerals: {
    prompt: {
      en: "Minerals dissolved in water moving up the stem: xylem or phloem?",
      hi: "पानी में घुले खनिजों का तने में ऊपर जाना: जाइलम या फ़्लोएम?",
    },
    right: { en: "Xylem", hi: "जाइलम" },
    wrong: [{ en: "Phloem", hi: "फ़्लोएम" }],
    why: { en: "Minerals travel with water in the xylem.", hi: "खनिज पानी के साथ जाइलम में जाते हैं।" },
  },
  aminoAcids: {
    prompt: {
      en: "Amino acids moving to the growing parts: xylem or phloem?",
      hi: "अमीनो अम्लों का बढ़ते भागों तक जाना: जाइलम या फ़्लोएम?",
    },
    right: { en: "Phloem", hi: "फ़्लोएम" },
    wrong: [{ en: "Xylem", hi: "जाइलम" }],
    why: {
      en: "Besides sugar, the phloem carries amino acids and other substances.",
      hi: "शर्करा के अलावा फ़्लोएम अमीनो अम्ल और दूसरे पदार्थ भी ले जाता है।",
    },
  },
  springBuds: {
    prompt: {
      en: "Stored sugar moving up to the buds in spring: xylem or phloem?",
      hi: "बसंत में जमा शर्करा का कलियों तक ऊपर जाना: जाइलम या फ़्लोएम?",
    },
    right: { en: "Phloem", hi: "फ़्लोएम" },
    wrong: [{ en: "Xylem", hi: "जाइलम" }],
    why: {
      en: "Phloem can move food upwards as well as downwards.",
      hi: "फ़्लोएम भोजन को ऊपर भी ले जा सकता है और नीचे भी।",
    },
  },
  usesAtp: {
    prompt: {
      en: "Transport that uses energy from ATP: xylem or phloem?",
      hi: "वह परिवहन जो ATP की ऊर्जा लेता है: जाइलम या फ़्लोएम?",
    },
    right: { en: "Phloem", hi: "फ़्लोएम" },
    wrong: [{ en: "Xylem", hi: "जाइलम" }],
    why: {
      en: "Sucrose is loaded into the phloem using ATP; xylem works by physical forces.",
      hi: "सुक्रोज़ ATP से फ़्लोएम में भरा जाता है; जाइलम भौतिक बलों से चलता है।",
    },
  },
  sieveTubes: {
    prompt: {
      en: "Sieve tubes and companion cells belong to the…",
      hi: "चालनी नलिकाएँ और सहचर कोशिकाएँ किसका भाग हैं…",
    },
    right: { en: "Phloem", hi: "फ़्लोएम" },
    wrong: [{ en: "Xylem", hi: "जाइलम" }],
    why: {
      en: "Translocation happens in the sieve tubes of the phloem, helped by companion cells.",
      hi: "स्थानांतरण फ़्लोएम की चालनी नलिकाओं में, सहचर कोशिकाओं की मदद से होता है।",
    },
  },
  tracheids: {
    prompt: {
      en: "Vessels and tracheids that form continuous water channels belong to the…",
      hi: "पानी की लगातार नालियाँ बनाने वाली वाहिकाएँ और वाहिनिकाएँ किसका भाग हैं…",
    },
    right: { en: "Xylem", hi: "जाइलम" },
    wrong: [{ en: "Phloem", hi: "फ़्लोएम" }],
    why: {
      en: "Xylem vessels and tracheids join into one continuous water-conducting system.",
      hi: "जाइलम की वाहिकाएँ और वाहिनिकाएँ जुड़कर एक लगातार जल-संवहन तंत्र बनाती हैं।",
    },
  },
};

/** NCERT 6.4.2: is this carried out by the xylem or the phloem? */
export const xylemOrPhloem = family({
  level: Level.Easy,
  tests: [Concept.TransportInPlants],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
