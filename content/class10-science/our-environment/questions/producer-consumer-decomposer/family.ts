import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["grass", "fungi", "crow", "lice", "noDecomposers"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  grass: {
    prompt: { en: "Grass in a meadow is a…", hi: "घास के मैदान में घास क्या है?" },
    right: { en: "Producer", hi: "उत्पादक" },
    wrong: [
      { en: "Consumer", hi: "उपभोक्ता" },
      { en: "Decomposer", hi: "अपघटक" },
    ],
    why: {
      en: "Green plants make food by photosynthesis: they are producers.",
      hi: "हरे पौधे प्रकाश संश्लेषण से भोजन बनाते हैं: ये उत्पादक हैं।",
    },
  },
  fungi: {
    prompt: { en: "Fungi breaking down a fallen log are…", hi: "गिरे तने को तोड़ते कवक क्या हैं?" },
    right: { en: "Decomposers", hi: "अपघटक" },
    wrong: [
      { en: "Producers", hi: "उत्पादक" },
      { en: "Herbivores", hi: "शाकाहारी" },
    ],
    why: {
      en: "Bacteria and fungi break down dead remains: they are decomposers.",
      hi: "जीवाणु और कवक मृत अवशेषों को तोड़ते हैं: ये अपघटक हैं।",
    },
  },
  crow: {
    prompt: {
      en: "A crow eats both grain and insects. It is…",
      hi: "कौआ अनाज और कीड़े दोनों खाता है। यह क्या है?",
    },
    right: { en: "An omnivore", hi: "सर्वाहारी" },
    wrong: [
      { en: "A herbivore", hi: "शाकाहारी" },
      { en: "A carnivore", hi: "मांसाहारी" },
    ],
    why: {
      en: "Eating both plants and animals makes it an omnivore.",
      hi: "पौधे और जंतु दोनों खाने वाला सर्वाहारी है।",
    },
  },
  lice: {
    prompt: {
      en: "A louse living on a dog and feeding on its blood is…",
      hi: "कुत्ते पर रहकर उसका ख़ून चूसने वाली जूँ क्या है?",
    },
    right: { en: "A parasite", hi: "परजीवी" },
    wrong: [
      { en: "A decomposer", hi: "अपघटक" },
      { en: "A producer", hi: "उत्पादक" },
    ],
    why: {
      en: "It lives on another organism and feeds from it: a parasite, a kind of consumer.",
      hi: "यह दूसरे जीव पर रहकर उससे भोजन लेती है: परजीवी, एक तरह का उपभोक्ता।",
    },
  },
  noDecomposers: {
    prompt: {
      en: "With no decomposers, what would stop happening?",
      hi: "अपघटक न हों तो क्या होना रुक जाएगा?",
    },
    right: { en: "Soil getting its nutrients back", hi: "मिट्टी को पोषक वापस मिलना" },
    wrong: [
      { en: "Plants making food from sunlight", hi: "पौधों का धूप से भोजन बनाना" },
      { en: "Animals eating the plants", hi: "जंतुओं का पौधे खाना" },
    ],
    why: {
      en: "Decomposers return simple substances from dead matter to the soil; without them the soil isn't replenished.",
      hi: "अपघटक मृत पदार्थ से सरल पदार्थ मिट्टी में लौटाते हैं; उनके बिना मिट्टी फिर से भरती नहीं।",
    },
  },
};

/** NCERT 15.1: producers, consumers (herbivores, carnivores, omnivores, parasites) and decomposers. */
export const producerConsumerDecomposer = family({
  level: Level.Medium,
  tests: [Concept.WhatIsAnEcosystem],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
