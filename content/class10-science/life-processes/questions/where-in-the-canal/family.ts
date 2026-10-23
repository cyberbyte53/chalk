import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = [
  "starchBegins",
  "proteinBegins",
  "fat",
  "absorbed",
  "water",
  "longest",
  "pipe",
] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  starchBegins: {
    prompt: { en: "Where does the digestion of starch begin?", hi: "मंड का पाचन कहाँ शुरू होता है?" },
    right: { en: "Mouth", hi: "मुँह" },
    wrong: [
      { en: "Stomach", hi: "आमाशय" },
      { en: "Large intestine", hi: "बृहदांत्र" },
    ],
    why: {
      en: "Salivary amylase starts on starch in the mouth.",
      hi: "लार एमाइलेज़ मुँह में मंड पर काम शुरू करता है।",
    },
  },
  proteinBegins: {
    prompt: {
      en: "Where does the digestion of protein begin?",
      hi: "प्रोटीन का पाचन कहाँ शुरू होता है?",
    },
    right: { en: "Stomach", hi: "आमाशय" },
    wrong: [
      { en: "Mouth", hi: "मुँह" },
      { en: "Large intestine", hi: "बृहदांत्र" },
    ],
    why: {
      en: "Pepsin in the stomach starts digesting protein.",
      hi: "आमाशय का पेप्सिन प्रोटीन पचाना शुरू करता है।",
    },
  },
  fat: {
    prompt: { en: "Where are fats digested?", hi: "वसा कहाँ पचती है?" },
    right: { en: "Small intestine", hi: "क्षुद्रांत्र" },
    wrong: [
      { en: "Stomach, by acid", hi: "आमाशय, अम्ल से" },
      { en: "Mouth, by saliva", hi: "मुँह, लार से" },
    ],
    why: {
      en: "Bile and lipase digest fat in the small intestine.",
      hi: "पित्त और लाइपेज़ क्षुद्रांत्र में वसा पचाते हैं।",
    },
  },
  absorbed: {
    prompt: {
      en: "Where is digested food absorbed into the blood?",
      hi: "पचा हुआ भोजन रुधिर में कहाँ सोखा जाता है?",
    },
    right: { en: "Small intestine, via the villi", hi: "क्षुद्रांत्र, दीर्घरोमों से" },
    wrong: [
      { en: "Stomach, through its walls", hi: "आमाशय, उसकी भित्ति से" },
      { en: "Oesophagus, as food passes", hi: "ग्रसिका, भोजन गुज़रते समय" },
    ],
    why: {
      en: "Villi in the small intestine absorb digested food into the blood.",
      hi: "क्षुद्रांत्र के दीर्घरोम पचे भोजन को रुधिर में सोखते हैं।",
    },
  },
  water: {
    prompt: {
      en: "Where is extra water absorbed from the undigested leftovers?",
      hi: "बिना पचे बचे पदार्थ से अतिरिक्त पानी कहाँ सोखा जाता है?",
    },
    right: { en: "Large intestine", hi: "बृहदांत्र" },
    wrong: [
      { en: "Small intestine", hi: "क्षुद्रांत्र" },
      { en: "Stomach", hi: "आमाशय" },
    ],
    why: {
      en: "The walls of the large intestine absorb more water from the leftovers.",
      hi: "बृहदांत्र की दीवारें बचे पदार्थ से और पानी सोखती हैं।",
    },
  },
  longest: {
    prompt: {
      en: "Which is the longest part of the alimentary canal?",
      hi: "आहार नाल का सबसे लंबा भाग कौन-सा है?",
    },
    right: { en: "Small intestine", hi: "क्षुद्रांत्र" },
    wrong: [
      { en: "Large intestine", hi: "बृहदांत्र" },
      { en: "Oesophagus", hi: "ग्रसिका" },
    ],
    why: {
      en: "The small intestine is the longest part, coiled to fit.",
      hi: "क्षुद्रांत्र सबसे लंबा भाग है, जो कुंडलित होकर समाता है।",
    },
  },
  pipe: {
    prompt: {
      en: "Through which tube does food go from the mouth to the stomach?",
      hi: "भोजन मुँह से आमाशय तक किस नली से जाता है?",
    },
    right: { en: "Oesophagus (food-pipe)", hi: "ग्रसिका (भोजन-नली)" },
    wrong: [
      { en: "Trachea (windpipe)", hi: "श्वासनली (वायु-नली)" },
      { en: "Ureter (urine tube)", hi: "मूत्रवाहिनी (मूत्र-नली)" },
    ],
    why: {
      en: "The food-pipe, or oesophagus, carries food to the stomach by peristalsis.",
      hi: "भोजन-नली, या ग्रसिका, क्रमाकुंचन से भोजन को आमाशय तक ले जाती है।",
    },
  },
};

/** NCERT 6.2.4: in which part of the alimentary canal does this happen? */
export const whereInTheCanal = family({
  level: Level.Medium,
  tests: [Concept.HumanDigestion],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
