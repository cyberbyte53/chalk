import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "starchMouth",
  "proteinStomach",
  "acid",
  "mucus",
  "emulsify",
  "trypsin",
  "lipase",
  "alkaline",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  starchMouth: {
    prompt: {
      en: "Which enzyme starts breaking down starch in the mouth?",
      hi: "मुँह में मंड तोड़ना कौन-सा एंज़ाइम शुरू करता है?",
    },
    right: { en: "Salivary amylase", hi: "लार एमिलेस" },
    wrong: [
      { en: "Stomach pepsin", hi: "आमाशय का पेप्सिन" },
      { en: "Pancreatic lipase", hi: "अग्न्याशयी लाइपेज़" },
    ],
    why: {
      en: "Saliva contains salivary amylase, which breaks starch into sugar.",
      hi: "लार में लार एमाइलेज़ होता है, जो मंड को शर्करा में तोड़ता है।",
    },
  },
  proteinStomach: {
    prompt: {
      en: "Which enzyme digests protein in the stomach?",
      hi: "आमाशय में प्रोटीन कौन-सा एंज़ाइम पचाता है?",
    },
    right: { en: "Pepsin", hi: "पेप्सिन" },
    wrong: [
      { en: "Salivary amylase", hi: "लार एमाइलेज़" },
      { en: "Lipase", hi: "लाइपेज़" },
    ],
    why: {
      en: "Gastric glands release pepsin, a protein-digesting enzyme.",
      hi: "जठर ग्रंथियाँ पेप्सिन छोड़ती हैं, प्रोटीन पचाने वाला एंज़ाइम।",
    },
  },
  acid: {
    prompt: { en: "What makes the stomach acidic?", hi: "आमाशय को अम्लीय कौन बनाता है?" },
    right: { en: "Hydrochloric acid", hi: "हाइड्रोक्लोरिक अम्ल" },
    wrong: [
      { en: "Bile from the liver", hi: "यकृत का पित्त" },
      { en: "Mucus from the lining", hi: "अस्तर का श्लेष्मा" },
    ],
    why: {
      en: "Gastric glands release hydrochloric acid, which makes the medium acidic for pepsin.",
      hi: "जठर ग्रंथियाँ हाइड्रोक्लोरिक अम्ल छोड़ती हैं, जो पेप्सिन के लिए माध्यम अम्लीय बनाता है।",
    },
  },
  mucus: {
    prompt: {
      en: "What protects the stomach's lining from its own acid?",
      hi: "आमाशय की परत को उसके अपने अम्ल से कौन बचाता है?",
    },
    right: { en: "Mucus", hi: "श्लेष्मा" },
    wrong: [
      { en: "Pepsin", hi: "पेप्सिन" },
      { en: "Trypsin", hi: "ट्रिप्सिन" },
    ],
    why: {
      en: "Mucus protects the inner lining of the stomach from the acid.",
      hi: "श्लेष्मा आमाशय की भीतरी परत को अम्ल से बचाता है।",
    },
  },
  emulsify: {
    prompt: {
      en: "What breaks large fat globules into small droplets?",
      hi: "वसा की बड़ी गोलिकाओं को छोटी बूँदों में कौन तोड़ता है?",
    },
    right: { en: "Bile salts", hi: "पित्त लवण" },
    wrong: [
      { en: "Pepsin", hi: "पेप्सिन" },
      { en: "Hydrochloric acid", hi: "हाइड्रोक्लोरिक अम्ल" },
    ],
    why: {
      en: "Bile salts emulsify fat, so lipase can work on it.",
      hi: "पित्त लवण वसा को इमल्सीकृत करते हैं, ताकि लाइपेज़ उस पर काम कर सके।",
    },
  },
  trypsin: {
    prompt: {
      en: "Which enzyme in pancreatic juice digests proteins?",
      hi: "अग्न्याशयी रस का कौन-सा एंज़ाइम प्रोटीन पचाता है?",
    },
    right: { en: "Trypsin", hi: "ट्रिप्सिन" },
    wrong: [
      { en: "Lipase", hi: "लाइपेज़" },
      { en: "Salivary amylase", hi: "लार एमाइलेज़" },
    ],
    why: {
      en: "Pancreatic juice brings trypsin for proteins and lipase for fats.",
      hi: "अग्न्याशयी रस प्रोटीन के लिए ट्रिप्सिन और वसा के लिए लाइपेज़ लाता है।",
    },
  },
  lipase: {
    prompt: {
      en: "Which enzyme breaks down emulsified fats?",
      hi: "इमल्सीकृत वसा को कौन-सा एंज़ाइम तोड़ता है?",
    },
    right: { en: "Lipase", hi: "लाइपेज़" },
    wrong: [
      { en: "Trypsin", hi: "ट्रिप्सिन" },
      { en: "Pepsin", hi: "पेप्सिन" },
    ],
    why: {
      en: "Lipase, from the pancreas, breaks down emulsified fat.",
      hi: "अग्न्याशय का लाइपेज़ इमल्सीकृत वसा को तोड़ता है।",
    },
  },
  alkaline: {
    prompt: {
      en: "What makes the acidic food from the stomach alkaline in the small intestine?",
      hi: "आमाशय से आए अम्लीय भोजन को क्षुद्रांत्र में क्षारीय कौन बनाता है?",
    },
    right: { en: "Bile from the liver", hi: "यकृत से पित्त" },
    wrong: [
      { en: "Mucus from the stomach", hi: "आमाशय का श्लेष्मा" },
      { en: "Saliva swallowed with it", hi: "साथ निगली गई लार" },
    ],
    why: {
      en: "Bile makes the food alkaline so the pancreatic enzymes can act.",
      hi: "पित्त भोजन को क्षारीय बनाता है ताकि अग्न्याशयी एंज़ाइम काम कर सकें।",
    },
  },
};

/** NCERT 6.2.4: which juice or enzyme does this job in digestion? */
export const digestiveJuice = family({
  level: Level.Medium,
  tests: [Concept.HumanDigestion],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
