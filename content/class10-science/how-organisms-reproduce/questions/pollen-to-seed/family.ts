import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["pollVsFert", "cross", "tube", "ovuleBecomes", "ovaryBecomes", "radicle"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  pollVsFert: {
    prompt: {
      en: "How is pollination different from fertilisation?",
      hi: "परागण, निषेचन से कैसे भिन्न है?",
    },
    right: {
      en: "Pollination moves pollen to the stigma; fertilisation fuses germ cells",
      hi: "परागण पराग को वर्तिकाग्र तक ले जाता है; निषेचन जनन कोशिकाओं को मिलाता है",
    },
    wrong: [
      { en: "They are two names for the same single step", hi: "ये एक ही चरण के दो नाम हैं" },
      {
        en: "Fertilisation moves pollen; pollination fuses the germ cells",
        hi: "निषेचन पराग ले जाता है; परागण जनन कोशिकाओं को मिलाता है",
      },
    ],
    why: {
      en: "First pollen reaches the stigma (pollination); then a pollen tube carries the male germ cell to the egg, and they fuse (fertilisation).",
      hi: "पहले पराग वर्तिकाग्र पर पहुँचता है (परागण); फिर पराग नली नर जनन कोशिका को अंड तक ले जाती है, और वे मिलते हैं (निषेचन)।",
    },
  },
  cross: {
    prompt: {
      en: "Pollen from one flower is carried by wind to the stigma of another flower. This is:",
      hi: "एक फूल का पराग हवा से दूसरे फूल के वर्तिकाग्र तक पहुँचता है। यह है:",
    },
    right: { en: "Cross-pollination", hi: "पर-परागण" },
    wrong: [
      { en: "Self-pollination", hi: "स्व-परागण" },
      { en: "Fertilisation", hi: "निषेचन" },
    ],
    why: {
      en: "Transfer of pollen from one flower to another is cross-pollination, by agents like wind, water or animals.",
      hi: "एक फूल से दूसरे फूल तक पराग पहुँचना पर-परागण है, हवा, पानी या जंतुओं के ज़रिए।",
    },
  },
  tube: {
    prompt: {
      en: "After landing on the stigma, how does the male germ cell reach the ovary?",
      hi: "वर्तिकाग्र पर पहुँचकर नर जनन कोशिका अंडाशय तक कैसे पहुँचती है?",
    },
    right: {
      en: "A tube grows from the pollen grain down the style",
      hi: "परागकण से एक नली वर्तिका से होकर नीचे बढ़ती है",
    },
    wrong: [
      {
        en: "Bees carry it down the inside of the style into the ovary",
        hi: "मधुमक्खियाँ उसे वर्तिका के भीतर से अंडाशय तक ले जाती हैं",
      },
      {
        en: "It swims down through the petals in nectar",
        hi: "यह मकरंद में तैरकर पंखुड़ियों से नीचे जाती है",
      },
    ],
    why: {
      en: "A pollen tube grows out of the pollen grain and travels through the style to reach the ovary.",
      hi: "परागकण से एक पराग नली निकलकर वर्तिका से होकर अंडाशय तक पहुँचती है।",
    },
  },
  ovuleBecomes: {
    prompt: {
      en: "After fertilisation, the ovule develops a tough coat and becomes the:",
      hi: "निषेचन के बाद बीजांड पर कठोर आवरण बनता है और वह बनता है:",
    },
    right: { en: "Seed", hi: "बीज" },
    wrong: [
      { en: "Fruit", hi: "फल" },
      { en: "Petal", hi: "दल" },
      { en: "Stigma", hi: "वर्तिकाग्र" },
    ],
    why: {
      en: "The ovule becomes the seed; the ovary ripens into the fruit.",
      hi: "बीजांड बीज बनता है; अंडाशय पककर फल बनता है।",
    },
  },
  ovaryBecomes: {
    prompt: {
      en: "After fertilisation, the ovary grows rapidly and ripens to form the:",
      hi: "निषेचन के बाद अंडाशय तेज़ी से बढ़कर पकता है और बनाता है:",
    },
    right: { en: "Fruit", hi: "फल" },
    wrong: [
      { en: "Seed", hi: "बीज" },
      { en: "Embryo", hi: "भ्रूण" },
    ],
    why: {
      en: "The ovary becomes the fruit, which holds the seeds.",
      hi: "अंडाशय फल बनता है, जिसमें बीज होते हैं।",
    },
  },
  radicle: {
    prompt: {
      en: "In a germinating chana seed, the part that becomes the root is the:",
      hi: "अंकुरित होते चने के बीज में जड़ बनने वाला भाग है:",
    },
    right: { en: "Radicle", hi: "मूलांकुर" },
    wrong: [
      { en: "Plumule", hi: "प्रांकुर" },
      { en: "Cotyledon", hi: "बीजपत्र" },
    ],
    why: {
      en: "The radicle becomes the root, the plumule the shoot, and the cotyledons store food.",
      hi: "मूलांकुर जड़ बनता है, प्रांकुर प्ररोह, और बीजपत्र भोजन संग्रह करते हैं।",
    },
  },
};

/** NCERT 8.3.2, Figs 8.8–8.9: pollination (self, cross, agents), pollen tube, fertilisation, what becomes the seed and fruit, and germination. */
export const pollenToSeed = family({
  level: Level.Medium,
  tests: [Concept.FloweringPlants],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
